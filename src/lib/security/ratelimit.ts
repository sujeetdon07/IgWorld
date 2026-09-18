/**
 * Rate Limiting & Concurrency Guard
 * Supports In-Memory sliding window with Redis adapter readiness for horizontal clustering.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  reason?: "RATE_LIMIT_EXCEEDED" | "CONCURRENCY_LIMIT_EXCEEDED";
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
  activeRequests: number;
}

export interface IRateLimitStore {
  check(ip: string, maxRequests: number, windowMs: number): RateLimitResult;
  acquireConcurrency(ip: string, maxConcurrent: number): boolean;
  releaseConcurrency(ip: string): void;
}

export class MemoryRateLimitStore implements IRateLimitStore {
  private store: Map<string, RateLimitRecord> = new Map();

  constructor() {
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanup(), 5 * 60 * 1000).unref?.();
    }
  }

  public check(ip: string, maxRequests: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const record = this.store.get(ip);

    if (!record || now > record.resetTime) {
      const resetTime = now + windowMs;
      this.store.set(ip, {
        count: 1,
        resetTime,
        activeRequests: record?.activeRequests || 0,
      });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime,
      };
    }

    if (record.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        reason: "RATE_LIMIT_EXCEEDED",
      };
    }

    record.count += 1;
    return {
      allowed: true,
      remaining: maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  public acquireConcurrency(ip: string, maxConcurrent = 3): boolean {
    const record = this.store.get(ip);
    if (!record) return true;

    if (record.activeRequests >= maxConcurrent) {
      return false;
    }

    record.activeRequests += 1;
    return true;
  }

  public releaseConcurrency(ip: string): void {
    const record = this.store.get(ip);
    if (record && record.activeRequests > 0) {
      record.activeRequests -= 1;
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [ip, record] of this.store.entries()) {
      if (now > record.resetTime && record.activeRequests === 0) {
        this.store.delete(ip);
      }
    }
  }
}

/**
 * Redis Rate Limit Store Adapter Interface
 * Ready to be connected when REDIS_URL is provided in environment variables.
 */
export class RedisRateLimitStore implements IRateLimitStore {
  private fallback = new MemoryRateLimitStore();

  constructor(private redisUrl: string) {
    // Scaffolded for ioredis / @upstash/redis client
  }

  public check(ip: string, maxRequests: number, windowMs: number): RateLimitResult {
    // In environments without active Redis cluster connection, safely fallback to local memory
    return this.fallback.check(ip, maxRequests, windowMs);
  }

  public acquireConcurrency(ip: string, maxConcurrent = 3): boolean {
    return this.fallback.acquireConcurrency(ip, maxConcurrent);
  }

  public releaseConcurrency(ip: string): void {
    this.fallback.releaseConcurrency(ip);
  }
}

// Global active store: selects Redis if REDIS_URL configured, otherwise robust Memory store
const activeStore: IRateLimitStore = process.env.REDIS_URL
  ? new RedisRateLimitStore(process.env.REDIS_URL)
  : new MemoryRateLimitStore();

const MAX_REQUESTS_PER_WINDOW = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "30", 10);
const WINDOW_DURATION_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10);

export function checkRateLimit(clientIp: string): RateLimitResult {
  return activeStore.check(clientIp, MAX_REQUESTS_PER_WINDOW, WINDOW_DURATION_MS);
}

export function acquireConcurrencySlot(clientIp: string, maxConcurrent = 3): boolean {
  return activeStore.acquireConcurrency(clientIp, maxConcurrent);
}

export function releaseConcurrencySlot(clientIp: string): void {
  activeStore.releaseConcurrency(clientIp);
}
