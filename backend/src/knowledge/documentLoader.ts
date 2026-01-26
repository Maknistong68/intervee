// Document Loader - Reads full legal documents at runtime
// NO DATABASE REQUIRED - parses .txt files directly

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface LoadedSection {
  id: string;
  sectionNumber: string;
  title: string;
  content: string;
  contentLower: string; // For fast search
  lawId: string;
  lawName: string;
  lawType: 'ra' | 'oshs_rule' | 'do' | 'la' | 'da';
  chapterId?: string;
  chapterTitle?: string;
  keywords: string[];
}

export interface LoadedLaw {
  id: string;
  name: string;
  title: string;
  type: 'ra' | 'oshs_rule' | 'do' | 'la' | 'da';
  sections: LoadedSection[];
  fullText: string;
}

// In-memory storage
let LOADED_LAWS: Map<string, LoadedLaw> = new Map();
let LOADED_SECTIONS: LoadedSection[] = [];
let isLoaded = false;

/**
 * Load all documents from the documents folder
 */
export function loadDocuments(): void {
  if (isLoaded) return;

  const docsPath = path.join(__dirname, 'documents');
  const folders = ['rules', 'ra', 'do', 'la', 'da'];

  console.log('[DocumentLoader] Loading legal documents...');

  for (const folder of folders) {
    const folderPath = path.join(docsPath, folder);
    if (!fs.existsSync(folderPath)) continue;

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.txt'));

    for (const file of files) {
      try {
        const filePath = path.join(folderPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const law = parseDocument(file, folder, content);

        if (law) {
          LOADED_LAWS.set(law.id, law);
          LOADED_SECTIONS.push(...law.sections);
        }
      } catch (error) {
        console.error(`[DocumentLoader] Error loading ${file}:`, error);
      }
    }
  }

  isLoaded = true;
  console.log(`[DocumentLoader] Loaded ${LOADED_LAWS.size} laws, ${LOADED_SECTIONS.length} sections`);
}

/**
 * Parse a document file
 */
function parseDocument(filename: string, folder: string, content: string): LoadedLaw | null {
  const match = filename.match(/^(RULE|RA|DO|LA|DA)_(\d+)/i);
  if (!match) return null;

  const prefix = match[1].toLowerCase();
  const number = match[2];
  const lawId = `${prefix}${number}`;

  const typeMap: Record<string, 'ra' | 'oshs_rule' | 'do' | 'la' | 'da'> = {
    rule: 'oshs_rule', ra: 'ra', do: 'do', la: 'la', da: 'da',
  };

  const nameMap: Record<string, string> = {
    rule: `Rule ${number}`, ra: `RA ${number}`, do: `DO ${number}`,
    la: `LA ${number}`, da: `DA ${number}`,
  };

  // Extract title
  let title = nameMap[prefix];
  const titlePatterns = [
    /OSHS RULE \d+:\s*(.+?)(?:\n|$)/i,
    /AN ACT\s+(.+?)(?:\n|Approved)/is,
    /"([^"]+)"/,
  ];
  for (const pattern of titlePatterns) {
    const m = content.match(pattern);
    if (m) {
      title = m[1].trim().substring(0, 150);
      break;
    }
  }

  // Parse sections
  const sections = parseSections(content, lawId, nameMap[prefix], typeMap[prefix]);

  return {
    id: lawId,
    name: nameMap[prefix],
    title,
    type: typeMap[prefix],
    sections,
    fullText: content,
  };
}

/**
 * Parse sections from content
 */
function parseSections(
  content: string,
  lawId: string,
  lawName: string,
  lawType: 'ra' | 'oshs_rule' | 'do' | 'la' | 'da'
): LoadedSection[] {
  const sections: LoadedSection[] = [];
  let currentChapter = '';
  let currentChapterTitle = '';

  // Find section markers
  const markers: { index: number; number: string; title: string; type: string }[] = [];

  // SECTION X: Title
  let match;
  const sectionPattern = /^SECTION\s+(\d+(?:\.\d+)?)[.:]\s*(.*)$/gim;
  while ((match = sectionPattern.exec(content)) !== null) {
    markers.push({ index: match.index, number: match[1], title: match[2]?.trim() || '', type: 'section' });
  }

  // 1031.01 Subsections (OSHS rules)
  const subsectionPattern = /^(\d{4}\.\d{2})\s+(.{0,100})/gim;
  while ((match = subsectionPattern.exec(content)) !== null) {
    markers.push({ index: match.index, number: match[1], title: match[2]?.trim() || '', type: 'subsection' });
  }

  // CHAPTER markers
  const chapterPattern = /^CHAPTER\s+([IVX]+|\d+)[.:]*\s*(.*)$/gim;
  while ((match = chapterPattern.exec(content)) !== null) {
    markers.push({ index: match.index, number: `Ch${match[1]}`, title: match[2]?.trim() || '', type: 'chapter' });
  }

  markers.sort((a, b) => a.index - b.index);

  // Extract content for each section
  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];

    if (marker.type === 'chapter') {
      currentChapter = marker.number;
      currentChapterTitle = marker.title;
      continue;
    }

    const endIndex = i < markers.length - 1 ? markers[i + 1].index : content.length;
    let sectionContent = content.substring(marker.index, endIndex)
      .replace(/={40,}/g, '').replace(/-{40,}/g, '').trim();

    if (sectionContent.length < 20) continue;

    const sectionId = `${lawId}-s${marker.number}`;
    const sectionNumber = marker.type === 'subsection' ? `Section ${marker.number}` : `Section ${marker.number}`;

    sections.push({
      id: sectionId,
      sectionNumber,
      title: marker.title,
      content: sectionContent,
      contentLower: sectionContent.toLowerCase(),
      lawId,
      lawName,
      lawType,
      chapterId: currentChapter || undefined,
      chapterTitle: currentChapterTitle || undefined,
      keywords: extractKeywords(sectionContent),
    });
  }

  // If no sections, create one for full document
  if (sections.length === 0) {
    sections.push({
      id: `${lawId}-full`,
      sectionNumber: lawId.toUpperCase(),
      title: '',
      content: content.substring(0, 10000), // Limit size
      contentLower: content.substring(0, 10000).toLowerCase(),
      lawId,
      lawName,
      lawType,
      keywords: extractKeywords(content.substring(0, 5000)),
    });
  }

  return sections;
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'of', 'in', 'to', 'for', 'and', 'or', 'is', 'are', 'shall', 'may',
    'be', 'with', 'by', 'on', 'at', 'from', 'as', 'this', 'that', 'which', 'their', 'any',
  ]);

  return [...new Set(
    text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w))
  )].slice(0, 50);
}

// ==========================================
// SEARCH FUNCTIONS
// ==========================================

/**
 * Search sections by query
 */
export function searchSections(query: string, limit = 5): LoadedSection[] {
  loadDocuments(); // Ensure loaded

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

  // Score each section
  const scored = LOADED_SECTIONS.map(section => {
    let score = 0;

    // Exact phrase match (highest weight)
    if (section.contentLower.includes(queryLower)) {
      score += 10;
    }

    // Word matches
    for (const word of queryWords) {
      if (section.contentLower.includes(word)) {
        score += 1;
      }
      if (section.keywords.includes(word)) {
        score += 2;
      }
      if (section.sectionNumber.toLowerCase().includes(word)) {
        score += 5;
      }
      if (section.lawName.toLowerCase().includes(word)) {
        score += 3;
      }
    }

    return { section, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.section);
}

/**
 * Search by section number (e.g., "Section 28", "1031.01")
 */
export function searchBySection(sectionNum: string): LoadedSection[] {
  loadDocuments();

  const normalized = sectionNum.toLowerCase().replace(/section\s*/i, '').trim();

  return LOADED_SECTIONS.filter(s =>
    s.sectionNumber.toLowerCase().includes(normalized) ||
    s.id.toLowerCase().includes(normalized)
  );
}

/**
 * Search by law ID (e.g., "ra11058", "rule1030", "do252")
 */
export function searchByLaw(lawId: string): LoadedSection[] {
  loadDocuments();

  const normalized = lawId.toLowerCase().replace(/[\s-]/g, '');
  return LOADED_SECTIONS.filter(s => s.lawId.toLowerCase() === normalized);
}

/**
 * Get law by ID
 */
export function getLaw(lawId: string): LoadedLaw | undefined {
  loadDocuments();
  return LOADED_LAWS.get(lawId.toLowerCase());
}

/**
 * Get all loaded laws
 */
export function getAllLaws(): LoadedLaw[] {
  loadDocuments();
  return Array.from(LOADED_LAWS.values());
}

/**
 * Format sections as knowledge context for GPT
 */
export function formatSectionsAsKnowledge(sections: LoadedSection[]): string {
  if (sections.length === 0) {
    return '';
  }

  return sections.map((s, i) => {
    let text = `### Source ${i + 1}: ${s.lawName}, ${s.sectionNumber}`;
    if (s.title) text += ` - ${s.title}`;
    text += `\n\n${s.content}`;
    return text;
  }).join('\n\n---\n\n');
}

/**
 * Get relevant knowledge for a question (main entry point)
 */
export function getRelevantKnowledge(question: string, topic?: string): string {
  loadDocuments();

  const sections: LoadedSection[] = [];

  // 1. Check for specific law references in question
  const lawRefs = extractLawReferences(question);
  for (const ref of lawRefs) {
    sections.push(...searchByLaw(ref).slice(0, 3));
  }

  // 2. Check for section references
  const sectionRefs = extractSectionReferences(question);
  for (const ref of sectionRefs) {
    sections.push(...searchBySection(ref));
  }

  // 3. General search
  if (sections.length < 5) {
    const searchResults = searchSections(question, 5 - sections.length);
    sections.push(...searchResults);
  }

  // Deduplicate
  const unique = [...new Map(sections.map(s => [s.id, s])).values()];

  if (unique.length === 0) {
    return ''; // Fall back to legacy OSH_KNOWLEDGE
  }

  return `\n## REFERENCE DATA (From Full Legal Documents):\n\n${formatSectionsAsKnowledge(unique.slice(0, 5))}`;
}

/**
 * Extract law references from text
 */
function extractLawReferences(text: string): string[] {
  const refs: string[] = [];
  const patterns = [
    /\b(?:RA|R\.A\.?)\s*(\d+)/gi,
    /\bRule\s*(\d{4})/gi,
    /\bDO\s*(\d+)/gi,
    /\bLA\s*(\d+)/gi,
    /\bDA\s*(\d+)/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const prefix = pattern.source.includes('RA') ? 'ra' :
        pattern.source.includes('Rule') ? 'rule' :
        pattern.source.includes('DO') ? 'do' :
        pattern.source.includes('LA') ? 'la' : 'da';
      refs.push(`${prefix}${match[1]}`);
    }
  }

  return [...new Set(refs)];
}

/**
 * Extract section references from text
 */
function extractSectionReferences(text: string): string[] {
  const refs: string[] = [];

  // "Section 28" or "Section 1031.01"
  const sectionPattern = /\bSection\s*(\d+(?:\.\d+)?)/gi;
  let match;
  while ((match = sectionPattern.exec(text)) !== null) {
    refs.push(match[1]);
  }

  return [...new Set(refs)];
}

// Auto-load on import
loadDocuments();
