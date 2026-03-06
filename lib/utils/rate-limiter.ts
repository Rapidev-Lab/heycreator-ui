/**
 * Production-Grade Rate Limiter
 *
 * Implements sliding window rate limiting to prevent API quota exhaustion.
 * Supports per-platform and global rate limits.
 *
 * Features:
 * - Sliding window algorithm (more accurate than fixed window)
 * - Per-resource rate limiting
 * - Automatic queue management
 * - Wait time estimation
 * - Statistics tracking
 */

interface RateLimitWindow {
  timestamps: number[];
  limit: number;
  windowMs: number;
}

interface QueuedRequest {
  resolve: () => void;
  reject: (error: Error) => void;
  timestamp: number;
}

export class RateLimiter {
  private windows: Map<string, RateLimitWindow>;
  private queues: Map<string, QueuedRequest[]>;
  private stats: Map<string, { allowed: number; denied: number; queued: number }>;

  constructor() {
    this.windows = new Map();
    this.queues = new Map();
    this.stats = new Map();
  }

  /**
   * Acquire a rate limit slot
   * Returns immediately if allowed, or waits in queue
   */
  async acquire(resource: string, limit: number, windowMs: number): Promise<void> {
    const now = Date.now();

    // Get or create window for this resource
    if (!this.windows.has(resource)) {
      this.windows.set(resource, {
        timestamps: [],
        limit,
        windowMs
      });
    }

    const window = this.windows.get(resource)!;

    // Clean old timestamps outside the window
    window.timestamps = window.timestamps.filter(
      ts => now - ts < window.windowMs
    );

    // Check if we're within the limit
    if (window.timestamps.length < window.limit) {
      window.timestamps.push(now);
      this.recordAllowed(resource);
      return;
    }

    // We're at the limit, need to wait
    this.recordQueued(resource);

    return new Promise((resolve, reject) => {
      const queue = this.queues.get(resource) || [];
      queue.push({ resolve, reject, timestamp: now });
      this.queues.set(resource, queue);

      // Process queue after the oldest request expires
      const oldestTimestamp = window.timestamps[0];
      const waitTime = window.windowMs - (now - oldestTimestamp);

      setTimeout(() => {
        this.processQueue(resource);
      }, waitTime);
    });
  }

  /**
   * Try to acquire without waiting
   * Returns true if allowed, false if rate limited
   */
  tryAcquire(resource: string, limit: number, windowMs: number): boolean {
    const now = Date.now();

    // Get or create window for this resource
    if (!this.windows.has(resource)) {
      this.windows.set(resource, {
        timestamps: [],
        limit,
        windowMs
      });
    }

    const window = this.windows.get(resource)!;

    // Clean old timestamps
    window.timestamps = window.timestamps.filter(
      ts => now - ts < window.windowMs
    );

    // Check if within limit
    if (window.timestamps.length < window.limit) {
      window.timestamps.push(now);
      this.recordAllowed(resource);
      return true;
    }

    this.recordDenied(resource);
    return false;
  }

  /**
   * Get estimated wait time in milliseconds
   */
  getWaitTime(resource: string): number {
    const window = this.windows.get(resource);
    if (!window || window.timestamps.length < window.limit) {
      return 0;
    }

    const now = Date.now();
    const oldestTimestamp = window.timestamps[0];
    return Math.max(0, window.windowMs - (now - oldestTimestamp));
  }

  /**
   * Get current usage for a resource
   */
  getUsage(resource: string): { current: number; limit: number; available: number } {
    const window = this.windows.get(resource);
    if (!window) {
      return { current: 0, limit: 0, available: 0 };
    }

    const now = Date.now();
    const current = window.timestamps.filter(
      ts => now - ts < window.windowMs
    ).length;

    return {
      current,
      limit: window.limit,
      available: window.limit - current
    };
  }

  /**
   * Get statistics for a resource
   */
  getStats(resource: string): { allowed: number; denied: number; queued: number } {
    return this.stats.get(resource) || { allowed: 0, denied: 0, queued: 0 };
  }

  /**
   * Reset rate limit for a resource
   */
  reset(resource: string): void {
    this.windows.delete(resource);
    this.queues.delete(resource);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.windows.clear();
    this.queues.clear();
  }

  /**
   * Process queued requests
   */
  private processQueue(resource: string): void {
    const queue = this.queues.get(resource);
    if (!queue || queue.length === 0) return;

    const window = this.windows.get(resource);
    if (!window) return;

    const now = Date.now();

    // Clean expired timestamps
    window.timestamps = window.timestamps.filter(
      ts => now - ts < window.windowMs
    );

    // Process as many requests as we have slots for
    while (queue.length > 0 && window.timestamps.length < window.limit) {
      const request = queue.shift()!;
      window.timestamps.push(now);
      this.recordAllowed(resource);
      request.resolve();
    }

    // Update queue
    if (queue.length > 0) {
      this.queues.set(resource, queue);
    } else {
      this.queues.delete(resource);
    }
  }

  /**
   * Record statistics
   */
  private recordAllowed(resource: string): void {
    const stat = this.stats.get(resource) || { allowed: 0, denied: 0, queued: 0 };
    stat.allowed++;
    this.stats.set(resource, stat);
  }

  private recordDenied(resource: string): void {
    const stat = this.stats.get(resource) || { allowed: 0, denied: 0, queued: 0 };
    stat.denied++;
    this.stats.set(resource, stat);
  }

  private recordQueued(resource: string): void {
    const stat = this.stats.get(resource) || { allowed: 0, denied: 0, queued: 0 };
    stat.queued++;
    this.stats.set(resource, stat);
  }
}

// Singleton instance
let rateLimiterInstance: RateLimiter | null = null;

/**
 * Get global rate limiter instance
 */
export function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter();
  }
  return rateLimiterInstance;
}

/**
 * Helper function to execute with rate limiting
 */
export async function withRateLimit<T>(
  resource: string,
  limit: number,
  windowMs: number,
  fn: () => Promise<T>
): Promise<T> {
  const limiter = getRateLimiter();
  await limiter.acquire(resource, limit, windowMs);
  return fn();
}

/**
 * Platform-specific rate limit helper
 */
export async function withPlatformRateLimit<T>(
  platform: string,
  fn: () => Promise<T>
): Promise<T> {
  // Platform-specific limits (requests per minute)
  const platformLimits: Record<string, number> = {
    instagram: 10,
    tiktok: 8,
    youtube: 12,
    twitter: 15,
    facebook: 10
  };

  const limit = platformLimits[platform] || 10;
  const windowMs = 60 * 1000; // 1 minute

  return withRateLimit(`platform:${platform}`, limit, windowMs, fn);
}
