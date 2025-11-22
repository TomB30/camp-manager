/**
 * API Configuration
 * Configures the generated API client with the appropriate base URL
 */

import { client } from "@/generated/api/client.gen";
import {
  generateCacheKey,
  getCachedResponse,
  setCachedResponse,
  invalidateEntityCache,
  setCurrentToken,
  clearAllCache,
} from "@/utils/requestCache";
import {
  getEntityTypeFromUrl,
  getCacheTTL,
  isCachingEnabled,
  CACHE_ENABLED,
} from "@/config/cacheConfig";

/**
 * Get the API base URL from environment variables
 * Falls back to localhost:8080 if not set
 */
const getApiBaseUrl = (): string => {
  // In development, use the env variable or default to localhost:8080
  // In production, use the env variable (should be set in .env.production)
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  // Remove trailing slash if present
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};

/**
 * Get the authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

/**
 * Create a custom fetch function that checks cache before making requests
 */
const createCachedFetch = (originalFetch: typeof fetch): typeof fetch => {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init);
    const method = request.method;
    const url = request.url;
    const token = getAuthToken();
    
    // Update cache system with current token (clears cache if token changed)
    setCurrentToken(token);
    
    // Check cache for GET requests BEFORE making the network request
    if (CACHE_ENABLED && method === 'GET') {
      const entityType = getEntityTypeFromUrl(url);
      
      if (entityType && isCachingEnabled(entityType)) {
        const cacheKey = generateCacheKey(method, url, token);
        const cachedData = getCachedResponse(cacheKey);

        if (cachedData !== null) {
          // Cache hit! Return cached data WITHOUT making network request
          if (import.meta.env.DEV) {
            console.log(`[Cache] 🎯 Cache HIT - no network request made for ${entityType}`);
          }
          
          return new Response(JSON.stringify(cachedData), {
            status: 200,
            statusText: 'OK (Cached)',
            headers: {
              'Content-Type': 'application/json',
              'X-Cache': 'HIT',
            },
          });
        }
      }
    }
    
    // Cache miss or non-cacheable - proceed with network request
    const response = await originalFetch(request);
    
    // Handle successful GET responses - cache them
    if (response.ok && method === 'GET' && CACHE_ENABLED) {
      const entityType = getEntityTypeFromUrl(url);
      
      if (entityType && isCachingEnabled(entityType)) {
        try {
          const clonedResponse = response.clone();
          const data = await clonedResponse.json();
          const cacheKey = generateCacheKey(method, url, token);
          const ttl = getCacheTTL(entityType);
          setCachedResponse(cacheKey, data, ttl);
        } catch (error) {
          // If parsing fails, don't cache (might be non-JSON response)
          if (import.meta.env.DEV) {
            console.debug('[Cache] Could not cache response:', error);
          }
        }
      }
    }
    
    // Handle mutations - invalidate related cache
    if (response.ok && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const entityType = getEntityTypeFromUrl(url);
      
      if (entityType) {
        invalidateEntityCache(entityType);
        
        if (import.meta.env.DEV) {
          console.log(`[Cache] 🔄 Invalidated cache for ${entityType} due to ${method} request`);
        }
      }
    }
    
    // Handle 401 errors
    if (response.status === 401) {
      console.warn("[API] Received 401 Unauthorized - token may be expired");
    }
    
    return response;
  };
};

/**
 * Configure the API client with the base URL and other common settings
 */
export function initializeApiClient(): void {
  const baseUrl = getApiBaseUrl();

  console.log(`[API Config] Initializing API client with base URL: ${baseUrl}`);

  // Create cached fetch wrapper
  const cachedFetch = createCachedFetch(globalThis.fetch);

  client.setConfig({
    baseUrl,
    // Use our custom cached fetch function
    fetch: cachedFetch,
    // Add common headers or other configuration here
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add request interceptor to automatically include Authorization header
  client.interceptors.request.use((request) => {
    const token = getAuthToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  });
}

/**
 * Get the configured API client
 * This is the client that should be used by all services
 */
export { client as apiClient };

/**
 * Get the current API base URL
 */
export function getApiUrl(): string {
  return getApiBaseUrl();
}

/**
 * Update the authentication token
 * Call this after login/signup to ensure the token is available for requests
 */
export function setAuthToken(token: string): void {
  localStorage.setItem("auth_token", token);
  // Update cache system with new token (this will clear cache if token changed)
  setCurrentToken(token);
}

/**
 * Clear the authentication token
 * Call this on logout
 */
export function clearAuthToken(): void {
  localStorage.removeItem("auth_token");
  // Clear all cache on logout to prevent data leakage
  setCurrentToken(null);
  clearAllCache();
}
