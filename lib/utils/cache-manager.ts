/**
 * Production-Grade Cache Manager
 *
 * In-memory cache with TTL support, size limits, and LRU eviction.
 * For production, this should be replaced with Redis or similar.
 *
 * Features:
 * - TTL (Time To Live) expiration
 * - LRU (Least Recently Used) eviction
 * - Size limits per cache namespace
 * - Cache hit/miss statistics
 * - Automatic cleanup of expired entries
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

export class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private stats: Map<string, { hits: number; misses: number }>;
  private cleanupInterval: NodeJS.Timeout | null;
  private maxSize: number;

  constructor(maxSize: number = 10000) {
    this.cache = new Map();
    this.stats = new Map();
    this.maxSize = maxSize;
    this.cleanupInterval = null;

    // Start automatic cleanup every 5 minutes
    this.startCleanup();
  }

  /**
   * Set a value in cache with TTL
   */
  set<T>(key: string, value: T, ttlSeconds: number = 3600): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);

    // Check if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      expiresAt,
      accessCount: 0,
      lastAccessed: Date.now()
    });
  }

  /**
   * Get a value from cache
   * Returns null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.recordMiss(key);
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.recordMiss(key);
      return null;
    }

    // Update access statistics and move to end of Map for LRU ordering
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.recordHit(key);

    return entry.value as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.clear();
  }

  /**
   * Clear all entries with a specific prefix
   */
  clearPrefix(prefix: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Get cache statistics
   */
  getStats(prefix?: string): CacheStats {
    let totalHits = 0;
    let totalMisses = 0;

    if (prefix) {
      // Get stats for specific prefix
      for (const [key, stat] of this.stats.entries()) {
        if (key.startsWith(prefix)) {
          totalHits += stat.hits;
          totalMisses += stat.misses;
        }
      }
    } else {
      // Get total stats
      for (const stat of this.stats.values()) {
        totalHits += stat.hits;
        totalMisses += stat.misses;
      }
    }

    const total = totalHits + totalMisses;
    const hitRate = total > 0 ? (totalHits / total) * 100 : 0;

    return {
      hits: totalHits,
      misses: totalMisses,
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    // O(1): Map preserves insertion order; least recently used is first key
    // (get() re-inserts accessed entries to move them to the end)
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey !== undefined) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Record cache hit
   */
  private recordHit(key: string): void {
    const prefix = this.getPrefix(key);
    const stat = this.stats.get(prefix) || { hits: 0, misses: 0 };
    stat.hits++;
    this.stats.set(prefix, stat);
  }

  /**
   * Record cache miss
   */
  private recordMiss(key: string): void {
    const prefix = this.getPrefix(key);
    const stat = this.stats.get(prefix) || { hits: 0, misses: 0 };
    stat.misses++;
    this.stats.set(prefix, stat);
  }

  /**
   * Extract prefix from key (before first ':')
   */
  private getPrefix(key: string): string {
    const colonIndex = key.indexOf(':');
    return colonIndex > 0 ? key.substring(0, colonIndex) : 'default';
  }

  /**
   * Start automatic cleanup of expired entries
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Clean up expired entries
   */
  cleanupExpired(): number {
    const now = Date.now();
    let count = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Get all keys with a specific prefix
   */
  getKeysByPrefix(prefix: string): string[] {
    const keys: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Get remaining TTL for a key (in seconds)
   */
  getTTL(key: string): number | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const remaining = entry.expiresAt - Date.now();
    return remaining > 0 ? Math.floor(remaining / 1000) : 0;
  }
}

// Singleton instance
let cacheInstance: CacheManager | null = null;

/**
 * Get global cache instance
 */
export function getCache(): CacheManager {
  if (!cacheInstance) {
    cacheInstance = new CacheManager(50000); // 50K entries max
  }
  return cacheInstance;
}

/**
 * Helper function to create cache key
 */
export function createCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`.toLowerCase();
}

/**
 * Helper function to cache async function results
 */
export async function cachedAsync<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  const cache = getCache();

  // Check cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute function and cache result
  const result = await fn();
  cache.set(key, result, ttl);

  return result;
}
