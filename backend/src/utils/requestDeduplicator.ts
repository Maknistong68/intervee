/**
 * Request Deduplication Utility
 * Prevents duplicate API calls for identical concurrent requests
 * Returns the same Promise for concurrent identical requests
 */

import crypto from 'crypto';

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

export class RequestDeduplicator<T> {
  private pendingRequests: Map<string, PendingRequest<T>> = new Map();
  private name: string;
  private readonly TTL_MS = 60000; // Clean up stale entries after 1 minute

  constructor(name: string) {
    this.name = name;
    // Periodic cleanup of stale entries
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Generate a hash key for a request
   */
  private hashRequest(key: string): string {
    const normalized = key.toLowerCase().replace(/\s+/g, ' ').trim();
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  /**
   * Execute or deduplicate a request
   * If an identical request is in progress, returns the same Promise
   */
  async execute(key: string, operation: () => Promise<T>): Promise<T> {
    const hash = this.hashRequest(key);

    // Check if identical request is in progress
    const pending = this.pendingRequests.get(hash);
    if (pending) {
      console.log(`[RequestDedup:${this.name}] Deduplicating request: ${key.substring(0, 50)}...`);
      return pending.promise;
    }

    // Create new request
    const promise = operation().finally(() => {
      // Remove from pending after completion
      this.pendingRequests.delete(hash);
    });

    this.pendingRequests.set(hash, {
      promise,
      timestamp: Date.now(),
    });

    console.log(`[RequestDedup:${this.name}] New request: ${key.substring(0, 50)}...`);
    return promise;
  }

  /**
   * Check if a request is currently pending
   */
  isPending(key: string): boolean {
    const hash = this.hashRequest(key);
    return this.pendingRequests.has(hash);
  }

  /**
   * Get count of pending requests
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }

  /**
   * Clean up stale entries (in case promises never resolve)
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [hash, request] of this.pendingRequests) {
      if (now - request.timestamp > this.TTL_MS) {
        this.pendingRequests.delete(hash);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[RequestDedup:${this.name}] Cleaned up ${cleaned} stale entries`);
    }
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pendingRequests.clear();
  }
}

// Pre-configured deduplicators for common operations
export const gptRequestDedup = new RequestDeduplicator<any>('gpt');
export const whisperRequestDedup = new RequestDeduplicator<any>('whisper');
