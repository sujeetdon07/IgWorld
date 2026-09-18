import { ExtractedMediaData } from "../types/api";

export interface ICacheStore {
  get(key: string): Promise<ExtractedMediaData | null> | ExtractedMediaData | null;
  set(key: string, data: ExtractedMediaData, ttlMs?: number): Promise<void> | void;
  delete(key: string): Promise<void> | void;
  clear(): Promise<void> | void;
}

interface CacheEntry {
  data: ExtractedMediaData;
  expiresAt: number;
}

export class MemoryCache implements ICacheStore {
  private cache = new Map<string, CacheEntry>();
  private defaultTtlMs: number;
  private maxItems: number;

  constructor(defaultTtlMs = 10 * 60 * 1000, maxItems = 500) {
    this.defaultTtlMs = defaultTtlMs;
    this.maxItems = maxItems;

    if (typeof setInterval !== "undefined") {
      setInterval(() => this.purgeExpired(), 2 * 60 * 1000).unref?.();
    }
  }

  get(key: string): ExtractedMediaData | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: ExtractedMediaData, ttlMs = this.defaultTtlMs): void {
    // LRU-style eviction if max capacity reached
    if (this.cache.size >= this.maxItems) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private purgeExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export const mediaCache = new MemoryCache();
