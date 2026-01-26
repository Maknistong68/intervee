/**
 * Document Intelligence Service
 *
 * High-level service for answering specific, detailed questions about OSH documents.
 * Integrates with the document parser to provide precise citations, section details,
 * and verbatim text when the interviewer asks specific questions.
 */

import { getDocumentParser, OSHDocumentParser, SearchResult, DocumentStats, DocumentSection } from '../knowledge/documentParser';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface IntelligenceQuery {
  question: string;
  context?: string;
  requiresExactCitation?: boolean;
  documentHint?: string;
}

export interface IntelligenceResponse {
  answer: string;
  citation: string;
  verbatimQuote?: string;
  confidence: number;
  sourceDocument?: string;
  sourceSection?: string;
  additionalReferences?: string[];
  queryType: QueryType;
}

export type QueryType =
  | 'section_count'
  | 'section_list'
  | 'section_content'
  | 'citation_request'
  | 'definition'
  | 'requirement'
  | 'penalty'
  | 'procedure'
  | 'general_search'
  | 'comparison'
  | 'unknown';

interface QueryPattern {
  type: QueryType;
  patterns: RegExp[];
  handler: (query: IntelligenceQuery, parser: OSHDocumentParser, matches: RegExpMatchArray | null) => Promise<IntelligenceResponse | null>;
}

// ============================================================================
// DOCUMENT INTELLIGENCE SERVICE
// ============================================================================

class DocumentIntelligenceService {
  private parser: OSHDocumentParser | null = null;
  private initialized: boolean = false;

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.parser = await getDocumentParser();
      this.initialized = true;
      console.log('[DocumentIntelligence] Service initialized');
    } catch (error) {
      console.error('[DocumentIntelligence] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Check if a question requires document intelligence
   */
  requiresDocumentIntelligence(question: string): boolean {
    const indicators = [
      /how many section/i,
      /number of section/i,
      /what (?:are )?(?:the )?section/i,
      /list (?:of )?(?:the )?section/i,
      /section\s+\d+/i,
      /give me (?:the )?(?:exact|specific|verbatim)/i,
      /citation/i,
      /cite/i,
      /according to (?:section|rule|ra|do|la)/i,
      /what does (?:section|rule) \d+ (?:say|state)/i,
      /quote (?:from|the)/i,
      /verbatim/i,
      /word[- ]for[- ]word/i,
      /exact (?:text|wording|provision)/i,
      /specifically state/i,
      /as written in/i,
      /paragraph/i,
      /subsection/i,
      /under (?:section|rule)/i,
      /pursuant to/i,
    ];

    return indicators.some(pattern => pattern.test(question));
  }

  /**
   * Process a query and return an intelligent response
   */
  async processQuery(query: IntelligenceQuery): Promise<IntelligenceResponse> {
    await this.initialize();

    if (!this.parser) {
      return this.createErrorResponse('Document parser not available');
    }

    // Determine query type and process accordingly
    const queryType = this.classifyQuery(query.question);

    try {
      switch (queryType) {
        case 'section_count':
          return await this.handleSectionCount(query);
        case 'section_list':
          return await this.handleSectionList(query);
        case 'section_content':
          return await this.handleSectionContent(query);
        case 'citation_request':
          return await this.handleCitationRequest(query);
        case 'definition':
          return await this.handleDefinitionQuery(query);
        case 'requirement':
          return await this.handleRequirementQuery(query);
        case 'penalty':
          return await this.handlePenaltyQuery(query);
        case 'procedure':
          return await this.handleProcedureQuery(query);
        default:
          return await this.handleGeneralSearch(query);
      }
    } catch (error) {
      console.error('[DocumentIntelligence] Error processing query:', error);
      return this.createErrorResponse('Failed to process query');
    }
  }

  /**
   * Classify the query type
   */
  private classifyQuery(question: string): QueryType {
    const q = question.toLowerCase();

    if (/how many section|number of section|total section/i.test(q)) {
      return 'section_count';
    }
    if (/what (?:are )?(?:the )?section|list (?:of )?section|section name/i.test(q)) {
      return 'section_list';
    }
    if (/section\s+\d+|what does section|content of section/i.test(q)) {
      return 'section_content';
    }
    if (/citation|cite|reference|pursuant to/i.test(q)) {
      return 'citation_request';
    }
    if (/definition|define|what is|meaning of/i.test(q)) {
      return 'definition';
    }
    if (/requirement|required|must|shall|mandatory|obligation/i.test(q)) {
      return 'requirement';
    }
    if (/penalty|fine|violation|sanction|punishment/i.test(q)) {
      return 'penalty';
    }
    if (/procedure|process|step|how to/i.test(q)) {
      return 'procedure';
    }

    return 'general_search';
  }

  /**
   * Handle section count queries
   */
  private async handleSectionCount(query: IntelligenceQuery): Promise<IntelligenceResponse> {
    const docRef = this.extractDocumentReference(query.question) || query.documentHint;

    if (!docRef) {
      return this.createErrorResponse('Please specify which document (e.g., Rule 1040, DO 252-25)');
    }

    const stats = this.parser!.getDocumentStats(docRef);

    if (!stats) {
      return this.createErrorResponse(`Could not find document: ${docRef}`);
    }

    return {
      answer: `**${stats.title}** contains:\n\n` +
              `- **${stats.totalSections}** main sections\n` +
              `- **${stats.totalSubsections}** subsections\n` +
              `- **${stats.wordCount.toLocaleString()}** total words`,
      citation: stats.title,
      confidence: 0.98,
      sourceDocument: stats.documentId,
      queryType: 'section_count'
    };
  }

  /**
   * Handle section list queries
   */
  private async handleSectionList(query: IntelligenceQuery): Promise<IntelligenceResponse> {
    const docRef = this.extractDocumentReference(query.question) || query.documentHint;

    if (!docRef) {
      return this.createErrorResponse('Please specify which document (e.g., Rule 1040, DO 252-25)');
    }

    const doc = this.parser!.findDocument(docRef);
    const sections = this.parser!.getSectionNames(docRef);

    if (sections.length === 0) {
      return this.createErrorResponse(`Could not find sections for: ${docRef}`);
    }

    const sectionList = sections.map(s =>
      `- **Section ${s.number}**: ${s.title || '(No title)'}`
    ).join('\n');

    return {
      answer: `**Sections of ${doc?.shortTitle || docRef}:**\n\n${sectionList}`,
      citation: doc?.shortTitle || docRef,
      confidence: 0.98,
      sourceDocument: doc?.id,
      queryType: 'section_list'
    };
  }

  /**
   * Handle section content queries
   */
  private async handleSectionContent(query: IntelligenceQuery): Promise<IntelligenceResponse> {
    const docRef = this.extractDocumentReference(query.question) || query.documentHint;
    const sectionMatch = query.question.match(/section\s+(\d+[\.\d]*)/i);

    if (!docRef || !sectionMatch) {
      return this.createErrorResponse('Please specify the document and section number (e.g., "Section 5 of Rule 1040")');
    }

    const doc = this.parser!.findDocument(docRef);
    const section = this.parser!.getSection(docRef, sectionMatch[1]);

    if (!section) {
      return this.createErrorResponse(`Could not find Section ${sectionMatch[1]} in ${docRef}`);
    }

    const citation = this.parser!.getCitation(docRef, sectionMatch[1]);

    return {
      answer: `**Section ${section.sectionNumber}: ${section.sectionTitle}**\n\n${section.content}`,
      citation: citation,
      verbatimQuote: section.content,
      confidence: 0.99,
      sourceDocument: doc?.id,
      sourceSection: section.sectionNumber,
      queryType: 'section_content'
    };
  }

  /**
   * Handle citation requests
   */
  private async handleCitationRequest(query: IntelligenceQuery): Promise<IntelligenceResponse> {
    const docRef = this.extractDocumentReference(query.question) || query.documentHint;
    const sectionMatch = query.question.match(/section\s+(\d+[\.\d]*)/i);

    if (!docRef) {
      // Try to find from context
      const searchResults = this.parser!.search(query.question, { limit: 1 });
      if (searchResults.length > 0) {
        return {
          answer: `The relevant citation is:\n\n**${searchResults[0].citation}**\n\n"${searchResults[0].content}"`,
          citation: searchResults[0].citation,
          verbatimQuote: searchResults[0].content,
          confidence: 0.85,
          sourceDocument: searchResults[0].documentId,
          sourceSection: searchResults[0].sectionNumber,
          queryType: 'citation_request'
        };
      }
      return this.createErrorResponse('Please specify which document you need a citation for');
    }

    const citation = this.parser!.getCitation(docRef, sectionMatch?.[1]);
    const doc = this.parser!.findDocument(docRef);

    if (!citation) {
      return this.createErrorResponse(`Could not generate citation for: ${docRef}`);
    }

    let answer = `**Citation:**\n\n${citation}`;
    let verbatim: string | undefined;

    if (sectionMatch) {
      const section = this.parser!.getSection(docRef, sectionMatch[1]);
      if (section) {
        verbatim = section.content.substring(0, 500) + (section.content.length > 500 ? '...' : '');
        answer += `\n\n**Relevant text:**\n"${verbatim}"`;
      }
    }

    return {
      answer,
      citation,
      verbatimQuote: verbatim,
      confidence: 0.95,
      sourceDocument: doc?.id,
      sourceSection: sectionMatch?.[1],
      queryType: 'citation_request'
    };
  }

  /**
   * Handle definition queries
   */
  private async handleDefinitionQuery(query: IntelligenceQuery): Promise<IntelligenceResponse> {
    const searchTerms = query.question.replace(/what is|definition of|define|meaning of/gi, '').trim();

    const searchResults = this.parser!.search(`definition ${searchTerms}`, { limit: 5 });

    if (searchResults.length === 0) {
      // Try broader search
      const broaderResults = this.parser!.search(searchTerms, { limit: 3 });
      if (broaderResults.length > 0) {
        return this.formatSearchResponse(broaderResults, 'definition');
      }
      return this.createErrorResponse(`Could not find definition for: ${searchTerms}`);
    }

    return this.formatSearchResponse(searchResults, 'definition');
  }

  /**
   * Handle requirement queries
   */
  private async handleRequirementQuery(query: IntelligenceQuery): Promise<IntelligenceResponse> {
    const searchResults = this.parser!.search(query.question, { limit: 5 });
    return this.formatSearchResponse(searchResults, 'requirement');
  }

  /**
   * Handle penalty queries
   */
  private async handlePenaltyQuery(query: IntelligenceQuery): Promise<IntelligenceResponse> {
    const penaltyResults = this.parser!.search('penalty violation fine sanction', { limit: 5 });
    const contextResults = this.parser!.search(query.question, { limit: 3 });

    const combined = [...penaltyResults, ...contextResults]
      .filter((r, i, arr) => arr.findIndex(x => x.documentId === r.documentId && x.sectionNumber === r.sectionNumber) === i)
      .slice(0, 5);

    return this.formatSearchResponse(combined, 'penalty');
  }

  /**
   * Handle procedure queries
   */
  private async handleProcedureQuery(query: IntelligenceQuery): Promise<IntelligenceResponse> {
    const searchResults = this.parser!.search(query.question, { limit: 5 });
    return this.formatSearchResponse(searchResults, 'procedure');
  }

  /**
   * Handle general search queries
   */
  private async handleGeneralSearch(query: IntelligenceQuery): Promise<IntelligenceResponse> {
    const searchResults = this.parser!.search(query.question, { limit: 5 });
    return this.formatSearchResponse(searchResults, 'general_search');
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Extract document reference from query
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
   * Format search results into a response
   */
  private formatSearchResponse(results: SearchResult[], queryType: QueryType): IntelligenceResponse {
    if (results.length === 0) {
      return this.createErrorResponse('No relevant information found');
    }

    const top = results[0];
    const additionalRefs = results.slice(1).map(r => r.citation);

    let answer = `**${top.sectionTitle || 'Relevant Section'}**\n\n${top.content}`;

    if (additionalRefs.length > 0) {
      answer += '\n\n**Additional References:**\n' + additionalRefs.map(r => `- ${r}`).join('\n');
    }

    return {
      answer,
      citation: top.citation,
      verbatimQuote: top.content,
      confidence: Math.min(top.relevanceScore / 10, 0.95),
      sourceDocument: top.documentId,
      sourceSection: top.sectionNumber,
      additionalReferences: additionalRefs.length > 0 ? additionalRefs : undefined,
      queryType
    };
  }

  /**
   * Create error response
   */
  private createErrorResponse(message: string): IntelligenceResponse {
    return {
      answer: message,
      citation: '',
      confidence: 0,
      queryType: 'unknown'
    };
  }

  /**
   * Get full document text
   */
  async getFullDocumentText(documentId: string): Promise<string | null> {
    await this.initialize();
    const doc = this.parser?.findDocument(documentId);
    return doc?.fullText || null;
  }

  /**
   * Get all available documents
   */
  async getAvailableDocuments(): Promise<{ id: string; title: string; type: string }[]> {
    await this.initialize();
    return this.parser?.getAllDocuments().map(d => ({
      id: d.id,
      title: d.shortTitle,
      type: d.type
    })) || [];
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const documentIntelligence = new DocumentIntelligenceService();

export default DocumentIntelligenceService;
