/**
 * Embedding Cache Service
 *
 * Provides caching functionality for embeddings to avoid redundant API calls
 * and improve performance.
 */

import { EmbeddingVector } from "./huggingFaceEmbeddings";

interface CacheEntry {
  vector: EmbeddingVector;
  timestamp: number;
  modelId: string;
}

interface CacheOptions {
  maxSize?: number;
  ttlMs?: number; // Time-to-live in milliseconds
}

/**
 * Embedding Cache Service
 *
 * Caches embeddings to avoid redundant API calls and improve performance
 */
export class EmbeddingCache {
  private cache: Map<string, CacheEntry>;
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map<string, CacheEntry>();
    this.options = {
      maxSize: options.maxSize || 1000,
      ttlMs: options.ttlMs || 24 * 60 * 60 * 1000, // Default: 24 hours
    };
  }

  /**
   * Generate a cache key for a text and model ID
   */
  private generateKey(text: string, modelId: string): string {
    return `${modelId}:${text}`;
  }

  /**
   * Store an embedding in the cache
   */
  set(text: string, vector: EmbeddingVector, modelId: string): void {
    const key = this.generateKey(text, modelId);

    // Add to cache with current timestamp
    this.cache.set(key, {
      vector,
      timestamp: Date.now(),
      modelId,
    });

    // Enforce cache size limit
    if (this.cache.size > this.options.maxSize) {
      // Remove oldest entry
      const oldestKey = this.findOldestEntry();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  /**
   * Get an embedding from the cache if available
   * Returns null if not found or expired
   */
  get(text: string, modelId: string): EmbeddingVector | null {
    const key = this.generateKey(text, modelId);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > this.options.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.vector;
  }

  /**
   * Find the oldest entry in the cache
   */
  private findOldestEntry(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * Clear expired entries from the cache
   */
  clearExpired(): number {
    const now = Date.now();
    let count = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.options.ttlMs) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the current cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; modelDistribution: Record<string, number> } {
    const modelDistribution: Record<string, number> = {};

    for (const entry of this.cache.values()) {
      modelDistribution[entry.modelId] =
        (modelDistribution[entry.modelId] || 0) + 1;
    }

    return {
      size: this.cache.size,
      modelDistribution,
    };
  }
}

// Create a singleton instance for global use
const globalEmbeddingCache = new EmbeddingCache();

export default globalEmbeddingCache;
