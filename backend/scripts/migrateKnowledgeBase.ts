#!/usr/bin/env ts-node
/**
 * Migration Script: Transform OSH Knowledge Base to Database Structure
 *
 * This script:
 * 1. Enables pgvector extension
 * 2. Parses existing OSH_KNOWLEDGE object
 * 3. Parses full text documents from knowledge/documents/
 * 4. Generates embeddings for each section
 * 5. Stores in database with proper relationships
 *
 * Usage:
 *   npx ts-node scripts/migrateKnowledgeBase.ts
 *
 * Environment:
 *   DATABASE_URL - PostgreSQL connection string
 *   OPENAI_API_KEY - For generating embeddings
 */

import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Handle ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Import after PrismaClient to avoid circular dependencies
let embeddingService: any;
let OSH_KNOWLEDGE: any;
let convertLegacyToLegalSection: any;

async function loadDependencies() {
  const embeddingModule = await import('../src/services/embeddingService.js');
  embeddingService = embeddingModule.embeddingService;

  const knowledgeModule = await import('../src/knowledge/oshKnowledgeBase.js');
  OSH_KNOWLEDGE = knowledgeModule.OSH_KNOWLEDGE;

  const compatModule = await import('../src/knowledge/compatibilityLayer.js');
  convertLegacyToLegalSection = compatModule.convertLegacyToLegalSection;
}

// Document folder paths
const DOCUMENTS_PATH = path.join(__dirname, '../src/knowledge/documents');

interface ParsedDocument {
  lawId: string;
  lawName: string;
  title: string;
  type: 'ra' | 'oshs_rule' | 'do' | 'la' | 'da';
  sections: ParsedSection[];
}

interface ParsedSection {
  sectionNumber: string;
  title?: string;
  content: string;
  chapterId?: string;
  chapterTitle?: string;
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('='.repeat(60));
  console.log('OSH Knowledge Base Migration');
  console.log('='.repeat(60));

  try {
    // Load dependencies
    console.log('\n[1/7] Loading dependencies...');
    await loadDependencies();
    console.log('  ✓ Dependencies loaded');

    // Step 1: Enable pgvector extension
    console.log('\n[2/7] Enabling pgvector extension...');
    await enablePgVector();
    console.log('  ✓ pgvector extension enabled');

    // Step 2: Create laws from legacy knowledge
    console.log('\n[3/7] Creating laws from legacy knowledge base...');
    const lawCount = await createLawsFromLegacy();
    console.log(`  ✓ Created ${lawCount} laws`);

    // Step 3: Parse and create sections from full text documents
    console.log('\n[4/7] Parsing full text documents...');
    const docCount = await parseFullTextDocuments();
    console.log(`  ✓ Parsed ${docCount} documents`);

    // Step 4: Create sections from legacy knowledge
    console.log('\n[5/7] Creating sections from legacy knowledge...');
    const sectionCount = await createSectionsFromLegacy();
    console.log(`  ✓ Created ${sectionCount} sections`);

    // Step 5: Generate embeddings
    console.log('\n[6/7] Generating embeddings...');
    const embeddingCount = await generateEmbeddings();
    console.log(`  ✓ Generated ${embeddingCount} embeddings`);

    // Step 6: Create indexes
    console.log('\n[7/7] Creating vector index...');
    await createVectorIndex();
    console.log('  ✓ Vector index created');

    console.log('\n' + '='.repeat(60));
    console.log('Migration completed successfully!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n[ERROR] Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Enable pgvector extension
 */
async function enablePgVector() {
  try {
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector`;
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('  (pgvector already enabled)');
    } else {
      throw error;
    }
  }
}

/**
 * Create Law entries from legacy OSH_KNOWLEDGE
 */
async function createLawsFromLegacy(): Promise<number> {
  const laws: any[] = [];

  for (const [key, data] of Object.entries(OSH_KNOWLEDGE)) {
    const lawData = parseLawKey(key, data as any);
    if (lawData) {
      laws.push(lawData);
    }
  }

  // Upsert laws
  for (const law of laws) {
    await prisma.law.upsert({
      where: { lawId: law.lawId },
      update: law,
      create: law,
    });
  }

  return laws.length;
}

/**
 * Parse law key into Law data
 */
function parseLawKey(key: string, data: any): any | null {
  const typeMatch = key.match(/^(rule|ra|do|la|da)(\d+)/i);
  if (!typeMatch) return null;

  const prefix = typeMatch[1].toLowerCase();
  const number = typeMatch[2];

  const typeMap: Record<string, any> = {
    rule: 'OSHS_RULE',
    ra: 'RA',
    do: 'DO',
    la: 'LA',
    da: 'DA',
  };

  const nameMap: Record<string, string> = {
    rule: `OSHS Rule ${number}`,
    ra: `Republic Act No. ${number}`,
    do: `Department Order No. ${number}`,
    la: `Labor Advisory No. ${number}`,
    da: `Department Advisory No. ${number}`,
  };

  const shortNameMap: Record<string, string> = {
    rule: `Rule ${number}`,
    ra: `RA ${number}`,
    do: `DO ${number}`,
    la: `LA ${number}`,
    da: `DA ${number}`,
  };

  return {
    lawId: key,
    type: typeMap[prefix],
    name: nameMap[prefix],
    shortName: shortNameMap[prefix],
    title: data.title || shortNameMap[prefix],
    description: data.description || null,
    keywords: data.keywords || [],
    status: 'CURRENT',
  };
}

/**
 * Parse full text documents from files
 */
async function parseFullTextDocuments(): Promise<number> {
  let count = 0;

  // Check if documents folder exists
  if (!fs.existsSync(DOCUMENTS_PATH)) {
    console.log('  (No documents folder found, skipping)');
    return 0;
  }

  // Process each subfolder
  const folders = ['rules', 'ra', 'do', 'la', 'da'];
  for (const folder of folders) {
    const folderPath = path.join(DOCUMENTS_PATH, folder);
    if (!fs.existsSync(folderPath)) continue;

    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      if (!file.endsWith('.txt')) continue;

      const filePath = path.join(folderPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      const doc = parseDocumentFile(file, folder, content);
      if (doc) {
        await saveDocument(doc);
        count++;
        console.log(`  - Parsed: ${file}`);
      }
    }
  }

  return count;
}

/**
 * Parse a document file into structured data
 */
function parseDocumentFile(
  filename: string,
  folder: string,
  content: string
): ParsedDocument | null {
  // Expected formats: RULE_1030_*.txt, RA_11058_*.txt, DO_252_25_*.txt, LA_07_22_*.txt, DA_05_10_*.txt
  const match = filename.match(/^(RULE|RA|DO|LA|DA)_(\d+)/i);
  if (!match) return null;

  const prefix = match[1].toLowerCase();
  const number = match[2];
  const lawId = `${prefix}${number}`;

  const typeMap: Record<string, 'ra' | 'oshs_rule' | 'do' | 'la' | 'da'> = {
    rule: 'oshs_rule',
    ra: 'ra',
    do: 'do',
    la: 'la',
    da: 'da',
  };

  const nameMap: Record<string, string> = {
    rule: `Rule ${number}`,
    ra: `RA ${number}`,
    do: `DO ${number}`,
    la: `LA ${number}`,
    da: `DA ${number}`,
  };

  // Parse sections from content
  const sections = parseSections(content, lawId, prefix);

  // Extract title from the document header
  let title = nameMap[prefix];

  // Try to extract title from header patterns
  // Pattern: "OSHS RULE 1030: TRAINING OF PERSONNEL..."
  const ruleTitle = content.match(/OSHS RULE \d+:\s*(.+?)(?:\n|$)/i);
  if (ruleTitle) {
    title = ruleTitle[1].trim();
  }

  // Pattern: "REPUBLIC ACT NO. 11058\nAN ACT..."
  const raTitle = content.match(/REPUBLIC ACT NO\. \d+\s*\n(.+?)(?:\n|Approved)/is);
  if (raTitle) {
    title = raTitle[1].trim().replace(/\s+/g, ' ');
  }

  // Pattern: "DOLE DEPARTMENT ORDER NO. 252..."
  const doTitle = content.match(/DOLE (?:DEPARTMENT ORDER|LABOR ADVISORY|DEPARTMENT ADVISORY)[^"]*"([^"]+)"/i);
  if (doTitle) {
    title = doTitle[1].trim();
  }

  // Pattern for DO/LA without quotes: Second line often has the title
  const headerLines = content.split('\n').slice(0, 10);
  for (const line of headerLines) {
    if (line.includes('REVISED IMPLEMENTING RULES') ||
        line.includes('EMPLOYER\'S WORK ACCIDENT') ||
        line.includes('GUIDELINES') ||
        line.includes('PROGRAM')) {
      title = line.replace(/^[=\-\s]+/, '').replace(/[=\-\s]+$/, '').trim();
      if (title.length > 10) break;
    }
  }

  return {
    lawId,
    lawName: nameMap[prefix],
    title: title.substring(0, 200), // Limit title length
    type: typeMap[prefix],
    sections,
  };
}

/**
 * Parse sections from document content
 */
function parseSections(content: string, lawId: string, docType: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  let currentChapter = '';
  let currentChapterTitle = '';

  // Split content by major section dividers
  const majorDivider = /={40,}/g;
  const minorDivider = /-{40,}/g;

  // Find all section markers with their positions
  const markers: {
    index: number;
    number: string;
    title: string;
    type: 'section' | 'chapter' | 'rule';
    chapterId?: string;
    chapterTitle?: string;
  }[] = [];

  // Pattern 1: "SECTION 1: Title" or "SECTION 1. Title"
  const sectionPattern = /^SECTION\s+(\d+(?:\.\d+)?)[.:]\s*(.*)$/gim;
  let match;
  while ((match = sectionPattern.exec(content)) !== null) {
    markers.push({
      index: match.index,
      number: match[1],
      title: match[2]?.trim() || '',
      type: 'section',
    });
  }

  // Pattern 2: "1031.01 Text..." (OSHS Rule subsections)
  const ruleSubsectionPattern = /^(\d{4}\.\d{2})\s+(.*)$/gim;
  while ((match = ruleSubsectionPattern.exec(content)) !== null) {
    markers.push({
      index: match.index,
      number: match[1],
      title: match[2]?.substring(0, 100)?.trim() || '',
      type: 'rule',
    });
  }

  // Pattern 3: "CHAPTER I" or "CHAPTER II: Title"
  const chapterPattern = /^CHAPTER\s+([IVX]+|\d+)[.:]*\s*(.*)$/gim;
  while ((match = chapterPattern.exec(content)) !== null) {
    const chapterId = match[1];
    const chapterTitle = match[2]?.trim() || '';
    markers.push({
      index: match.index,
      number: `Chapter ${chapterId}`,
      title: chapterTitle,
      type: 'chapter',
    });
  }

  // Sort by position
  markers.sort((a, b) => a.index - b.index);

  // Track current chapter for section assignment
  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];

    if (marker.type === 'chapter') {
      currentChapter = marker.number;
      currentChapterTitle = marker.title;
      continue; // Don't create a section for chapter headers alone
    }

    // Determine end position
    const endIndex = i < markers.length - 1 ? markers[i + 1].index : content.length;
    let sectionContent = content.substring(marker.index, endIndex).trim();

    // Clean up the content - remove divider lines
    sectionContent = sectionContent
      .replace(/={40,}/g, '')
      .replace(/-{40,}/g, '')
      .trim();

    // Skip empty or very short sections
    if (sectionContent.length < 20) continue;

    const sectionNumber = marker.type === 'rule'
      ? `Section ${marker.number}`
      : `Section ${marker.number}`;

    sections.push({
      sectionNumber,
      title: marker.title,
      content: sectionContent,
      chapterId: currentChapter || undefined,
      chapterTitle: currentChapterTitle || undefined,
    });
  }

  // If no sections found, try to split by major dividers
  if (sections.length === 0) {
    const parts = content.split(majorDivider).filter(p => p.trim().length > 50);

    if (parts.length > 1) {
      parts.forEach((part, i) => {
        // Try to extract a title from the first line
        const lines = part.trim().split('\n');
        const firstLine = lines[0]?.trim() || '';
        const title = firstLine.length < 100 ? firstLine : '';

        sections.push({
          sectionNumber: `Part ${i + 1}`,
          title,
          content: part.trim(),
        });
      });
    } else {
      // Create single section for entire document
      sections.push({
        sectionNumber: lawId.toUpperCase(),
        title: '',
        content: content.trim(),
      });
    }
  }

  return sections;
}

/**
 * Save parsed document to database
 */
async function saveDocument(doc: ParsedDocument) {
  // Ensure law exists
  const typeMap: Record<string, any> = {
    oshs_rule: 'OSHS_RULE',
    ra: 'RA',
    do: 'DO',
    la: 'LA',
    da: 'DA',
  };

  await prisma.law.upsert({
    where: { lawId: doc.lawId },
    update: {
      title: doc.title,
    },
    create: {
      lawId: doc.lawId,
      type: typeMap[doc.type],
      name: doc.lawName,
      shortName: doc.lawName,
      title: doc.title,
      keywords: [],
      status: 'CURRENT',
    },
  });

  // Get law record
  const law = await prisma.law.findUnique({ where: { lawId: doc.lawId } });
  if (!law) return;

  // Create sections
  for (let i = 0; i < doc.sections.length; i++) {
    const section = doc.sections[i];
    const sectionId = `${doc.lawId}-s${i + 1}`;

    await prisma.legalSection.upsert({
      where: { sectionId },
      update: {
        sectionNumber: section.sectionNumber,
        title: section.title,
        content: section.content,
        contentPlain: section.content.replace(/[#*_`]/g, ''),
        chapterId: section.chapterId,
        chapterTitle: section.chapterTitle,
      },
      create: {
        sectionId,
        sectionNumber: section.sectionNumber,
        title: section.title,
        lawId: law.id,
        content: section.content,
        contentPlain: section.content.replace(/[#*_`]/g, ''),
        chapterId: section.chapterId,
        chapterTitle: section.chapterTitle,
        topicTags: [],
        keyTerms: extractKeyTerms(section.content),
        status: 'CURRENT',
      },
    });
  }
}

/**
 * Create sections from legacy OSH_KNOWLEDGE
 */
async function createSectionsFromLegacy(): Promise<number> {
  let count = 0;

  for (const [key, data] of Object.entries(OSH_KNOWLEDGE)) {
    // Get law record
    const law = await prisma.law.findUnique({ where: { lawId: key } });
    if (!law) continue;

    // Convert legacy format to sections
    const sections = convertLegacyToLegalSection(key, data);

    for (const section of sections) {
      try {
        await prisma.legalSection.upsert({
          where: { sectionId: section.id },
          update: {
            content: section.content,
            contentPlain: section.contentPlain,
            topicTags: section.topicTags,
            keyTerms: section.keyTerms,
          },
          create: {
            sectionId: section.id,
            sectionNumber: section.sectionNumber,
            title: section.title,
            lawId: law.id,
            content: section.content,
            contentPlain: section.contentPlain,
            topicTags: section.topicTags,
            keyTerms: section.keyTerms,
            status: 'CURRENT',
          },
        });
        count++;

        // Create numerical values
        for (const nv of section.numericalValues) {
          const existingSection = await prisma.legalSection.findUnique({
            where: { sectionId: section.id },
          });
          if (existingSection) {
            await prisma.numericalValue.create({
              data: {
                sectionId: existingSection.id,
                value: nv.value,
                unit: nv.unit,
                context: nv.context,
              },
            });
          }
        }
      } catch (error: any) {
        // Skip duplicates
        if (!error.message?.includes('Unique constraint')) {
          console.error(`  Error creating section ${section.id}:`, error.message);
        }
      }
    }
  }

  return count;
}

/**
 * Generate embeddings for all sections
 */
async function generateEmbeddings(): Promise<number> {
  // Get all sections without embeddings
  const sections = await prisma.legalSection.findMany({
    select: {
      id: true,
      contentPlain: true,
    },
  });

  console.log(`  Found ${sections.length} sections to embed`);

  // Batch process
  const batchSize = 50;
  let count = 0;

  for (let i = 0; i < sections.length; i += batchSize) {
    const batch = sections.slice(i, i + batchSize);
    const texts = batch.map((s) => s.contentPlain);

    try {
      const result = await embeddingService.embedBatch(texts);

      // Update each section with embedding
      for (let j = 0; j < batch.length; j++) {
        const section = batch[j];
        const embedding = result.results[j]?.embedding;

        if (embedding) {
          // Use raw SQL to update vector column
          const embeddingStr = `[${embedding.join(',')}]`;
          await prisma.$executeRaw`
            UPDATE "LegalSection"
            SET embedding = ${embeddingStr}::vector
            WHERE id = ${section.id}
          `;
          count++;
        }
      }

      console.log(`  Progress: ${Math.min(i + batchSize, sections.length)}/${sections.length}`);
    } catch (error: any) {
      console.error(`  Error embedding batch ${i / batchSize + 1}:`, error.message);
    }

    // Rate limiting
    if (i + batchSize < sections.length) {
      await sleep(500);
    }
  }

  return count;
}

/**
 * Create vector index for efficient similarity search
 */
async function createVectorIndex() {
  try {
    // Create IVFFlat index for vector similarity search
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS legal_sections_embedding_idx
      ON "LegalSection"
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `;
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('  (Vector index already exists)');
    } else {
      throw error;
    }
  }
}

/**
 * Extract key terms from text
 */
function extractKeyTerms(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'of', 'in', 'to', 'for', 'and', 'or', 'is', 'are',
    'with', 'by', 'on', 'at', 'from', 'as', 'be', 'this', 'that', 'which',
    'shall', 'may', 'must', 'should', 'will', 'would', 'could', 'can',
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w))
    .slice(0, 30);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Run migration
migrate();
