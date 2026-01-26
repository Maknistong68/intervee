// Embedding Service for Semantic Search
// Uses OpenAI text-embedding-3-small (1536 dimensions)

import { getOpenAIClient } from '../config/openai.js';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;
const MAX_BATCH_SIZE = 100; // OpenAI limit for batch embedding
const MAX_INPUT_TOKENS = 8191; // Model limit

export interface EmbeddingResult {
  text: string;
  embedding: number[];
  tokenCount: number;
}

export interface BatchEmbeddingResult {
  results: EmbeddingResult[];
  totalTokens: number;
  processingTimeMs: number;
}

/**
 * Service for generating and managing text embeddings
 * Used for semantic search in the legal knowledge base
 */
class EmbeddingService {
  private openai = getOpenAIClient();
  private cache = new Map<string, number[]>();

  /**
   * Generate embedding for a single text
   */
  async embed(text: string): Promise<number[]> {
    // Check cache first
    const cacheKey = this.getCacheKey(text);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const cleaned = this.prepareText(text);
    if (!cleaned) {
      throw new Error('Cannot generate embedding for empty text');
    }

    try {
      const response = await this.openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: cleaned,
        dimensions: EMBEDDING_DIMENSIONS,
      });

      const embedding = response.data[0].embedding;

      // Cache the result
      this.cache.set(cacheKey, embedding);

      return embedding;
    } catch (error: any) {
      console.error('[EmbeddingService] Error generating embedding:', error.message);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batches
   * More efficient than calling embed() multiple times
   */
  async embedBatch(texts: string[]): Promise<BatchEmbeddingResult> {
    const startTime = Date.now();
    const results: EmbeddingResult[] = [];
    let totalTokens = 0;

    // Prepare texts and filter cached ones
    const preparedTexts: { index: number; text: string; original: string }[] = [];

    for (let i = 0; i < texts.length; i++) {
      const original = texts[i];
      const cleaned = this.prepareText(original);
      const cacheKey = this.getCacheKey(original);

      if (this.cache.has(cacheKey)) {
        // Use cached embedding
        results[i] = {
          text: original,
          embedding: this.cache.get(cacheKey)!,
          tokenCount: 0,
        };
      } else if (cleaned) {
        preparedTexts.push({ index: i, text: cleaned, original });
      }
    }

    // Process uncached texts in batches
    for (let i = 0; i < preparedTexts.length; i += MAX_BATCH_SIZE) {
      const batch = preparedTexts.slice(i, i + MAX_BATCH_SIZE);
      const batchTexts = batch.map((t) => t.text);

      try {
        const response = await this.openai.embeddings.create({
          model: EMBEDDING_MODEL,
          input: batchTexts,
          dimensions: EMBEDDING_DIMENSIONS,
        });

        totalTokens += response.usage?.total_tokens || 0;

        // Map results back to original indices
        for (let j = 0; j < batch.length; j++) {
          const { index, original } = batch[j];
          const embedding = response.data[j].embedding;

          // Cache the result
          this.cache.set(this.getCacheKey(original), embedding);

          results[index] = {
            text: original,
            embedding,
            tokenCount: response.data[j].index,
          };
        }

        // Rate limiting: add small delay between batches
        if (i + MAX_BATCH_SIZE < preparedTexts.length) {
          await this.sleep(100);
        }
      } catch (error: any) {
        console.error(`[EmbeddingService] Batch ${i / MAX_BATCH_SIZE + 1} failed:`, error.message);
        throw error;
      }
    }

    return {
      results,
      totalTokens,
      processingTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Calculate cosine similarity between two embeddings
   * Returns value between -1 and 1 (1 = identical, 0 = unrelated, -1 = opposite)
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have same dimensions');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Find most similar items from a list of embeddings
   */
  findMostSimilar(
    queryEmbedding: number[],
    items: { id: string; embedding: number[] }[],
    topK: number = 5
  ): { id: string; score: number }[] {
    const scored = items.map((item) => ({
      id: item.id,
      score: this.cosineSimilarity(queryEmbedding, item.embedding),
    }));

    // Sort by score descending and take top K
    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  /**
   * Prepare text for embedding
   * - Removes excessive whitespace
   * - Truncates if too long
   */
  private prepareText(text: string): string {
    if (!text) return '';

    // Clean up whitespace
    let cleaned = text.replace(/\s+/g, ' ').trim();

    // Rough token count (4 chars per token approximation)
    const estimatedTokens = cleaned.length / 4;
    if (estimatedTokens > MAX_INPUT_TOKENS) {
      // Truncate to approximate token limit
      const maxChars = MAX_INPUT_TOKENS * 4;
      cleaned = cleaned.substring(0, maxChars);
      console.warn(`[EmbeddingService] Text truncated from ${text.length} to ${maxChars} chars`);
    }

    return cleaned;
  }

  /**
   * Generate cache key for text
   */
  private getCacheKey(text: string): string {
    // Simple hash for cache key
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `emb_${hash}`;
  }

  /**
   * Clear the embedding cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[EmbeddingService] Cache cleared');
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Sleep utility for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get embedding dimensions
   */
  getDimensions(): number {
    return EMBEDDING_DIMENSIONS;
  }

  /**
   * Get the model name
   */
  getModel(): string {
    return EMBEDDING_MODEL;
  }
}

// Export singleton instance
export const embeddingService = new EmbeddingService();
