/**
 * Enhanced caching service with localStorage persistence and LRU eviction
 * Provides better performance and reduced API calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
  accessCount: number;
  lastAccessed: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  version: string;
}

class CacheService {
  private config: CacheConfig = {
    maxSize: 100, // Maximum number of cache entries
    defaultTTL: 5 * 60 * 1000, // 5 minutes default TTL
    version: '1.0.0' // Cache version for invalidation
  };

  private memoryCache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_KEY = 'abbaquar_cache';

  constructor() {
    this.loadFromStorage();
    this.cleanup();
  }

  /**
   * Get cached data or fetch and cache it
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.config.defaultTTL
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const data = await fetchFn();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      console.error(`Cache fetch error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key);
      this.saveToStorage();
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    return entry.data as T;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl: number = this.config.defaultTTL): void {
    // Check if we need to evict entries
    if (this.memoryCache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: this.config.version,
      accessCount: 1,
      lastAccessed: Date.now()
    };

    this.memoryCache.set(key, entry);
    this.saveToStorage();
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.memoryCache.delete(key);
    this.saveToStorage();
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
    this.saveToStorage();
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.memoryCache.clear();
    this.saveToStorage();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.memoryCache.values());
    const totalSize = entries.length;
    const expiredEntries = entries.filter(entry => 
      Date.now() - entry.timestamp > entry.ttl
    ).length;
    
    const avgAccessCount = entries.length > 0 
      ? entries.reduce((sum, entry) => sum + entry.accessCount, 0) / entries.length 
      : 0;

    return {
      totalEntries: totalSize,
      expiredEntries,
      averageAccessCount: Math.round(avgAccessCount * 100) / 100,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Evict least recently used entries
   */
  private evictLRU(): void {
    const entries = Array.from(this.memoryCache.entries());
    
    // Sort by last accessed time (oldest first)
    entries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    
    // Remove 20% of entries (but at least 1)
    const toRemove = Math.max(1, Math.floor(entries.length * 0.2));
    
    for (let i = 0; i < toRemove; i++) {
      this.memoryCache.delete(entries[i][0]);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.memoryCache.delete(key);
      }
    }
    this.saveToStorage();
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Only load if version matches
        if (parsed.version === this.config.version) {
          this.memoryCache = new Map(parsed.entries);
          
          // Clean up expired entries on load
          this.cleanup();
        } else {
          // Version mismatch, clear old cache
          this.clear();
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
      this.clear();
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        version: this.config.version,
        entries: Array.from(this.memoryCache.entries())
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  /**
   * Get memory usage estimate
   */
  private getMemoryUsage(): number {
    try {
      const data = JSON.stringify(Array.from(this.memoryCache.entries()));
      return new Blob([data]).size;
    } catch {
      return 0;
    }
  }
}

// Create singleton instance
export const cacheService = new CacheService();

// Export convenience functions
export const getCachedData = <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> => cacheService.getOrSet(key, fetchFn, ttl);

export const setCachedData = <T>(
  key: string,
  data: T,
  ttl?: number
): void => cacheService.set(key, data, ttl);

export const invalidateCache = (key: string): void => cacheService.invalidate(key);
export const invalidateCachePattern = (pattern: string): void => cacheService.invalidatePattern(pattern);
export const clearCache = (): void => cacheService.clear();
export const getCacheStats = () => cacheService.getStats(); 