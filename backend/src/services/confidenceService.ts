// Confidence Service
// Evaluates answer confidence and determines response strategy

import {
  ConfidenceEvaluation,
  ConfidenceFactor,
  SearchResult,
  EnhancedQuestionType,
} from '../knowledge/types/legalDocument.js';

// Confidence thresholds
const THRESHOLDS = {
  CONFIDENT: 0.6,      // Score > 0.6: Confident answer
  QUALIFIED: 0.4,      // Score 0.4-0.6: Answer with qualifier
  REFUSE: 0.4,         // Score < 0.4: Refuse with explanation
};

// Factor weights (must sum to 1.0)
const FACTOR_WEIGHTS = {
  citationMatch: 0.35,     // How closely answer matches cited sources
  sourceCount: 0.20,       // Number of supporting sources
  sectionRelevance: 0.25,  // Semantic similarity score
  numericalAccuracy: 0.10, // Exact match for numbers
  recency: 0.10,           // Is source current (not superseded)
};

export interface ConfidenceInput {
  searchResults: SearchResult[];
  questionType: EnhancedQuestionType;
  hasExactCitation: boolean;
  hasNumericalMatch: boolean;
  queryKeywords: string[];
}

/**
 * Confidence Service
 * Evaluates the reliability of answers and determines response strategy
 */
class ConfidenceService {
  /**
   * Evaluate confidence for a set of search results
   */
  evaluate(input: ConfidenceInput): ConfidenceEvaluation {
    const factors: ConfidenceFactor[] = [];

    // 1. Citation Match Factor
    const citationScore = this.evaluateCitationMatch(input);
    factors.push({
      name: 'citationMatch',
      weight: FACTOR_WEIGHTS.citationMatch,
      score: citationScore,
      reason: this.getCitationReason(citationScore, input),
    });

    // 2. Source Count Factor
    const sourceScore = this.evaluateSourceCount(input);
    factors.push({
      name: 'sourceCount',
      weight: FACTOR_WEIGHTS.sourceCount,
      score: sourceScore,
      reason: this.getSourceReason(sourceScore, input.searchResults.length),
    });

    // 3. Section Relevance Factor
    const relevanceScore = this.evaluateSectionRelevance(input);
    factors.push({
      name: 'sectionRelevance',
      weight: FACTOR_WEIGHTS.sectionRelevance,
      score: relevanceScore,
      reason: this.getRelevanceReason(relevanceScore),
    });

    // 4. Numerical Accuracy Factor
    const numericalScore = this.evaluateNumericalAccuracy(input);
    factors.push({
      name: 'numericalAccuracy',
      weight: FACTOR_WEIGHTS.numericalAccuracy,
      score: numericalScore,
      reason: this.getNumericalReason(numericalScore, input),
    });

    // 5. Recency Factor
    const recencyScore = this.evaluateRecency(input);
    factors.push({
      name: 'recency',
      weight: FACTOR_WEIGHTS.recency,
      score: recencyScore,
      reason: this.getRecencyReason(recencyScore),
    });

    // Calculate overall score
    const overallScore = factors.reduce(
      (sum, f) => sum + f.score * f.weight,
      0
    );

    // Determine recommendation
    const recommendation = this.getRecommendation(overallScore, input);
    const refusalReason = recommendation === 'refuse'
      ? this.getRefusalReason(factors, input)
      : undefined;

    return {
      score: overallScore,
      factors,
      recommendation,
      refusalReason,
    };
  }

  /**
   * Evaluate citation match quality
   */
  private evaluateCitationMatch(input: ConfidenceInput): number {
    if (input.searchResults.length === 0) return 0;

    // Check if we have exact citation matches
    if (input.hasExactCitation) return 1.0;

    // Check match types in results
    const hasDirectMatch = input.searchResults.some(
      (r) => r.matchType.includes('section_number') || r.matchType.includes('law_id')
    );
    if (hasDirectMatch) return 0.85;

    // Check if top result has good semantic match
    const topScore = input.searchResults[0]?.score || 0;
    if (topScore > 0.7) return 0.75;
    if (topScore > 0.5) return 0.5;

    return 0.3;
  }

  /**
   * Evaluate source count quality
   */
  private evaluateSourceCount(input: ConfidenceInput): number {
    const count = input.searchResults.length;

    if (count === 0) return 0;
    if (count >= 3) return 1.0;
    if (count >= 2) return 0.8;
    return 0.5; // Single source
  }

  /**
   * Evaluate section relevance based on search scores
   */
  private evaluateSectionRelevance(input: ConfidenceInput): number {
    if (input.searchResults.length === 0) return 0;

    // Average of top 3 results
    const topResults = input.searchResults.slice(0, 3);
    const avgScore = topResults.reduce((sum, r) => sum + r.score, 0) / topResults.length;

    return Math.min(1, avgScore * 1.5); // Scale up slightly
  }

  /**
   * Evaluate numerical accuracy
   */
  private evaluateNumericalAccuracy(input: ConfidenceInput): number {
    // For questions without numerical components, give neutral score
    const isNumericalQuestion = this.isNumericalQuestionType(input.questionType);

    if (!isNumericalQuestion) return 0.7; // Neutral - not applicable

    if (input.hasNumericalMatch) return 1.0;

    // Check if any results have numerical values
    const hasNumerical = input.searchResults.some(
      (r) => r.matchType.includes('numerical') || r.section.numericalValues.length > 0
    );

    return hasNumerical ? 0.6 : 0.3;
  }

  /**
   * Evaluate recency of sources
   */
  private evaluateRecency(input: ConfidenceInput): number {
    if (input.searchResults.length === 0) return 0;

    // Check if all sources are current
    const currentSources = input.searchResults.filter(
      (r) => r.section.status === 'current'
    );

    const ratio = currentSources.length / input.searchResults.length;
    return ratio;
  }

  /**
   * Determine the response recommendation
   */
  private getRecommendation(
    score: number,
    input: ConfidenceInput
  ): 'confident' | 'qualified' | 'refuse' {
    // Special cases that should be refused regardless of score
    if (input.searchResults.length === 0) {
      return 'refuse';
    }

    // For section queries, require higher confidence
    if (input.questionType === 'SECTION_QUERY' && !input.hasExactCitation) {
      if (score < 0.5) return 'refuse';
    }

    // Standard threshold evaluation
    if (score >= THRESHOLDS.CONFIDENT) return 'confident';
    if (score >= THRESHOLDS.QUALIFIED) return 'qualified';
    return 'refuse';
  }

  /**
   * Generate refusal reason based on factors
   */
  private getRefusalReason(
    factors: ConfidenceFactor[],
    input: ConfidenceInput
  ): string {
    // Find the weakest factors
    const sortedFactors = [...factors].sort((a, b) => a.score - b.score);
    const weakest = sortedFactors[0];

    if (input.searchResults.length === 0) {
      return 'No relevant legal provisions found for this question. The topic may be outside Philippine OSH regulations.';
    }

    switch (weakest.name) {
      case 'citationMatch':
        return 'The question references specific legal provisions that could not be precisely identified in the knowledge base.';
      case 'sourceCount':
        return 'Insufficient sources found to provide a reliable answer.';
      case 'sectionRelevance':
        return 'The available legal sections do not closely match the question topic.';
      case 'numericalAccuracy':
        return 'The specific numerical values requested could not be verified in the legal sources.';
      case 'recency':
        return 'The relevant provisions may have been amended. Please verify with the latest regulations.';
      default:
        return 'Unable to provide a confident answer based on available sources.';
    }
  }

  /**
   * Check if question type involves numerical values
   */
  private isNumericalQuestionType(type: EnhancedQuestionType): boolean {
    return ['SPECIFIC', 'LIST'].includes(type);
  }

  // Reason generators for each factor

  private getCitationReason(score: number, input: ConfidenceInput): string {
    if (input.hasExactCitation) return 'Exact citation match found';
    if (score > 0.8) return 'Direct section reference matched';
    if (score > 0.5) return 'Good semantic match to legal provisions';
    return 'No direct citation match';
  }

  private getSourceReason(score: number, count: number): string {
    if (count >= 3) return `${count} supporting sources found`;
    if (count >= 1) return `${count} source(s) found`;
    return 'No sources found';
  }

  private getRelevanceReason(score: number): string {
    if (score > 0.8) return 'Highly relevant sections identified';
    if (score > 0.5) return 'Moderately relevant sections found';
    return 'Low relevance to query';
  }

  private getNumericalReason(score: number, input: ConfidenceInput): string {
    if (input.hasNumericalMatch) return 'Exact numerical value matched';
    if (score > 0.6) return 'Numerical values found in sources';
    if (score === 0.7) return 'Not applicable (non-numerical question)';
    return 'No numerical match found';
  }

  private getRecencyReason(score: number): string {
    if (score === 1) return 'All sources are current';
    if (score > 0.5) return 'Most sources are current';
    return 'Some sources may be outdated';
  }

  /**
   * Generate qualifier phrase for qualified answers
   */
  getQualifierPhrase(evaluation: ConfidenceEvaluation): string {
    const weakFactors = evaluation.factors
      .filter((f) => f.score < 0.5)
      .map((f) => f.name);

    if (weakFactors.includes('citationMatch')) {
      return 'Based on my understanding of related provisions,';
    }
    if (weakFactors.includes('recency')) {
      return 'According to available regulations, which should be verified for recent amendments,';
    }
    if (weakFactors.includes('sourceCount')) {
      return 'Based on limited sources,';
    }

    return 'To my knowledge,';
  }

  /**
   * Get confidence level label
   */
  getConfidenceLabel(score: number): string {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Moderate';
    if (score >= 0.4) return 'Low';
    return 'Very Low';
  }
}

// Export singleton instance
export const confidenceService = new ConfidenceService();
