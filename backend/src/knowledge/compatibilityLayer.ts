// Compatibility Layer
// Bridges the legacy OSH_KNOWLEDGE object with the new hybrid search system
// NOW USES FULL DOCUMENTS from /documents folder!

import { OSH_KNOWLEDGE } from './oshKnowledgeBase.js';
import { getRelevantKnowledge, searchSections, formatSectionsAsKnowledge } from './documentLoader.js';
import { hybridSearchService, HybridSearchResult } from '../services/hybridSearchService.js';
import {
  LegalSection,
  SearchResult,
  HybridSearchOptions,
  LawType,
} from './types/legalDocument.js';

/**
 * Check if hybrid search is available (database populated)
 */
let hybridSearchAvailable: boolean | null = null;

export async function isHybridSearchAvailable(): Promise<boolean> {
  if (hybridSearchAvailable !== null) {
    return hybridSearchAvailable;
  }

  try {
    // Try a minimal search to check if database has data
    const result = await hybridSearchService.search({
      query: 'safety officer',
      limit: 1,
    });
    hybridSearchAvailable = result.results.length > 0;
    console.log(`[CompatibilityLayer] Hybrid search available: ${hybridSearchAvailable}`);
  } catch (error) {
    console.log('[CompatibilityLayer] Hybrid search not available, using document loader');
    hybridSearchAvailable = false;
  }

  return hybridSearchAvailable;
}

/**
 * Reset the availability check (useful after migration)
 */
export function resetHybridSearchAvailability(): void {
  hybridSearchAvailable = null;
}

/**
 * Get topic knowledge using appropriate method
 * Priority: 1) Database hybrid search, 2) Full documents, 3) Legacy OSH_KNOWLEDGE
 */
export async function getTopicKnowledge(
  topic: string,
  query?: string
): Promise<string> {
  // Try database hybrid search first
  const useHybrid = await isHybridSearchAvailable();
  if (useHybrid && query) {
    return await getTopicKnowledgeHybrid(topic, query);
  }

  // Use full documents from /documents folder
  if (query) {
    const docKnowledge = getRelevantKnowledge(query, topic);
    if (docKnowledge) {
      // Combine with legacy for complete coverage
      const legacyKnowledge = getTopicKnowledgeLegacy(topic);
      return `${docKnowledge}\n\n${legacyKnowledge}`;
    }
  }

  // Fall back to legacy OSH_KNOWLEDGE
  return getTopicKnowledgeLegacy(topic);
}

/**
 * Get knowledge using hybrid search
 */
async function getTopicKnowledgeHybrid(
  topic: string,
  query: string
): Promise<string> {
  // Extract any legal references from the query
  const legalRefs = hybridSearchService.extractLegalReferences(query);
  const numericalQuery = hybridSearchService.extractNumericalQuery(query);

  // Build search options
  const searchOptions: HybridSearchOptions = {
    query,
    limit: 5,
    minScore: 0.3,
  };

  // Add law ID filter if topic maps to a specific law
  const lawIdMap: Record<string, string[]> = {
    registration: ['rule1020'],
    safety_officer: ['rule1030', 'do252'],
    training: ['rule1030'],
    hsc: ['rule1040'],
    committee: ['rule1040'],
    accident: ['rule1050'],
    reporting: ['rule1050'],
    premises: ['rule1060'],
    environmental: ['rule1070'],
    ppe: ['rule1080'],
    hazardous_materials: ['rule1090'],
    welding: ['rule1100'],
    confined_space: ['rule1120'],
    explosives: ['rule1140'],
    boiler: ['rule1160'],
    health_services: ['rule1960'],
    penalty: ['ra11058'],
    ra11058: ['ra11058'],
    do252: ['do252'],
    do136: ['do136'],
    do160: ['do160'],
    do53: ['do53'],
    do73: ['do73'],
    do102: ['do102'],
    do178: ['do178'],
    do184: ['do184'],
    do208: ['do208'],
    do235: ['do235'],
    la07: ['la07'],
    la01: ['la01'],
    la08: ['la08'],
    la19: ['la19'],
    la20: ['la20'],
    la21: ['la21'],
    la22: ['la22'],
    la23: ['la23'],
  };

  if (topic && lawIdMap[topic]) {
    searchOptions.lawIds = lawIdMap[topic];
  }

  // Add section numbers from legal references
  const sectionRefs = legalRefs.filter(r => r.type === 'section');
  if (sectionRefs.length > 0) {
    searchOptions.sectionNumbers = sectionRefs.map(r => r.identifier);
  }

  // Add numerical query
  if (numericalQuery) {
    searchOptions.numericalQuery = numericalQuery;
  }

  try {
    const searchResult = await hybridSearchService.search(searchOptions);
    return formatSearchResultsAsKnowledge(searchResult, topic);
  } catch (error) {
    console.error('[CompatibilityLayer] Hybrid search error, falling back to legacy:', error);
    return getTopicKnowledgeLegacy(topic);
  }
}

/**
 * Format search results as knowledge context for the prompt
 */
function formatSearchResultsAsKnowledge(
  searchResult: HybridSearchResult,
  topic: string
): string {
  if (searchResult.results.length === 0) {
    // Fall back to legacy if no results
    return getTopicKnowledgeLegacy(topic);
  }

  const sections = searchResult.results.map((r, i) => {
    const s = r.section;
    const confidenceLabel = r.score > 0.7 ? 'HIGH' : r.score > 0.4 ? 'MEDIUM' : 'LOW';

    let content = `## SOURCE ${i + 1} [${confidenceLabel} RELEVANCE]\n`;
    content += `**Citation:** ${s.lawName}, ${s.sectionNumber}\n`;
    if (s.title) content += `**Title:** ${s.title}\n`;
    content += `**Status:** ${s.status}\n\n`;
    content += `**Content:**\n${s.content}\n`;

    // Include numerical values if present
    if (s.numericalValues && s.numericalValues.length > 0) {
      content += `\n**Key Values:**\n`;
      for (const nv of s.numericalValues) {
        content += `- ${nv.value} ${nv.unit}: ${nv.context}\n`;
      }
    }

    // Include highlights if present
    if (r.highlights && r.highlights.length > 0) {
      content += `\n**Relevant Excerpts:**\n`;
      for (const h of r.highlights) {
        content += `> ${h}\n`;
      }
    }

    return content;
  });

  return `## REFERENCE DATA (Hybrid Search Results)\n` +
    `Search found ${searchResult.results.length} relevant sections in ${searchResult.searchTimeMs}ms\n` +
    `Strategies used: ${searchResult.strategy.join(', ')}\n\n` +
    sections.join('\n---\n');
}

/**
 * Legacy knowledge retrieval from OSH_KNOWLEDGE object
 */
function getTopicKnowledgeLegacy(topic: string): string {
  const topicMap: Record<string, keyof typeof OSH_KNOWLEDGE> = {
    registration: 'rule1020',
    safety_officer: 'rule1030',
    training: 'rule1030',
    hsc: 'rule1040',
    committee: 'rule1040',
    accident: 'rule1050',
    reporting: 'rule1050',
    premises: 'rule1060',
    environmental: 'rule1070',
    noise: 'rule1070',
    illumination: 'rule1070',
    ventilation: 'rule1070',
    ppe: 'rule1080',
    hazardous_materials: 'rule1090',
    welding: 'rule1100',
    confined_space: 'rule1120',
    explosives: 'rule1140',
    boiler: 'rule1160',
    health_services: 'rule1960',
    penalty: 'ra11058',
    ra11058: 'ra11058',
    do252: 'do252',
    do136: 'do136',
    do160: 'do160',
    do224: 'do224',
    do53: 'do53',
    do73: 'do73',
    do102: 'do102',
    do178: 'do178',
    do184: 'do184',
    do208: 'do208',
    do235: 'do235',
    da05: 'da05',
    la07: 'la07',
    la01: 'la01',
    la08: 'la08',
    la19: 'la19',
    la20: 'la20',
    la21: 'la21',
    la22: 'la22',
    la23: 'la23',
  };

  // Special handling for generic "Department Orders" questions
  if (topic === 'department_orders') {
    const doKnowledge = {
      do252: OSH_KNOWLEDGE.do252,
      do136: OSH_KNOWLEDGE.do136,
      do160: OSH_KNOWLEDGE.do160,
      do224: OSH_KNOWLEDGE.do224,
      do53: OSH_KNOWLEDGE.do53,
      do73: OSH_KNOWLEDGE.do73,
      do102: OSH_KNOWLEDGE.do102,
      do178: OSH_KNOWLEDGE.do178,
      do184: OSH_KNOWLEDGE.do184,
      do208: OSH_KNOWLEDGE.do208,
      do235: OSH_KNOWLEDGE.do235,
      da05: OSH_KNOWLEDGE.da05,
    };
    return `\n## REFERENCE DATA (ALL DEPARTMENT ORDERS - "DO" means Department Order in OSH context):\nIMPORTANT: When user asks for "DOs" or "Department Orders", list specific Department Orders like DO 208, DO 73, DO 102, etc. - NOT government agencies.\n\n${JSON.stringify(doKnowledge, null, 2)}`;
  }

  // Special handling for generic "Labor Advisories" questions
  if (topic === 'labor_advisories') {
    const laKnowledge = {
      la07: OSH_KNOWLEDGE.la07,
      la01: OSH_KNOWLEDGE.la01,
      la08: OSH_KNOWLEDGE.la08,
      la19: OSH_KNOWLEDGE.la19,
      la20: OSH_KNOWLEDGE.la20,
      la21: OSH_KNOWLEDGE.la21,
      la22: OSH_KNOWLEDGE.la22,
      la23: OSH_KNOWLEDGE.la23,
    };
    return `\n## REFERENCE DATA (ALL LABOR ADVISORIES):\n${JSON.stringify(laKnowledge, null, 2)}`;
  }

  const knowledgeKey = topicMap[topic] || null;

  if (knowledgeKey && OSH_KNOWLEDGE[knowledgeKey]) {
    return `\n## REFERENCE DATA (${knowledgeKey.toUpperCase()}):\n${JSON.stringify(OSH_KNOWLEDGE[knowledgeKey], null, 2)}`;
  }

  // For general questions, provide ALL knowledge data so AI can find any rule
  return `\n## REFERENCE DATA (ALL OSHS RULES):\n${JSON.stringify(OSH_KNOWLEDGE, null, 2)}`;
}

/**
 * Convert legacy OSH_KNOWLEDGE entry to LegalSection format
 * Used for migration and testing
 */
export function convertLegacyToLegalSection(
  key: string,
  data: any,
  parentKey?: string
): LegalSection[] {
  const sections: LegalSection[] = [];

  // Determine law type from key
  const lawType: LawType = key.startsWith('rule') ? 'oshs_rule' :
    key.startsWith('ra') ? 'ra' :
    key.startsWith('do') ? 'do' :
    key.startsWith('la') ? 'la' :
    key.startsWith('da') ? 'da' : 'oshs_rule';

  // Extract rule/law number
  const numMatch = key.match(/\d+/);
  const lawNum = numMatch ? numMatch[0] : key;

  // Format law name
  const lawName = lawType === 'oshs_rule' ? `Rule ${lawNum}` :
    lawType === 'ra' ? `RA ${lawNum}` :
    lawType === 'do' ? `DO ${lawNum}` :
    lawType === 'la' ? `LA ${lawNum}` :
    `DA ${lawNum}`;

  // Recursively process nested objects
  function processEntry(
    entryKey: string,
    value: any,
    path: string[]
  ): void {
    if (value === null || value === undefined) return;

    // Handle { value, citation } pairs
    if (typeof value === 'object' && 'value' in value && 'citation' in value) {
      const sectionId = `${key}-${path.join('-')}`;
      const citation = value.citation as string;

      // Extract section number from citation
      const sectionMatch = citation.match(/Section\s*(\d+(?:\.\d+)?)/i);
      const sectionNumber = sectionMatch ? `Section ${sectionMatch[1]}` : citation;

      sections.push({
        id: sectionId,
        sectionNumber,
        title: path[path.length - 1] || entryKey,
        lawId: key,
        lawName,
        lawType,
        content: formatValue(value.value),
        contentPlain: formatValuePlain(value.value),
        topicTags: extractTopicTags(path, entryKey),
        status: 'current',
        keyTerms: extractKeyTerms(formatValuePlain(value.value)),
        numericalValues: extractNumericalValues(value.value, sectionId),
      });
      return;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      const sectionId = `${key}-${path.join('-')}`;
      sections.push({
        id: sectionId,
        sectionNumber: path.length > 0 ? path.join('.') : key,
        title: entryKey,
        lawId: key,
        lawName,
        lawType,
        content: value.map(v => `- ${v}`).join('\n'),
        contentPlain: value.join(', '),
        topicTags: extractTopicTags(path, entryKey),
        status: 'current',
        keyTerms: extractKeyTerms(value.join(' ')),
        numericalValues: [],
      });
      return;
    }

    // Handle nested objects
    if (typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        processEntry(k, v, [...path, k]);
      }
      return;
    }

    // Handle simple values
    const sectionId = `${key}-${path.join('-')}`;
    sections.push({
      id: sectionId,
      sectionNumber: path.length > 0 ? path.join('.') : key,
      title: entryKey,
      lawId: key,
      lawName,
      lawType,
      content: String(value),
      contentPlain: String(value),
      topicTags: extractTopicTags(path, entryKey),
      status: 'current',
      keyTerms: extractKeyTerms(String(value)),
      numericalValues: extractNumericalValues(value, sectionId),
    });
  }

  processEntry(key, data, []);
  return sections;
}

/**
 * Format a value for display
 */
function formatValue(value: any): string {
  if (Array.isArray(value)) {
    return value.map(v => `- ${v}`).join('\n');
  }
  return String(value);
}

/**
 * Format a value as plain text
 */
function formatValuePlain(value: any): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return String(value);
}

/**
 * Extract topic tags from path and key
 */
function extractTopicTags(path: string[], key: string): string[] {
  const tags: string[] = [];
  const allParts = [...path, key];

  for (const part of allParts) {
    const lower = part.toLowerCase();
    // Add relevant tags based on keywords
    if (lower.includes('penalty') || lower.includes('fine')) tags.push('penalty');
    if (lower.includes('training') || lower.includes('hours')) tags.push('training');
    if (lower.includes('deadline') || lower.includes('days')) tags.push('deadline');
    if (lower.includes('requirement')) tags.push('requirement');
    if (lower.includes('safety') || lower.includes('officer')) tags.push('safety_officer');
    if (lower.includes('hsc') || lower.includes('committee')) tags.push('committee');
    if (lower.includes('ppe') || lower.includes('equipment')) tags.push('ppe');
    if (lower.includes('accident') || lower.includes('report')) tags.push('accident');
  }

  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Extract key terms from text
 */
function extractKeyTerms(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'of', 'in', 'to', 'for', 'and', 'or', 'is', 'are',
    'with', 'by', 'on', 'at', 'from', 'as', 'be', 'this', 'that', 'which',
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w))
    .slice(0, 20); // Limit to 20 terms
}

/**
 * Extract numerical values from content
 */
function extractNumericalValues(value: any, sectionId: string): any[] {
  const numericals: any[] = [];
  const text = formatValuePlain(value);

  // PHP amounts
  const phpMatches = text.matchAll(/(?:PHP|P|₱)\s*([\d,]+(?:\.\d{2})?)/gi);
  for (const match of phpMatches) {
    numericals.push({
      value: parseFloat(match[1].replace(/,/g, '')),
      unit: 'PHP',
      context: text.substring(0, 100),
      sectionId,
    });
  }

  // Hours
  const hourMatches = text.matchAll(/(\d+)\s*(?:hours?|hrs?)/gi);
  for (const match of hourMatches) {
    numericals.push({
      value: parseInt(match[1]),
      unit: 'hours',
      context: text.substring(0, 100),
      sectionId,
    });
  }

  // Days
  const dayMatches = text.matchAll(/(\d+)\s*(?:days?|calendar\s*days?)/gi);
  for (const match of dayMatches) {
    numericals.push({
      value: parseInt(match[1]),
      unit: 'days',
      context: text.substring(0, 100),
      sectionId,
    });
  }

  // Workers
  const workerMatches = text.matchAll(/(\d+)\s*(?:workers?|employees?)/gi);
  for (const match of workerMatches) {
    numericals.push({
      value: parseInt(match[1]),
      unit: 'workers',
      context: text.substring(0, 100),
      sectionId,
    });
  }

  return numericals;
}
