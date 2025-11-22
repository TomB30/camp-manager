/**
 * Request Cache Utility
 * Provides smart caching for HTTP requests with automatic invalidation
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  invalidations: number;
}

// In-memory cache storage
const cache = new Map<string, CacheEntry>();
const stats: CacheStats = { hits: 0, misses: 0, invalidations: 0 };
let currentToken: string | null = null;

/**
 * Generate a unique cache key from request details
 * Includes auth token to ensure cache isolation between users
 */
export function generateCacheKey(
  method: string,
  url: string,
  token: string | null
): string {
  // Parse URL to get pathname and search params
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams.toString();
  
  // Include token in cache key to prevent cross-user cache pollution
  const tokenPart = token ? `token:${token}` : 'no-token';
  
  // Combine method, pathname, params, and token
  return `${method}:${pathname}:${searchParams}:${tokenPart}`;
}

/**
 * Extract entity type from URL path
 * Examples:
 *   /api/camps/123/campers -> campers
 *   /api/camps/123/groups/456 -> groups
 */
export function getEntityFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Match patterns like /camps/{id}/{entity} or /camps/{id}/{entity}/{id}
    const entityMatch = pathname.match(/\/camps\/[^/]+\/([^/]+)/);
    
    if (entityMatch && entityMatch[1]) {
      return entityMatch[1];
    }
    
    return null;
  } catch (error) {
    console.error('[Cache] Error parsing URL for entity:', error);
    return null;
  }
}

/**
 * Check if a cache entry is still valid based on TTL
 */
function isValidCacheEntry(entry: CacheEntry): boolean {
  const now = Date.now();
  return now - entry.timestamp < entry.ttl;
}

/**
 * Get cached response if available and valid
 */
export function getCachedResponse(cacheKey: string): any | null {
  const entry = cache.get(cacheKey);
  
  if (!entry) {
    stats.misses++;
    return null;
  }
  
  if (!isValidCacheEntry(entry)) {
    // Cache expired, remove it
    cache.delete(cacheKey);
    stats.misses++;
    return null;
  }
  
  stats.hits++;
  logDebug(`Cache HIT: ${cacheKey}`);
  return entry.data;
}

/**
 * Store a response in cache with TTL
 */
export function setCachedResponse(
  cacheKey: string,
  data: any,
  ttl: number
): void {
  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl,
  });
  logDebug(`Cache SET: ${cacheKey} (TTL: ${ttl}ms)`);
}

/**
 * Invalidate all cache entries for a specific entity type
 * This is called when mutations (POST/PUT/DELETE) occur
 */
export function invalidateEntityCache(entityType: string): void {
  let invalidatedCount = 0;
  
  // Find and delete all cache entries that contain this entity in their key
  for (const [key, _] of cache.entries()) {
    // Check if this cache key is for the entity we're invalidating
    // Cache keys include the entity in the pathname
    if (key.includes(`/${entityType}`)) {
      cache.delete(key);
      invalidatedCount++;
    }
  }
  
  stats.invalidations += invalidatedCount;
}

/**
 * Clear all cache entries
 * Called on logout or token change
 */
export function clearAllCache(): void {
  const size = cache.size;
  cache.clear();
  stats.invalidations += size;
}

/**
 * Update the current auth token
 * Clears cache if token has changed to prevent cross-user data leakage
 */
export function setCurrentToken(token: string | null): void {
  const previousToken = currentToken;
  currentToken = token;
  
  // If token changed, clear all cache to prevent user A seeing user B's data
  if (previousToken !== token) {
    clearAllCache();
  }
}

/**
 * Get the current auth token being tracked
 */
export function getCurrentToken(): string | null {
  return currentToken;
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): CacheStats & { size: number; entries: string[] } {
  return {
    ...stats,
    size: cache.size,
    entries: Array.from(cache.keys()),
  };
}

/**
 * Reset cache statistics
 */
export function resetCacheStats(): void {
  stats.hits = 0;
  stats.misses = 0;
  stats.invalidations = 0;
}

/**
 * Debug logging (only in development)
 */
function logDebug(message: string): void {
  if (import.meta.env.DEV) {
    console.log(`[RequestCache] ${message}`);
  }
}

/**
 * Expose cache utilities on window in development mode
 */
if (import.meta.env.DEV) {
  (window as any).__requestCache = {
    getStats: getCacheStats,
    clearAll: clearAllCache,
    resetStats: resetCacheStats,
    invalidateEntity: invalidateEntityCache,
  };
}

