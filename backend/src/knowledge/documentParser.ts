/**
 * OSH Document Parser
 * Parses and indexes Philippine OSH legal documents for precise retrieval
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DocumentSection {
  sectionNumber: string;
  sectionTitle: string;
  content: string;
  subsections: DocumentSubsection[];
  lineStart: number;
  lineEnd: number;
}

export interface DocumentSubsection {
  id: string;
  title: string;
  content: string;
  parentSection: string;
}

export interface ParsedDocument {
  id: string;
  type: 'ra' | 'rule' | 'do' | 'la' | 'da';
  title: string;
  shortTitle: string;
  fullText: string;
  sections: DocumentSection[];
  metadata: DocumentMetadata;
  keywords: string[];
}

export interface DocumentMetadata {
  effectiveDate?: string;
  issuingAuthority: string;
  amendedBy?: string[];
  amends?: string[];
  relatedIssuances?: string[];
}

export interface SearchResult {
  documentId: string;
  documentTitle: string;
  sectionNumber: string;
  sectionTitle: string;
  content: string;
  relevanceScore: number;
  citation: string;
}

export interface DocumentStats {
  documentId: string;
  title: string;
  totalSections: number;
  totalSubsections: number;
  sectionList: { number: string; title: string }[];
  wordCount: number;
}

// ============================================================================
// DOCUMENT PARSER CLASS
// ============================================================================

export class OSHDocumentParser {
  private documents: Map<string, ParsedDocument> = new Map();
  private documentsDir: string;
  private isLoaded: boolean = false;

  constructor(documentsDir?: string) {
    this.documentsDir = documentsDir || path.join(__dirname, 'documents');
  }

  /**
   * Load and parse all documents from the documents directory
   */
  async loadAllDocuments(): Promise<void> {
    if (this.isLoaded) return;

    const categories = ['ra', 'rules', 'do', 'la', 'da'];

    for (const category of categories) {
      const categoryPath = path.join(this.documentsDir, category);

      if (!fs.existsSync(categoryPath)) continue;

      const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.txt'));

      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const docType = this.mapCategoryToType(category);
        const parsed = this.parseDocument(content, file, docType);
        this.documents.set(parsed.id, parsed);
      }
    }

    this.isLoaded = true;
    console.log(`[DocumentParser] Loaded ${this.documents.size} documents`);
  }

  /**
   * Parse a single document into structured format
   */
  private parseDocument(content: string, filename: string, type: 'ra' | 'rule' | 'do' | 'la' | 'da'): ParsedDocument {
    const lines = content.split('\n');
    const id = this.extractDocumentId(filename, type);
    const title = this.extractTitle(lines);
    const shortTitle = this.extractShortTitle(filename);
    const sections = this.extractSections(lines);
    const metadata = this.extractMetadata(lines);
    const keywords = this.extractKeywords(content);

    return {
      id,
      type,
      title,
      shortTitle,
      fullText: content,
      sections,
      metadata,
      keywords
    };
  }

  /**
   * Extract document ID from filename
   */
  private extractDocumentId(filename: string, type: string): string {
    const baseName = filename.replace('.txt', '');
    return `${type.toUpperCase()}_${baseName}`;
  }

  /**
   * Extract the main title from document
   */
  private extractTitle(lines: string[]): string {
    // Look for title between the first set of === lines
    let inHeader = false;
    let titleLines: string[] = [];

    for (const line of lines) {
      if (line.includes('===')) {
        if (inHeader) break;
        inHeader = true;
        continue;
      }
      if (inHeader && line.trim()) {
        titleLines.push(line.trim());
      }
    }

    return titleLines.join(' ').trim() || 'Unknown Document';
  }

  /**
   * Extract short title from filename
   */
  private extractShortTitle(filename: string): string {
    return filename.replace('.txt', '').replace(/_/g, ' ');
  }

  /**
   * Extract all sections from document
   */
  private extractSections(lines: string[]): DocumentSection[] {
    const sections: DocumentSection[] = [];
    let currentSection: DocumentSection | null = null;
    let currentContent: string[] = [];

    const sectionPatterns = [
      /^SECTION\s+(\d+[\.\d]*)\s*[:\.]?\s*(.*)$/i,
      /^RULE\s+(\d+)\s*[:\.]?\s*(.*)$/i,
      /^(\d+[\.\d]+)\s+(.+)$/,
      /^CHAPTER\s+([IVX]+|\d+)\s*[:\.]?\s*(.*)$/i,
      /^ARTICLE\s+(\d+)\s*[:\.]?\s*(.*)$/i,
      /^---+\s*SECTION\s+(\d+[\.\d]*)\s*[:\.]?\s*(.*)$/i,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if this line starts a new section
      let matched = false;
      for (const pattern of sectionPatterns) {
        const match = line.match(pattern);
        if (match) {
          // Save previous section
          if (currentSection) {
            currentSection.content = currentContent.join('\n').trim();
            currentSection.lineEnd = i - 1;
            currentSection.subsections = this.extractSubsections(currentSection.content, currentSection.sectionNumber);
            sections.push(currentSection);
          }

          // Start new section
          currentSection = {
            sectionNumber: match[1],
            sectionTitle: match[2] || '',
            content: '',
            subsections: [],
            lineStart: i,
            lineEnd: i
          };
          currentContent = [];
          matched = true;
          break;
        }
      }

      if (!matched && currentSection) {
        currentContent.push(lines[i]);
      }
    }

    // Save last section
    if (currentSection) {
      currentSection.content = currentContent.join('\n').trim();
      currentSection.lineEnd = lines.length - 1;
      currentSection.subsections = this.extractSubsections(currentSection.content, currentSection.sectionNumber);
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Extract subsections from section content
   */
  private extractSubsections(content: string, parentSection: string): DocumentSubsection[] {
    const subsections: DocumentSubsection[] = [];
    const lines = content.split('\n');

    const subsectionPatterns = [
      /^\(([a-z])\)\s*(.*)$/i,
      /^(\d+[\.\d]+)\s+(.*)$/,
      /^([a-z])\.\s+(.*)$/i,
      /^\((\d+)\)\s*(.*)$/,
    ];

    let currentSubsection: DocumentSubsection | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      let matched = false;

      for (const pattern of subsectionPatterns) {
        const match = trimmedLine.match(pattern);
        if (match) {
          if (currentSubsection) {
            currentSubsection.content = currentContent.join('\n').trim();
            subsections.push(currentSubsection);
          }

          currentSubsection = {
            id: `${parentSection}.${match[1]}`,
            title: match[2] || '',
            content: '',
            parentSection
          };
          currentContent = [];
          matched = true;
          break;
        }
      }

      if (!matched && currentSubsection) {
        currentContent.push(line);
      }
    }

    if (currentSubsection) {
      currentSubsection.content = currentContent.join('\n').trim();
      subsections.push(currentSubsection);
    }

    return subsections;
  }

  /**
   * Extract metadata from document
   */
  private extractMetadata(lines: string[]): DocumentMetadata {
    const content = lines.join('\n');
    const metadata: DocumentMetadata = {
      issuingAuthority: 'Department of Labor and Employment (DOLE)',
      amendedBy: [],
      amends: [],
      relatedIssuances: []
    };

    // Extract effective date
    const dateMatch = content.match(/(?:Effective|Issued|Approved|Signed)[:\s]*([A-Za-z]+\s+\d+,?\s+\d{4}|\d{4})/i);
    if (dateMatch) {
      metadata.effectiveDate = dateMatch[1];
    }

    // Extract amendments
    const amendedByMatches = content.match(/(?:amended by|as amended by)[:\s]*([^\n]+)/gi);
    if (amendedByMatches) {
      metadata.amendedBy = amendedByMatches.map(m => m.replace(/amended by[:\s]*/i, '').trim());
    }

    // Extract related issuances
    const relatedSection = content.match(/RELATED ISSUANCES[\s\S]*?(?=={3,}|$)/i);
    if (relatedSection) {
      const refs = relatedSection[0].match(/(?:RA|DO|LA|DA|Rule)\s+[\d\-\.]+/gi);
      if (refs) {
        metadata.relatedIssuances = [...new Set(refs)];
      }
    }

    return metadata;
  }

  /**
   * Extract keywords from content
   */
  private extractKeywords(content: string): string[] {
    const keywords: Set<string> = new Set();

    // Common OSH keywords
    const keywordPatterns = [
      /safety officer/gi,
      /health committee/gi,
      /personal protective equipment|PPE/gi,
      /first aid(?:er)?/gi,
      /hazard(?:ous)?/gi,
      /accident/gi,
      /occupational (?:health|safety|illness)/gi,
      /workplace/gi,
      /employer/gi,
      /worker/gi,
      /training/gi,
      /registration/gi,
      /compliance/gi,
      /inspection/gi,
      /ventilation/gi,
      /illumination/gi,
      /noise/gi,
      /chemical/gi,
      /mental health/gi,
      /tuberculosis|TB/gi,
      /HIV|AIDS/gi,
      /hepatitis/gi,
      /drug[- ]free/gi,
      /scaffolding/gi,
      /construction/gi,
      /threshold limit/gi,
      /emergency/gi,
    ];

    for (const pattern of keywordPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(m => keywords.add(m.toLowerCase()));
      }
    }

    return Array.from(keywords);
  }

  /**
   * Map category folder to document type
   */
  private mapCategoryToType(category: string): 'ra' | 'rule' | 'do' | 'la' | 'da' {
    const mapping: Record<string, 'ra' | 'rule' | 'do' | 'la' | 'da'> = {
      'ra': 'ra',
      'rules': 'rule',
      'do': 'do',
      'la': 'la',
      'da': 'da'
    };
    return mapping[category] || 'do';
  }

  // ============================================================================
  // PUBLIC QUERY METHODS
  // ============================================================================

  /**
   * Get document by ID
   */
  getDocument(id: string): ParsedDocument | undefined {
    return this.documents.get(id);
  }

  /**
   * Get all documents
   */
  getAllDocuments(): ParsedDocument[] {
    return Array.from(this.documents.values());
  }

  /**
   * Get documents by type
   */
  getDocumentsByType(type: 'ra' | 'rule' | 'do' | 'la' | 'da'): ParsedDocument[] {
    return Array.from(this.documents.values()).filter(d => d.type === type);
  }

  /**
   * Find document by partial name or number
   */
  findDocument(query: string): ParsedDocument | undefined {
    const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const doc of this.documents.values()) {
      const normalizedId = doc.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedTitle = doc.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedShort = doc.shortTitle.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (normalizedId.includes(normalizedQuery) ||
          normalizedTitle.includes(normalizedQuery) ||
          normalizedShort.includes(normalizedQuery)) {
        return doc;
      }
    }

    return undefined;
  }

  /**
   * Get document statistics (section count, names, etc.)
   */
  getDocumentStats(documentId: string): DocumentStats | null {
    const doc = this.findDocument(documentId);
    if (!doc) return null;

    const totalSubsections = doc.sections.reduce((acc, s) => acc + s.subsections.length, 0);

    return {
      documentId: doc.id,
      title: doc.title,
      totalSections: doc.sections.length,
      totalSubsections,
      sectionList: doc.sections.map(s => ({
        number: s.sectionNumber,
        title: s.sectionTitle
      })),
      wordCount: doc.fullText.split(/\s+/).length
    };
  }

  /**
   * Get a specific section by number
   */
  getSection(documentId: string, sectionNumber: string): DocumentSection | null {
    const doc = this.findDocument(documentId);
    if (!doc) return null;

    const normalizedNum = sectionNumber.replace(/[^0-9.]/g, '');

    return doc.sections.find(s => {
      const sNum = s.sectionNumber.replace(/[^0-9.]/g, '');
      return sNum === normalizedNum || s.sectionNumber.toLowerCase() === sectionNumber.toLowerCase();
    }) || null;
  }

  /**
   * Get all section names/titles for a document
   */
  getSectionNames(documentId: string): { number: string; title: string }[] {
    const doc = this.findDocument(documentId);
    if (!doc) return [];

    return doc.sections.map(s => ({
      number: s.sectionNumber,
      title: s.sectionTitle
    }));
  }

  /**
   * Search across all documents
   */
  search(query: string, options?: {
    documentType?: string;
    limit?: number;
    exactMatch?: boolean;
  }): SearchResult[] {
    const results: SearchResult[] = [];
    const limit = options?.limit || 10;
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

    for (const doc of this.documents.values()) {
      if (options?.documentType && doc.type !== options.documentType) continue;

      for (const section of doc.sections) {
        const contentLower = section.content.toLowerCase();
        const titleLower = section.sectionTitle.toLowerCase();

        let score = 0;

        // Exact phrase match
        if (contentLower.includes(queryLower)) {
          score += 10;
        }

        // Word matches
        for (const word of queryWords) {
          if (contentLower.includes(word)) score += 2;
          if (titleLower.includes(word)) score += 3;
        }

        if (score > 0) {
          results.push({
            documentId: doc.id,
            documentTitle: doc.shortTitle,
            sectionNumber: section.sectionNumber,
            sectionTitle: section.sectionTitle,
            content: this.extractRelevantSnippet(section.content, query),
            relevanceScore: score,
            citation: this.formatCitation(doc, section)
          });
        }
      }
    }

    // Sort by relevance and limit
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * Get exact citation for a section
   */
  getCitation(documentId: string, sectionNumber?: string): string {
    const doc = this.findDocument(documentId);
    if (!doc) return '';

    if (sectionNumber) {
      const section = this.getSection(documentId, sectionNumber);
      if (section) {
        return this.formatCitation(doc, section);
      }
    }

    return this.formatDocumentCitation(doc);
  }

  /**
   * Get verbatim text from a section
   */
  getVerbatimText(documentId: string, sectionNumber: string): string | null {
    const section = this.getSection(documentId, sectionNumber);
    return section ? section.content : null;
  }

  /**
   * Answer specific questions about documents
   */
  answerSpecificQuestion(question: string): { answer: string; citation: string; confidence: number } | null {
    const questionLower = question.toLowerCase();

    // How many sections questions
    if (questionLower.includes('how many section') || questionLower.includes('number of section')) {
      const docRef = this.extractDocumentReference(question);
      if (docRef) {
        const stats = this.getDocumentStats(docRef);
        if (stats) {
          return {
            answer: `${stats.title} contains ${stats.totalSections} main sections and ${stats.totalSubsections} subsections.`,
            citation: `Based on ${stats.title}`,
            confidence: 0.95
          };
        }
      }
    }

    // What are the sections / section names
    if (questionLower.includes('what section') || questionLower.includes('section name') || questionLower.includes('list of section')) {
      const docRef = this.extractDocumentReference(question);
      if (docRef) {
        const sections = this.getSectionNames(docRef);
        if (sections.length > 0) {
          const doc = this.findDocument(docRef);
          const sectionList = sections.map(s => `- Section ${s.number}: ${s.title}`).join('\n');
          return {
            answer: `The sections of ${doc?.shortTitle || docRef} are:\n\n${sectionList}`,
            citation: `${doc?.shortTitle || docRef}`,
            confidence: 0.95
          };
        }
      }
    }

    // Specific section content
    const sectionMatch = questionLower.match(/section\s+(\d+[\.\d]*)/);
    if (sectionMatch) {
      const docRef = this.extractDocumentReference(question);
      if (docRef) {
        const section = this.getSection(docRef, sectionMatch[1]);
        if (section) {
          const doc = this.findDocument(docRef);
          return {
            answer: `**Section ${section.sectionNumber}: ${section.sectionTitle}**\n\n${section.content}`,
            citation: this.formatCitation(doc!, section),
            confidence: 0.98
          };
        }
      }
    }

    // Citation requests
    if (questionLower.includes('citation') || questionLower.includes('cite') || questionLower.includes('reference')) {
      const docRef = this.extractDocumentReference(question);
      if (docRef) {
        const citation = this.getCitation(docRef);
        if (citation) {
          return {
            answer: `The proper citation is:\n\n${citation}`,
            citation: citation,
            confidence: 0.95
          };
        }
      }
    }

    // General search for specific content
    const searchResults = this.search(question, { limit: 3 });
    if (searchResults.length > 0) {
      const top = searchResults[0];
      return {
        answer: top.content,
        citation: top.citation,
        confidence: Math.min(top.relevanceScore / 15, 0.9)
      };
    }

    return null;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Extract document reference from question
   */
  private extractDocumentReference(question: string): string | null {
    const patterns = [
      /rule\s*(\d+)/i,
      /ra\s*(\d+)/i,
      /republic act\s*(?:no\.?)?\s*(\d+)/i,
      /do\s*(\d+[-\d]*)/i,
      /department order\s*(?:no\.?)?\s*(\d+[-\d]*)/i,
      /la\s*(\d+[-\d]*)/i,
      /labor advisory\s*(?:no\.?)?\s*(\d+[-\d]*)/i,
      /da\s*(\d+[-\d]*)/i,
      /department advisory\s*(?:no\.?)?\s*(\d+[-\d]*)/i,
    ];

    for (const pattern of patterns) {
      const match = question.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }

  /**
   * Extract relevant snippet from content
   */
  private extractRelevantSnippet(content: string, query: string, maxLength: number = 500): string {
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    const index = contentLower.indexOf(queryLower);

    if (index === -1) {
      return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
    }

    const start = Math.max(0, index - 100);
    const end = Math.min(content.length, index + query.length + 300);

    let snippet = content.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet;
  }

  /**
   * Format citation for a section
   */
  private formatCitation(doc: ParsedDocument, section: DocumentSection): string {
    const typeNames: Record<string, string> = {
      'ra': 'Republic Act',
      'rule': 'OSHS Rule',
      'do': 'DOLE Department Order',
      'la': 'DOLE Labor Advisory',
      'da': 'DOLE Department Advisory'
    };

    const typeName = typeNames[doc.type] || 'Document';
    return `${typeName} ${doc.shortTitle}, Section ${section.sectionNumber}${section.sectionTitle ? ': ' + section.sectionTitle : ''}`;
  }

  /**
   * Format citation for entire document
   */
  private formatDocumentCitation(doc: ParsedDocument): string {
    const typeNames: Record<string, string> = {
      'ra': 'Republic Act',
      'rule': 'OSHS Rule',
      'do': 'DOLE Department Order',
      'la': 'DOLE Labor Advisory',
      'da': 'DOLE Department Advisory'
    };

    const typeName = typeNames[doc.type] || 'Document';
    let citation = `${typeName} ${doc.shortTitle}`;

    if (doc.metadata.effectiveDate) {
      citation += ` (${doc.metadata.effectiveDate})`;
    }

    return citation;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let parserInstance: OSHDocumentParser | null = null;

export async function getDocumentParser(): Promise<OSHDocumentParser> {
  if (!parserInstance) {
    parserInstance = new OSHDocumentParser();
    await parserInstance.loadAllDocuments();
  }
  return parserInstance;
}

export default OSHDocumentParser;
