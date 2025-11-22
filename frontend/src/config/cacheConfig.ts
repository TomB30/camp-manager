/**
 * Cache Configuration
 * Defines caching behavior per entity type
 */

export interface EntityCacheConfig {
  /**
   * Time to live in milliseconds
   */
  ttl: number;
  /**
   * Whether caching is enabled for this entity
   */
  enabled: boolean;
}

export interface CacheConfiguration {
  [entityType: string]: EntityCacheConfig;
}

/**
 * Default cache configuration per entity type
 * TTL is in milliseconds (30000ms = 30 seconds)
 */
export const cacheConfig: CacheConfiguration = {
  // Core entities
  campers: { ttl: 60000, enabled: true },
  groups: { ttl: 30000, enabled: true },
  'staff-members': { ttl: 60000, enabled: true }, // Staff changes less frequently
  
  // Program-related entities
  programs: { ttl: 30000, enabled: true },
  activities: { ttl: 30000, enabled: true },
  events: { ttl: 30000, enabled: true },
  
  // Location entities
  locations: { ttl: 120000, enabled: true },
  areas: { ttl: 120000, enabled: true },
  'housing-rooms': { ttl: 120000, enabled: true },
  
  // Configuration entities (change even less frequently)
  sessions: { ttl: 120000, enabled: true },
  roles: { ttl: 120000, enabled: true },
  colors: { ttl: 120000, enabled: true },
  labels: { ttl: 120000, enabled: true },
  certifications: { ttl: 120000, enabled: true },
  'time-blocks': { ttl: 120000, enabled: true },
  
  // Camp settings
  camps: { ttl: 120000, enabled: true },
};

/**
 * Default TTL for entities not explicitly configured
 */
export const DEFAULT_CACHE_TTL = 30000; // 30 seconds

/**
 * Global cache enable/disable switch
 * Useful for debugging or temporarily disabling cache
 */
export const CACHE_ENABLED = true;

/**
 * Get cache configuration for a specific entity type
 */
export function getEntityCacheConfig(entityType: string): EntityCacheConfig {
  return cacheConfig[entityType] || {
    ttl: DEFAULT_CACHE_TTL,
    enabled: true,
  };
}

/**
 * Check if caching is enabled for a specific entity
 */
export function isCachingEnabled(entityType: string): boolean {
  if (!CACHE_ENABLED) {
    return false;
  }
  
  const config = getEntityCacheConfig(entityType);
  return config.enabled;
}

/**
 * Get TTL for a specific entity type
 */
export function getCacheTTL(entityType: string): number {
  const config = getEntityCacheConfig(entityType);
  return config.ttl;
}

/**
 * URL patterns to entity type mapping
 * Used to identify which entity a request belongs to
 */
export const entityUrlPatterns: Record<string, RegExp[]> = {
  campers: [/\/camps\/[^/]+\/campers/],
  groups: [/\/camps\/[^/]+\/groups/],
  'staff-members': [/\/camps\/[^/]+\/staff-members/],
  programs: [/\/camps\/[^/]+\/programs/],
  activities: [/\/camps\/[^/]+\/activities/],
  events: [/\/camps\/[^/]+\/events/],
  locations: [/\/camps\/[^/]+\/locations/],
  areas: [/\/camps\/[^/]+\/areas/],
  'housing-rooms': [/\/camps\/[^/]+\/housing-rooms/],
  sessions: [/\/camps\/[^/]+\/sessions/],
  roles: [/\/camps\/[^/]+\/roles/],
  colors: [/\/camps\/[^/]+\/colors/],
  labels: [/\/camps\/[^/]+\/labels/],
  certifications: [/\/camps\/[^/]+\/certifications/],
  'time-blocks': [/\/camps\/[^/]+\/time-blocks/],
  camps: [/\/camps\/[^/]+$/],
};

/**
 * Get entity type from URL using pattern matching
 */
export function getEntityTypeFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Check each entity pattern
    for (const [entityType, patterns] of Object.entries(entityUrlPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(pathname)) {
          return entityType;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('[CacheConfig] Error parsing URL:', error);
    return null;
  }
}

/**
 * Expose cache config on window in development mode
 */
if (import.meta.env.DEV) {
  (window as any).__cacheConfig = {
    config: cacheConfig,
    getEntityConfig: getEntityCacheConfig,
    isCachingEnabled,
    getCacheTTL,
    getEntityTypeFromUrl,
  };
}

