// Hybrid Search Service
// Combines vector (semantic) search with exact (keyword/section) search

import { PrismaClient, Prisma } from '@prisma/client';
import { embeddingService } from './embeddingService.js';
import {
  LegalSection,
  SearchResult,
  SearchMatchType,
  HybridSearchOptions,
  NumericalQuery,
  LawType,
} from '../knowledge/types/legalDocument.js';

const prisma = new PrismaClient();

// Search weights for hybrid scoring
const SEARCH_WEIGHTS = {
  vector: 0.5,        // Semantic similarity
  sectionNumber: 0.3, // Exact section match
  keyword: 0.15,      // Keyword match
  numerical: 0.05,    // Numerical value match
};

// Minimum scores for inclusion
const MIN_VECTOR_SCORE = 0.3;
const MIN_COMBINED_SCORE = 0.25;

export interface HybridSearchResult {
  results: SearchResult[];
  totalFound: number;
  searchTimeMs: number;
  strategy: string[];
}

/**
 * Hybrid Search Service
 * Combines multiple search strategies for optimal legal document retrieval
 */
class HybridSearchService {
  /**
   * Main search method - combines vector and exact search
   */
  async search(options: HybridSearchOptions): Promise<HybridSearchResult> {
    const startTime = Date.now();
    const strategies: string[] = [];
    const allResults: Map<string, SearchResult> = new Map();

    // Generate query embedding if not provided
    let queryEmbedding = options.embedding;
    if (!queryEmbedding && options.query) {
      queryEmbedding = await embeddingService.embed(options.query);
    }

    // 1. Vector search (semantic similarity)
    if (queryEmbedding) {
      strategies.push('vector');
      const vectorResults = await this.vectorSearch(queryEmbedding, options);
      for (const result of vectorResults) {
        this.mergeResult(allResults, result);
      }
    }

    // 2. Section number search (exact match)
    if (options.sectionNumbers && options.sectionNumbers.length > 0) {
      strategies.push('section_number');
      const sectionResults = await this.sectionNumberSearch(options.sectionNumbers, options);
      for (const result of sectionResults) {
        this.mergeResult(allResults, result);
      }
    }

    // 3. Law ID filter
    if (options.lawIds && options.lawIds.length > 0) {
      strategies.push('law_id');
      const lawResults = await this.lawIdSearch(options.lawIds, options);
      for (const result of lawResults) {
        this.mergeResult(allResults, result);
      }
    }

    // 4. Keyword search in content
    if (options.query) {
      strategies.push('keyword');
      const keywordResults = await this.keywordSearch(options.query, options);
      for (const result of keywordResults) {
        this.mergeResult(allResults, result);
      }
    }

    // 5. Numerical value search
    if (options.numericalQuery) {
      strategies.push('numerical');
      const numericalResults = await this.numericalSearch(options.numericalQuery, options);
      for (const result of numericalResults) {
        this.mergeResult(allResults, result);
      }
    }

    // Filter by minimum score and sort
    let results = Array.from(allResults.values())
      .filter((r) => r.score >= (options.minScore || MIN_COMBINED_SCORE))
      .sort((a, b) => b.score - a.score);

    // Apply limit
    const limit = options.limit || 5;
    results = results.slice(0, limit);

    return {
      results,
      totalFound: allResults.size,
      searchTimeMs: Date.now() - startTime,
      strategy: strategies,
    };
  }

  /**
   * Vector search using pgvector cosine similarity
   */
  private async vectorSearch(
    embedding: number[],
    options: HybridSearchOptions
  ): Promise<SearchResult[]> {
    const limit = options.limit || 10;

    // Build the embedding string for pgvector
    const embeddingStr = `[${embedding.join(',')}]`;

    try {
      // Use raw SQL for vector similarity search
      const results = await prisma.$queryRaw<
        Array<{
          id: string;
          section_id: string;
          section_number: string;
          title: string | null;
          law_id: string;
          chapter_id: string | null;
          chapter_title: string | null;
          content: string;
          content_plain: string;
          topic_tags: string[];
          status: string;
          key_terms: string[];
          similarity: number;
        }>
      >`
        SELECT
          ls.id,
          ls.section_id,
          ls.section_number,
          ls.title,
          l.law_id as law_id,
          ls.chapter_id,
          ls.chapter_title,
          ls.content,
          ls.content_plain,
          ls.topic_tags,
          ls.status,
          ls.key_terms,
          1 - (ls.embedding <=> ${embeddingStr}::vector) as similarity
        FROM "LegalSection" ls
        JOIN "Law" l ON ls.law_id = l.id
        WHERE ls.embedding IS NOT NULL
          AND ls.status = 'CURRENT'
        ORDER BY ls.embedding <=> ${embeddingStr}::vector
        LIMIT ${limit * 2}
      `;

      return results
        .filter((r) => r.similarity >= MIN_VECTOR_SCORE)
        .map((r) => ({
          section: this.mapToLegalSection(r),
          score: r.similarity * SEARCH_WEIGHTS.vector,
          matchType: ['vector'] as SearchMatchType[],
          highlights: this.extractHighlights(r.content_plain, options.query || ''),
        }));
    } catch (error: any) {
      // If pgvector is not set up yet, return empty results
      if (error.message?.includes('vector') || error.code === '42883') {
        console.warn('[HybridSearch] Vector search not available - pgvector may not be enabled');
        return [];
      }
      throw error;
    }
  }

  /**
   * Exact section number search
   */
  private async sectionNumberSearch(
    sectionNumbers: string[],
    options: HybridSearchOptions
  ): Promise<SearchResult[]> {
    // Normalize section numbers for matching
    const normalized = sectionNumbers.map((s) => this.normalizeSectionNumber(s));

    const sections = await prisma.legalSection.findMany({
      where: {
        OR: normalized.map((sn) => ({
          sectionNumber: {
            contains: sn,
            mode: 'insensitive' as const,
          },
        })),
        status: 'CURRENT',
      },
      include: {
        law: true,
        numericalValues: true,
      },
      take: options.limit || 10,
    });

    return sections.map((s) => ({
      section: this.prismaToLegalSection(s),
      score: SEARCH_WEIGHTS.sectionNumber, // High confidence for exact match
      matchType: ['section_number'] as SearchMatchType[],
    }));
  }

  /**
   * Filter by law ID
   */
  private async lawIdSearch(
    lawIds: string[],
    options: HybridSearchOptions
  ): Promise<SearchResult[]> {
    const sections = await prisma.legalSection.findMany({
      where: {
        law: {
          lawId: {
            in: lawIds,
          },
        },
        status: 'CURRENT',
      },
      include: {
        law: true,
        numericalValues: true,
      },
      take: options.limit || 20,
    });

    return sections.map((s) => ({
      section: this.prismaToLegalSection(s),
      score: 0.1, // Low base score - should combine with other strategies
      matchType: ['law_id'] as SearchMatchType[],
    }));
  }

  /**
   * Keyword search in content
   */
  private async keywordSearch(
    query: string,
    options: HybridSearchOptions
  ): Promise<SearchResult[]> {
    const keywords = this.extractSearchKeywords(query);
    if (keywords.length === 0) return [];

    const sections = await prisma.legalSection.findMany({
      where: {
        OR: keywords.map((kw) => ({
          contentPlain: {
            contains: kw,
            mode: 'insensitive' as const,
          },
        })),
        status: 'CURRENT',
      },
      include: {
        law: true,
        numericalValues: true,
      },
      take: options.limit || 15,
    });

    return sections.map((s) => {
      // Calculate keyword match score based on how many keywords match
      const matchCount = keywords.filter((kw) =>
        s.contentPlain.toLowerCase().includes(kw.toLowerCase())
      ).length;
      const matchRatio = matchCount / keywords.length;

      return {
        section: this.prismaToLegalSection(s),
        score: matchRatio * SEARCH_WEIGHTS.keyword,
        matchType: ['keyword'] as SearchMatchType[],
        highlights: this.extractHighlights(s.contentPlain, query),
      };
    });
  }

  /**
   * Numerical value search
   */
  private async numericalSearch(
    query: NumericalQuery,
    options: HybridSearchOptions
  ): Promise<SearchResult[]> {
    let whereClause: any = {};

    switch (query.operator) {
      case 'exact':
        whereClause = { value: query.value };
        break;
      case 'minimum':
        whereClause = { value: { gte: query.value } };
        break;
      case 'maximum':
        whereClause = { value: { lte: query.value } };
        break;
      case 'range':
        whereClause = {
          value: {
            gte: query.value,
            lte: query.rangeMax || query.value * 2,
          },
        };
        break;
    }

    if (query.unit) {
      whereClause.unit = query.unit;
    }

    const numericalValues = await prisma.numericalValue.findMany({
      where: whereClause,
      include: {
        section: {
          include: {
            law: true,
            numericalValues: true,
          },
        },
      },
      take: options.limit || 10,
    });

    return numericalValues.map((nv) => ({
      section: this.prismaToLegalSection(nv.section),
      score: query.operator === 'exact' ? SEARCH_WEIGHTS.numerical : SEARCH_WEIGHTS.numerical * 0.7,
      matchType: ['numerical'] as SearchMatchType[],
      highlights: [`${nv.value} ${nv.unit} - ${nv.context}`],
    }));
  }

  /**
   * Merge a result into the results map, combining scores
   */
  private mergeResult(
    results: Map<string, SearchResult>,
    newResult: SearchResult
  ): void {
    const existing = results.get(newResult.section.id);

    if (existing) {
      // Combine scores (weighted average)
      existing.score = Math.min(1, existing.score + newResult.score);
      // Merge match types
      for (const mt of newResult.matchType) {
        if (!existing.matchType.includes(mt)) {
          existing.matchType.push(mt);
        }
      }
      // Merge highlights
      if (newResult.highlights) {
        existing.highlights = [
          ...(existing.highlights || []),
          ...newResult.highlights,
        ].slice(0, 3);
      }
    } else {
      results.set(newResult.section.id, newResult);
    }
  }

  /**
   * Extract search keywords from query
   */
  private extractSearchKeywords(query: string): string[] {
    // Remove common words
    const stopWords = new Set([
      'what', 'is', 'the', 'a', 'an', 'of', 'in', 'to', 'for', 'and', 'or',
      'how', 'many', 'much', 'does', 'do', 'are', 'if', 'when', 'where', 'who',
      'ano', 'ang', 'ng', 'sa', 'para', 'kung', 'paano', 'sino', 'saan',
    ]);

    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));
  }

  /**
   * Normalize section number for matching
   */
  private normalizeSectionNumber(sn: string): string {
    return sn
      .replace(/[^\w\d.()-]/g, '')
      .replace(/section/i, '')
      .trim();
  }

  /**
   * Extract relevant highlights from content
   */
  private extractHighlights(content: string, query: string): string[] {
    const highlights: string[] = [];
    const keywords = this.extractSearchKeywords(query);
    const sentences = content.split(/[.!?]+/);

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (keywords.some((kw) => lowerSentence.includes(kw))) {
        const trimmed = sentence.trim();
        if (trimmed.length > 20 && trimmed.length < 200) {
          highlights.push(trimmed);
        }
      }
      if (highlights.length >= 2) break;
    }

    return highlights;
  }

  /**
   * Map raw SQL result to LegalSection
   */
  private mapToLegalSection(row: any): LegalSection {
    return {
      id: row.id,
      sectionNumber: row.section_number,
      title: row.title || '',
      lawId: row.law_id,
      lawName: row.law_id, // Will be populated from law relation
      lawType: this.inferLawType(row.law_id),
      chapterId: row.chapter_id,
      chapterTitle: row.chapter_title,
      content: row.content,
      contentPlain: row.content_plain,
      topicTags: row.topic_tags || [],
      status: row.status?.toLowerCase() as any || 'current',
      keyTerms: row.key_terms || [],
      numericalValues: [],
    };
  }

  /**
   * Convert Prisma model to LegalSection type
   */
  private prismaToLegalSection(section: any): LegalSection {
    return {
      id: section.id,
      sectionNumber: section.sectionNumber,
      title: section.title || '',
      lawId: section.law?.lawId || section.lawId,
      lawName: section.law?.shortName || section.law?.lawId || '',
      lawType: this.inferLawType(section.law?.lawId || ''),
      chapterId: section.chapterId,
      chapterTitle: section.chapterTitle,
      content: section.content,
      contentPlain: section.contentPlain,
      topicTags: section.topicTags || [],
      status: section.status?.toLowerCase() as any || 'current',
      keyTerms: section.keyTerms || [],
      numericalValues: (section.numericalValues || []).map((nv: any) => ({
        value: nv.value,
        unit: nv.unit,
        context: nv.context,
        sectionId: section.id,
      })),
    };
  }

  /**
   * Infer law type from law ID
   */
  private inferLawType(lawId: string): LawType {
    const id = lawId.toLowerCase();
    if (id.startsWith('ra')) return 'ra';
    if (id.startsWith('rule')) return 'oshs_rule';
    if (id.startsWith('do')) return 'do';
    if (id.startsWith('la')) return 'la';
    if (id.startsWith('da')) return 'da';
    return 'oshs_rule';
  }

  /**
   * Extract legal references from question text
   * Returns structured references for targeted search
   */
  extractLegalReferences(text: string): { type: string; identifier: string; fullRef: string }[] {
    const refs: { type: string; identifier: string; fullRef: string }[] = [];

    // RA patterns
    const raMatch = text.match(/\b(?:RA|R\.A\.?|Republic\s*Act)\s*(?:No\.?\s*)?(\d+)/gi);
    if (raMatch) {
      for (const m of raMatch) {
        const num = m.match(/\d+/)?.[0];
        if (num) refs.push({ type: 'ra', identifier: num, fullRef: `RA ${num}` });
      }
    }

    // Rule patterns
    const ruleMatch = text.match(/\bRule\s*(\d{4})/gi);
    if (ruleMatch) {
      for (const m of ruleMatch) {
        const num = m.match(/\d+/)?.[0];
        if (num) refs.push({ type: 'rule', identifier: num, fullRef: `Rule ${num}` });
      }
    }

    // Section patterns
    const sectionMatch = text.match(/\bSection\s*(\d+(?:\.\d+)?(?:\([a-z]\))?)/gi);
    if (sectionMatch) {
      for (const m of sectionMatch) {
        const num = m.replace(/section\s*/i, '');
        refs.push({ type: 'section', identifier: num, fullRef: `Section ${num}` });
      }
    }

    // DO patterns
    const doMatch = text.match(/\bDO\s*(\d+)/gi);
    if (doMatch) {
      for (const m of doMatch) {
        const num = m.match(/\d+/)?.[0];
        if (num) refs.push({ type: 'do', identifier: num, fullRef: `DO ${num}` });
      }
    }

    // LA patterns
    const laMatch = text.match(/\bLA\s*(\d+)/gi);
    if (laMatch) {
      for (const m of laMatch) {
        const num = m.match(/\d+/)?.[0];
        if (num) refs.push({ type: 'la', identifier: num, fullRef: `LA ${num}` });
      }
    }

    return refs;
  }

  /**
   * Extract numerical queries from question text
   */
  extractNumericalQuery(text: string): NumericalQuery | null {
    // PHP amount patterns
    const phpMatch = text.match(/(?:PHP|P|₱)\s*([\d,]+(?:\.\d{2})?)/i);
    if (phpMatch) {
      const value = parseFloat(phpMatch[1].replace(/,/g, ''));
      return { value, unit: 'PHP', operator: 'exact' };
    }

    // Hour patterns
    const hourMatch = text.match(/(\d+)\s*(?:hours?|hrs?)/i);
    if (hourMatch) {
      return { value: parseInt(hourMatch[1]), unit: 'hours', operator: 'exact' };
    }

    // Worker patterns
    const workerMatch = text.match(/(\d+)\s*(?:workers?|employees?)/i);
    if (workerMatch) {
      return { value: parseInt(workerMatch[1]), unit: 'workers', operator: 'exact' };
    }

    // Day patterns
    const dayMatch = text.match(/(\d+)\s*(?:days?|calendar\s*days?)/i);
    if (dayMatch) {
      return { value: parseInt(dayMatch[1]), unit: 'days', operator: 'exact' };
    }

    return null;
  }
}

// Export singleton instance
export const hybridSearchService = new HybridSearchService();
