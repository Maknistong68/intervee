/**
 * Intelligent Response Service
 *
 * Orchestrates responses by combining AI-generated content with precise
 * document intelligence when specific, citation-requiring questions are asked.
 *
 * This service acts as a middleware that:
 * 1. Analyzes incoming questions
 * 2. Determines if document intelligence is needed
 * 3. Retrieves precise information from OSH documents
 * 4. Combines with AI responses for comprehensive answers
 */

import { documentIntelligence, IntelligenceResponse } from './documentIntelligenceService.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface EnhancedResponse {
  mainResponse: string;
  citation?: string;
  verbatimQuote?: string;
  confidence: number;
  usedDocumentIntelligence: boolean;
  sourceDocuments?: string[];
  additionalContext?: string;
  likelyFollowUps?: string[];  // Predicted next questions
}

export interface QuestionAnalysis {
  requiresDocumentIntelligence: boolean;
  isSpecificQuery: boolean;
  queryType: string;
  documentHints: string[];
  sectionHints: string[];
  keywords: string[];
}

// ============================================================================
// INTELLIGENT RESPONSE SERVICE
// ============================================================================

class IntelligentResponseService {
  private initialized: boolean = false;

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    await documentIntelligence.initialize();
    this.initialized = true;
    console.log('[IntelligentResponse] Service initialized');
  }

  /**
   * Analyze a question to determine how to best respond
   */
  analyzeQuestion(question: string): QuestionAnalysis {
    const q = question.toLowerCase();

    // Check for specific indicators
    const specificIndicators = {
      sectionCount: /how many section|number of section|total section/i.test(q),
      sectionList: /what (?:are )?(?:the )?section|list (?:of )?section|section name/i.test(q),
      sectionContent: /section\s+\d+|what does section|content of section/i.test(q),
      citation: /citation|cite|reference|pursuant to|according to/i.test(q),
      verbatim: /verbatim|exact|word[- ]for[- ]word|quote|as written/i.test(q),
      specific: /specifically|exact|precise|particular|which section/i.test(q),
    };

    const isSpecific = Object.values(specificIndicators).some(v => v);

    // Extract document hints
    const documentHints: string[] = [];
    const docPatterns = [
      /rule\s*(\d+)/gi,
      /ra\s*(\d+)/gi,
      /do\s*(\d+[-\d]*)/gi,
      /la\s*(\d+[-\d]*)/gi,
      /da\s*(\d+[-\d]*)/gi,
    ];

    for (const pattern of docPatterns) {
      const matches = question.match(pattern);
      if (matches) {
        documentHints.push(...matches);
      }
    }

    // Extract section hints
    const sectionHints: string[] = [];
    const sectionMatches = question.match(/section\s+(\d+[\.\d]*)/gi);
    if (sectionMatches) {
      sectionHints.push(...sectionMatches);
    }

    // Extract keywords
    const keywords = this.extractKeywords(question);

    // Determine query type
    let queryType = 'general';
    if (specificIndicators.sectionCount) queryType = 'section_count';
    else if (specificIndicators.sectionList) queryType = 'section_list';
    else if (specificIndicators.sectionContent) queryType = 'section_content';
    else if (specificIndicators.citation) queryType = 'citation';
    else if (specificIndicators.verbatim) queryType = 'verbatim';

    return {
      requiresDocumentIntelligence: isSpecific || documentHints.length > 0 || sectionHints.length > 0,
      isSpecificQuery: isSpecific,
      queryType,
      documentHints,
      sectionHints,
      keywords
    };
  }

  /**
   * Get an enhanced response that combines AI and document intelligence
   */
  async getEnhancedResponse(question: string, aiResponse?: string): Promise<EnhancedResponse> {
    await this.initialize();

    const analysis = this.analyzeQuestion(question);

    // If no document intelligence needed, return AI response as-is
    if (!analysis.requiresDocumentIntelligence) {
      return {
        mainResponse: aiResponse || '',
        confidence: 0.7,
        usedDocumentIntelligence: false
      };
    }

    // Get document intelligence response
    const intelligenceResponse = await documentIntelligence.processQuery({
      question,
      documentHint: analysis.documentHints[0],
      requiresExactCitation: analysis.queryType === 'citation' || analysis.queryType === 'verbatim'
    });

    // If document intelligence found good results, prioritize it
    if (intelligenceResponse.confidence > 0.7) {
      return this.formatEnhancedResponse(intelligenceResponse, aiResponse, analysis);
    }

    // If AI response exists and doc intelligence is weak, combine them
    if (aiResponse && intelligenceResponse.confidence < 0.5) {
      return {
        mainResponse: aiResponse,
        additionalContext: intelligenceResponse.answer !== '' ?
          `\n\n**Document Reference:**\n${intelligenceResponse.answer}` : undefined,
        citation: intelligenceResponse.citation || undefined,
        confidence: 0.7,
        usedDocumentIntelligence: false
      };
    }

    return this.formatEnhancedResponse(intelligenceResponse, aiResponse, analysis);
  }

  /**
   * Get specific document information
   */
  async getDocumentInfo(documentRef: string): Promise<{
    found: boolean;
    stats?: {
      title: string;
      sectionCount: number;
      subsectionCount: number;
      sections: { number: string; title: string }[];
    };
    fullText?: string;
  }> {
    await this.initialize();

    const docs = await documentIntelligence.getAvailableDocuments();
    const normalizedRef = documentRef.toLowerCase().replace(/[^a-z0-9]/g, '');

    const matchedDoc = docs.find((d: { id: string; title: string; type: string }) =>
      d.id.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalizedRef) ||
      d.title.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalizedRef)
    );

    if (!matchedDoc) {
      return { found: false };
    }

    const response = await documentIntelligence.processQuery({
      question: `How many sections are in ${matchedDoc.title}`,
      documentHint: matchedDoc.id
    });

    const sectionResponse = await documentIntelligence.processQuery({
      question: `What are the sections of ${matchedDoc.title}`,
      documentHint: matchedDoc.id
    });

    const fullText = await documentIntelligence.getFullDocumentText(matchedDoc.id);

    // Parse the section list from the response
    const sectionLines = sectionResponse.answer.split('\n')
      .filter((line: string) => line.startsWith('- **Section'));

    const sections = sectionLines.map((line: string) => {
      const match = line.match(/Section\s+([^:]+):\s*(.*)$/);
      return {
        number: match?.[1]?.replace(/\*\*/g, '').trim() || '',
        title: match?.[2]?.replace(/\*\*/g, '').trim() || ''
      };
    }).filter((s: { number: string; title: string }) => s.number);

    return {
      found: true,
      stats: {
        title: matchedDoc.title,
        sectionCount: sections.length,
        subsectionCount: 0, // Would need more detailed parsing
        sections
      },
      fullText: fullText || undefined
    };
  }

  /**
   * Get specific section content with citation
   */
  async getSectionContent(documentRef: string, sectionNumber: string): Promise<{
    found: boolean;
    content?: string;
    citation?: string;
    title?: string;
  }> {
    await this.initialize();

    const response = await documentIntelligence.processQuery({
      question: `What does section ${sectionNumber} of ${documentRef} state?`,
      documentHint: documentRef,
      requiresExactCitation: true
    });

    if (response.confidence < 0.5) {
      return { found: false };
    }

    return {
      found: true,
      content: response.verbatimQuote || response.answer,
      citation: response.citation,
      title: response.sourceSection
    };
  }

  /**
   * Search across all documents
   */
  async searchDocuments(query: string, limit: number = 5): Promise<{
    results: {
      document: string;
      section: string;
      content: string;
      citation: string;
      relevance: number;
    }[];
  }> {
    await this.initialize();

    const response = await documentIntelligence.processQuery({
      question: query
    });

    // This is a simplified version - could be expanded
    return {
      results: response.additionalReferences ?
        [{
          document: response.sourceDocument || '',
          section: response.sourceSection || '',
          content: response.answer,
          citation: response.citation,
          relevance: response.confidence
        }] : []
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Extract keywords from question
   */
  private extractKeywords(question: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
      'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
      'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
      'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here',
      'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more',
      'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
      'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or',
      'because', 'until', 'while', 'what', 'which', 'who', 'whom', 'this',
      'that', 'these', 'those', 'am', 'it', 'its', 'they', 'them', 'their',
      'we', 'us', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'i', 'me', 'my'
    ]);

    return question
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  /**
   * Format the enhanced response - CONCISE format
   */
  private formatEnhancedResponse(
    intelligence: IntelligenceResponse,
    aiResponse: string | undefined,
    analysis: QuestionAnalysis
  ): EnhancedResponse {
    // Keep response concise - no redundant headers
    let mainResponse = intelligence.answer;

    // Only add citation if specifically requested or very relevant
    if (analysis.queryType === 'citation' && intelligence.citation) {
      mainResponse += `\n\nSource: ${intelligence.citation}`;
    }

    // Predict likely follow-up questions
    const likelyFollowUps = this.predictFollowUps(analysis, intelligence);

    return {
      mainResponse,
      citation: intelligence.citation || undefined,
      verbatimQuote: intelligence.verbatimQuote,
      confidence: intelligence.confidence,
      usedDocumentIntelligence: true,
      sourceDocuments: intelligence.sourceDocument ? [intelligence.sourceDocument] : undefined,
      additionalContext: intelligence.additionalReferences?.slice(0, 2).join('\n'),  // Max 2 refs
      likelyFollowUps
    };
  }

  /**
   * Predict what the interviewer might ask next
   */
  private predictFollowUps(analysis: QuestionAnalysis, intelligence: IntelligenceResponse): string[] {
    const predictions: string[] = [];
    const docRef = analysis.documentHints[0] || intelligence.sourceDocument;

    switch (analysis.queryType) {
      case 'section_count':
        predictions.push('What are the section names?');
        if (docRef) predictions.push(`What does Section 1 of ${docRef} cover?`);
        break;

      case 'section_list':
        predictions.push('Tell me about Section X');
        predictions.push('What are the key requirements?');
        break;

      case 'section_content':
        predictions.push('What are the penalties for non-compliance?');
        predictions.push('How do we implement this?');
        break;

      case 'citation':
        predictions.push('What are the specific requirements?');
        break;

      case 'verbatim':
        predictions.push('Can you explain this in simpler terms?');
        break;

      default:
        if (intelligence.followUpHints?.length) {
          // Use hints from document intelligence
          if (intelligence.followUpHints.includes('penalty')) {
            predictions.push('What are the penalties?');
          }
          if (intelligence.followUpHints.includes('procedure')) {
            predictions.push('What is the procedure/process?');
          }
          if (intelligence.followUpHints.includes('requirement')) {
            predictions.push('What are the requirements?');
          }
        }
    }

    return predictions.slice(0, 3);  // Max 3 predictions
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const intelligentResponse = new IntelligentResponseService();

export default IntelligentResponseService;
