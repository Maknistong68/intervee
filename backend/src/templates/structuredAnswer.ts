// Structured Answer Templates
// Formats answers according to question type and confidence level

import {
  StructuredAnswer,
  EnhancedQuestionType,
  SearchResult,
  ConfidenceEvaluation,
} from '../knowledge/types/legalDocument.js';
import { confidenceService } from '../services/confidenceService.js';

// Answer length guidelines by question type
const LENGTH_GUIDELINES: Record<EnhancedQuestionType, { min: number; max: number }> = {
  SPECIFIC: { min: 30, max: 50 },
  PROCEDURAL: { min: 80, max: 120 },
  GENERIC: { min: 60, max: 80 },
  DEFINITION: { min: 40, max: 70 },
  SCENARIO: { min: 80, max: 120 },
  COMPARISON: { min: 80, max: 120 },
  EXCEPTION: { min: 60, max: 100 },
  LIST: { min: 80, max: 120 },
  SECTION_QUERY: { min: 50, max: 100 },
  CITATION_QUERY: { min: 60, max: 100 },
};

// First-person intro phrases by question type
const INTRO_PHRASES: Record<EnhancedQuestionType, string[]> = {
  SPECIFIC: [
    'The requirement is',
    'Based on the regulations,',
    'According to',
  ],
  PROCEDURAL: [
    'The process involves',
    'The steps are as follows:',
    'To accomplish this,',
  ],
  GENERIC: [
    'In my understanding,',
    'Based on my knowledge,',
    'From my experience,',
  ],
  DEFINITION: [
    'This refers to',
    'It is defined as',
    'This means',
  ],
  SCENARIO: [
    'In this situation,',
    'If that happens,',
    'When that occurs,',
  ],
  COMPARISON: [
    'The key differences are',
    'To compare,',
    'The distinction is',
  ],
  EXCEPTION: [
    'The exceptions include',
    'There are exemptions for',
    'The rule does not apply when',
  ],
  LIST: [
    'There are several',
    'The main ones are',
    'The following apply:',
  ],
  SECTION_QUERY: [
    'This section states',
    'According to this provision,',
    'The section provides that',
  ],
  CITATION_QUERY: [
    'Under this law,',
    'As stated in',
    'This regulation provides',
  ],
};

export interface AnswerTemplateInput {
  questionType: EnhancedQuestionType;
  searchResults: SearchResult[];
  confidence: ConfidenceEvaluation;
  rawAnswer: string;
  processingTimeMs: number;
}

/**
 * Structured Answer Builder
 * Creates formatted answers based on question type and search results
 */
export class StructuredAnswerBuilder {
  /**
   * Build a structured answer from search results and raw answer
   */
  build(input: AnswerTemplateInput): StructuredAnswer {
    const { questionType, searchResults, confidence, rawAnswer, processingTimeMs } = input;

    // Get primary legal basis
    const legalBasis = this.extractLegalBasis(searchResults);

    // Build structured answer
    return {
      shortAnswer: this.formatShortAnswer(rawAnswer, questionType, confidence),
      legalBasis,
      explanation: this.shouldIncludeExplanation(questionType, confidence)
        ? this.formatExplanation(rawAnswer, questionType)
        : undefined,
      followUpSuggestions: this.generateFollowUps(questionType, searchResults),
      confidence,
      metadata: {
        questionType,
        searchResults: searchResults.length,
        topScore: searchResults[0]?.score || 0,
        processingTimeMs,
      },
    };
  }

  /**
   * Format the short answer (30-50 words for most types)
   */
  private formatShortAnswer(
    rawAnswer: string,
    questionType: EnhancedQuestionType,
    confidence: ConfidenceEvaluation
  ): string {
    const guidelines = LENGTH_GUIDELINES[questionType];

    // For refusal, return the refusal message
    if (confidence.recommendation === 'refuse') {
      return confidence.refusalReason ||
        'I would need to verify that specific detail in the regulations.';
    }

    // Add qualifier if needed
    let answer = rawAnswer;
    if (confidence.recommendation === 'qualified') {
      const qualifier = confidenceService.getQualifierPhrase(confidence);
      if (!answer.toLowerCase().startsWith(qualifier.toLowerCase().split(' ')[0])) {
        answer = `${qualifier} ${answer}`;
      }
    }

    // Truncate if too long
    const words = answer.split(/\s+/);
    if (words.length > guidelines.max) {
      answer = words.slice(0, guidelines.max).join(' ') + '...';
    }

    return answer;
  }

  /**
   * Extract legal basis from search results
   */
  private extractLegalBasis(searchResults: SearchResult[]): {
    primary: string;
    secondary?: string[];
    effectiveDate?: string;
    excerpt?: string;
  } {
    if (searchResults.length === 0) {
      return { primary: 'Unable to identify specific provision' };
    }

    const topResult = searchResults[0];
    const primary = `${topResult.section.lawName}, ${topResult.section.sectionNumber}`;

    // Get secondary sources if available
    const secondary = searchResults
      .slice(1, 3)
      .filter((r) => r.score > 0.3)
      .map((r) => `${r.section.lawName}, ${r.section.sectionNumber}`);

    // Extract a relevant excerpt
    const excerpt = topResult.highlights?.[0] ||
      topResult.section.content.substring(0, 150).trim() + '...';

    return {
      primary,
      secondary: secondary.length > 0 ? secondary : undefined,
      effectiveDate: topResult.section.effectiveDate,
      excerpt,
    };
  }

  /**
   * Determine if explanation should be included
   */
  private shouldIncludeExplanation(
    questionType: EnhancedQuestionType,
    confidence: ConfidenceEvaluation
  ): boolean {
    // Always include for complex question types
    const complexTypes: EnhancedQuestionType[] = [
      'SCENARIO', 'COMPARISON', 'EXCEPTION', 'PROCEDURAL'
    ];

    if (complexTypes.includes(questionType)) return true;

    // Include if confidence is qualified (to explain uncertainty)
    if (confidence.recommendation === 'qualified') return true;

    return false;
  }

  /**
   * Format the explanation section
   */
  private formatExplanation(
    rawAnswer: string,
    questionType: EnhancedQuestionType
  ): string {
    // For now, just return the fuller answer
    // In a full implementation, this would be generated separately
    const words = rawAnswer.split(/\s+/);
    if (words.length > 50) {
      return rawAnswer;
    }
    return '';
  }

  /**
   * Generate follow-up question suggestions
   */
  private generateFollowUps(
    questionType: EnhancedQuestionType,
    searchResults: SearchResult[]
  ): string[] {
    const followUps: string[] = [];

    if (searchResults.length === 0) {
      return ['What are the general OSH requirements?'];
    }

    const topResult = searchResults[0];

    // Generate based on question type
    switch (questionType) {
      case 'SPECIFIC':
        followUps.push(`What are the penalties for non-compliance?`);
        followUps.push(`Are there any exceptions to this requirement?`);
        break;

      case 'PROCEDURAL':
        followUps.push(`What are the deadlines for this process?`);
        followUps.push(`What documents are required?`);
        break;

      case 'DEFINITION':
        followUps.push(`What are the requirements related to this?`);
        followUps.push(`Where can I find more details in the regulations?`);
        break;

      case 'SCENARIO':
        followUps.push(`What are the legal consequences?`);
        followUps.push(`What should be documented?`);
        break;

      case 'COMPARISON':
        followUps.push(`When should I choose one over the other?`);
        followUps.push(`What are the specific requirements for each?`);
        break;

      case 'EXCEPTION':
        followUps.push(`How do I qualify for the exception?`);
        followUps.push(`What documentation is needed?`);
        break;

      case 'LIST':
        followUps.push(`Can you explain one of these in detail?`);
        followUps.push(`Are there any recent updates to this list?`);
        break;

      default:
        // Add topic-based follow-ups
        if (topResult.section.topicTags.length > 0) {
          const tag = topResult.section.topicTags[0];
          followUps.push(`What else should I know about ${tag}?`);
        }
    }

    return followUps.slice(0, 3);
  }

  /**
   * Get intro phrase for question type
   */
  getIntroPhrase(questionType: EnhancedQuestionType): string {
    const phrases = INTRO_PHRASES[questionType] || INTRO_PHRASES.GENERIC;
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
}

// ================================
// Answer Format Templates
// ================================

/**
 * Format a refusal response
 */
export function formatRefusalResponse(
  confidence: ConfidenceEvaluation,
  questionType: EnhancedQuestionType
): string {
  const reason = confidence.refusalReason ||
    'I was unable to find a definitive answer in the OSH regulations.';

  return `I need to be honest - ${reason.toLowerCase().replace(/^the /, '')} ` +
    `I would recommend consulting the specific regulation or contacting DOLE-BWC for clarification.`;
}

/**
 * Format a confident response template
 */
export function formatConfidentResponse(
  answer: string,
  legalBasis: string,
  questionType: EnhancedQuestionType
): string {
  // Add citation naturally based on question type
  const citationPhrases: Record<string, string> = {
    SPECIFIC: `per ${legalBasis}`,
    PROCEDURAL: `as outlined in ${legalBasis}`,
    GENERIC: `according to ${legalBasis}`,
    DEFINITION: `as defined in ${legalBasis}`,
    SCENARIO: `under ${legalBasis}`,
    COMPARISON: `based on ${legalBasis}`,
    EXCEPTION: `as provided in ${legalBasis}`,
    LIST: `per ${legalBasis}`,
    SECTION_QUERY: `as stated in ${legalBasis}`,
    CITATION_QUERY: `under ${legalBasis}`,
  };

  const citation = citationPhrases[questionType] || `per ${legalBasis}`;

  // Check if answer already mentions the citation
  if (answer.toLowerCase().includes(legalBasis.toLowerCase().split(',')[0])) {
    return answer;
  }

  return `${answer} This is ${citation}.`;
}

/**
 * Format a qualified response template
 */
export function formatQualifiedResponse(
  answer: string,
  qualifier: string,
  legalBasis: string
): string {
  return `${qualifier} ${answer} For the specific details, please refer to ${legalBasis}.`;
}

// Export singleton builder instance
export const structuredAnswerBuilder = new StructuredAnswerBuilder();
