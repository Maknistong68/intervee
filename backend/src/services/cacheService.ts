import { Redis } from 'ioredis';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { Citation } from '../types/index.js';

interface CachedAnswerData {
  answer: string;
  confidence: number;
  citations: Citation[];
}

class CacheService {
  private redis: Redis | null = null;
  private memoryCache: Map<string, { data: CachedAnswerData; expiry: number }> = new Map();
  private readonly PREFIX = 'intervee:answer:';
  private cacheVersion: number = 1; // For cache invalidation

  constructor() {
    if (config.cacheEnabled) {
      this.initRedis();
    }
  }

  private initRedis(): void {
    try {
      this.redis = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          if (times > 3) {
            console.warn('[Cache] Redis connection failed, falling back to memory cache');
            return null;
          }
          return Math.min(times * 200, 1000);
        },
      });

      if (this.redis) {
        this.redis.on('connect', () => {
          console.log('[Cache] Redis connected');
        });

        this.redis.on('error', (err: Error) => {
          console.warn('[Cache] Redis error:', err.message);
        });
      }
    } catch (error) {
      console.warn('[Cache] Failed to initialize Redis, using memory cache');
      this.redis = null;
    }
  }

  private hashQuestion(question: string): string {
    // Normalize the question for consistent hashing
    const normalized = question
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  async getAnswer(question: string): Promise<CachedAnswerData | null> {
    if (!config.cacheEnabled) return null;

    const hash = this.hashQuestion(question);
    const key = this.PREFIX + hash;

    // Try Redis first
    if (this.redis) {
      try {
        const data = await this.redis.get(key);
        if (data) {
          // Update hit count
          await this.redis.hincrby(`${key}:meta`, 'hits', 1);
          return JSON.parse(data);
        }
      } catch (error) {
        console.warn('[Cache] Redis get error:', error);
      }
    }

    // Fall back to memory cache
    const memCached = this.memoryCache.get(key);
    if (memCached && memCached.expiry > Date.now()) {
      return memCached.data;
    }

    return null;
  }

  async setAnswer(question: string, data: CachedAnswerData): Promise<void> {
    if (!config.cacheEnabled) return;

    const hash = this.hashQuestion(question);
    const key = this.PREFIX + hash;

    // Save to Redis
    if (this.redis) {
      try {
        await this.redis.setex(key, config.cacheTTL, JSON.stringify(data));
        await this.redis.hset(`${key}:meta`, {
          question: question.substring(0, 200),
          createdAt: Date.now().toString(),
          hits: '1',
        });
      } catch (error) {
        console.warn('[Cache] Redis set error:', error);
      }
    }

    // Also save to memory cache
    this.memoryCache.set(key, {
      data,
      expiry: Date.now() + config.cacheTTL * 1000,
    });

    // Clean old memory entries
    this.cleanMemoryCache();
  }

  async getSimilarQuestions(question: string, limit: number = 5): Promise<string[]> {
    // Simple keyword-based similarity for quick lookups
    // In production, you'd use vector embeddings
    const keywords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);

    if (!this.redis) return [];

    try {
      const keys = await this.redis.keys(`${this.PREFIX}*:meta`);
      const similar: string[] = [];

      for (const metaKey of keys.slice(0, 50)) {
        const storedQuestion = await this.redis.hget(metaKey, 'question');
        if (storedQuestion) {
          const storedWords = storedQuestion.toLowerCase().split(/\s+/);
          const matches = keywords.filter(kw => storedWords.some((sw: string) => sw.includes(kw)));
          if (matches.length >= 2) {
            similar.push(storedQuestion);
          }
        }
        if (similar.length >= limit) break;
      }

      return similar;
    } catch (error) {
      return [];
    }
  }

  private cleanMemoryCache(): void {
    const now = Date.now();
    const maxSize = config.memoryCacheMaxSize || 100;

    // Remove expired entries
    for (const [key, value] of this.memoryCache) {
      if (value.expiry < now) {
        this.memoryCache.delete(key);
      }
    }

    // If still too large, remove oldest entries (LRU-style)
    if (this.memoryCache.size > maxSize) {
      const entries = Array.from(this.memoryCache.entries())
        .sort((a, b) => a[1].expiry - b[1].expiry);

      for (let i = 0; i < entries.length - maxSize; i++) {
        this.memoryCache.delete(entries[i][0]);
      }
      console.log(`[Cache] Memory cache trimmed to ${maxSize} entries`);
    }
  }

  async preloadCommonQuestions(): Promise<void> {
    // No pre-loaded questions - AI generates all answers dynamically
    console.log(`[Cache] Cache ready for dynamic answers`);
  }

  async clearCache(): Promise<void> {
    this.memoryCache.clear();

    if (this.redis) {
      try {
        const keys = await this.redis.keys(`${this.PREFIX}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch (error) {
        console.warn('[Cache] Clear error:', error);
      }
    }
  }

  /**
   * Invalidate all cached answers (e.g., after knowledge base update)
   * Increments cache version to invalidate all existing entries
   */
  async invalidateAll(): Promise<{ memoryCleared: number; redisCleared: number }> {
    const memoryCleared = this.memoryCache.size;
    this.memoryCache.clear();
    this.cacheVersion++;

    let redisCleared = 0;
    if (this.redis) {
      try {
        const keys = await this.redis.keys(`${this.PREFIX}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          redisCleared = keys.length;
        }
      } catch (error) {
        console.warn('[Cache] Invalidation error:', error);
      }
    }

    console.log(`[Cache] Invalidated all cache: ${memoryCleared} memory, ${redisCleared} Redis entries (version: ${this.cacheVersion})`);
    return { memoryCleared, redisCleared };
  }

  /**
   * Get current cache version
   */
  getCacheVersion(): number {
    return this.cacheVersion;
  }

  /**
   * Get cache statistics
   */
  getStats(): { memoryCacheSize: number; cacheVersion: number; redisConnected: boolean } {
    return {
      memoryCacheSize: this.memoryCache.size,
      cacheVersion: this.cacheVersion,
      redisConnected: this.redis !== null,
    };
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

export const cacheService = new CacheService();
