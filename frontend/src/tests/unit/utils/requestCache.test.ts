/**
 * Request Cache Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateCacheKey,
  getCachedResponse,
  setCachedResponse,
  invalidateEntityCache,
  clearAllCache,
  setCurrentToken,
  getCurrentToken,
  getCacheStats,
  resetCacheStats,
  getEntityFromUrl,
} from '@/utils/requestCache';

describe('Request Cache', () => {
  beforeEach(() => {
    // Clear cache and reset stats before each test
    clearAllCache();
    resetCacheStats();
    setCurrentToken(null);
  });

  describe('generateCacheKey', () => {
    it('should generate unique keys for different methods', () => {
      const url = 'http://api.example.com/camps/123/campers';
      const token = 'test-token';

      const getKey = generateCacheKey('GET', url, token);
      const postKey = generateCacheKey('POST', url, token);

      expect(getKey).not.toBe(postKey);
      expect(getKey).toContain('GET');
      expect(postKey).toContain('POST');
    });

    it('should generate unique keys for different URLs', () => {
      const token = 'test-token';

      const key1 = generateCacheKey('GET', 'http://api.example.com/camps/123/campers', token);
      const key2 = generateCacheKey('GET', 'http://api.example.com/camps/123/groups', token);

      expect(key1).not.toBe(key2);
    });

    it('should generate unique keys for different tokens', () => {
      const url = 'http://api.example.com/camps/123/campers';

      const key1 = generateCacheKey('GET', url, 'token-1');
      const key2 = generateCacheKey('GET', url, 'token-2');

      expect(key1).not.toBe(key2);
      expect(key1).toContain('token-1');
      expect(key2).toContain('token-2');
    });

    it('should handle null token', () => {
      const url = 'http://api.example.com/camps/123/campers';

      const key = generateCacheKey('GET', url, null);

      expect(key).toContain('no-token');
    });

    it('should include query parameters in key', () => {
      const url1 = 'http://api.example.com/camps/123/campers?session=abc';
      const url2 = 'http://api.example.com/camps/123/campers?session=xyz';
      const token = 'test-token';

      const key1 = generateCacheKey('GET', url1, token);
      const key2 = generateCacheKey('GET', url2, token);

      expect(key1).not.toBe(key2);
    });
  });

  describe('getEntityFromUrl', () => {
    it('should extract entity from valid URL', () => {
      expect(getEntityFromUrl('http://api.example.com/camps/123/campers')).toBe('campers');
      expect(getEntityFromUrl('http://api.example.com/camps/123/groups')).toBe('groups');
      expect(getEntityFromUrl('http://api.example.com/camps/123/staff-members')).toBe('staff-members');
    });

    it('should extract entity from URL with resource ID', () => {
      expect(getEntityFromUrl('http://api.example.com/camps/123/campers/456')).toBe('campers');
    });

    it('should return null for invalid URL', () => {
      expect(getEntityFromUrl('http://api.example.com/camps/123')).toBe(null);
      expect(getEntityFromUrl('http://api.example.com/')).toBe(null);
    });
  });

  describe('Cache Operations', () => {
    it('should return null for cache miss', () => {
      const key = generateCacheKey('GET', 'http://api.example.com/test', 'token');
      const result = getCachedResponse(key);

      expect(result).toBe(null);
    });

    it('should store and retrieve cached response', () => {
      const key = generateCacheKey('GET', 'http://api.example.com/test', 'token');
      const data = { items: [{ id: '1', name: 'Test' }] };
      const ttl = 30000;

      setCachedResponse(key, data, ttl);
      const result = getCachedResponse(key);

      expect(result).toEqual(data);
    });

    it('should return null for expired cache', () => {
      vi.useFakeTimers();

      const key = generateCacheKey('GET', 'http://api.example.com/test', 'token');
      const data = { items: [] };
      const ttl = 1000; // 1 second

      setCachedResponse(key, data, ttl);

      // Fast-forward time by 1.5 seconds
      vi.advanceTimersByTime(1500);

      const result = getCachedResponse(key);

      expect(result).toBe(null);

      vi.useRealTimers();
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate cache for specific entity', () => {
      const campersUrl = 'http://api.example.com/camps/123/campers';
      const groupsUrl = 'http://api.example.com/camps/123/groups';
      const token = 'token';

      const campersKey = generateCacheKey('GET', campersUrl, token);
      const groupsKey = generateCacheKey('GET', groupsUrl, token);

      setCachedResponse(campersKey, { items: [] }, 30000);
      setCachedResponse(groupsKey, { items: [] }, 30000);

      // Invalidate only campers
      invalidateEntityCache('campers');

      expect(getCachedResponse(campersKey)).toBe(null);
      expect(getCachedResponse(groupsKey)).not.toBe(null);
    });

    it('should clear all cache', () => {
      const url1 = 'http://api.example.com/camps/123/campers';
      const url2 = 'http://api.example.com/camps/123/groups';
      const token = 'token';

      const key1 = generateCacheKey('GET', url1, token);
      const key2 = generateCacheKey('GET', url2, token);

      setCachedResponse(key1, { items: [] }, 30000);
      setCachedResponse(key2, { items: [] }, 30000);

      clearAllCache();

      expect(getCachedResponse(key1)).toBe(null);
      expect(getCachedResponse(key2)).toBe(null);
    });
  });

  describe('Token Management', () => {
    it('should track current token', () => {
      expect(getCurrentToken()).toBe(null);

      setCurrentToken('test-token');
      expect(getCurrentToken()).toBe('test-token');
    });

    it('should clear cache when token changes', () => {
      const url = 'http://api.example.com/camps/123/campers';
      const token1 = 'token-1';
      const key1 = generateCacheKey('GET', url, token1);

      setCurrentToken(token1);
      setCachedResponse(key1, { items: [] }, 30000);

      expect(getCachedResponse(key1)).not.toBe(null);

      // Change token
      setCurrentToken('token-2');

      // Cache should be cleared
      expect(getCachedResponse(key1)).toBe(null);
    });

    it('should not clear cache if token is set to same value', () => {
      const url = 'http://api.example.com/camps/123/campers';
      const token = 'test-token';
      const key = generateCacheKey('GET', url, token);

      setCurrentToken(token);
      setCachedResponse(key, { items: [] }, 30000);

      // Set same token again
      setCurrentToken(token);

      // Cache should still be there
      expect(getCachedResponse(key)).not.toBe(null);
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache hits and misses', () => {
      const url = 'http://api.example.com/camps/123/campers';
      const token = 'token';
      const key = generateCacheKey('GET', url, token);

      // Miss
      getCachedResponse(key);
      let stats = getCacheStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(1);

      // Set cache
      setCachedResponse(key, { items: [] }, 30000);

      // Hit
      getCachedResponse(key);
      stats = getCacheStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);

      // Another hit
      getCachedResponse(key);
      stats = getCacheStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
    });

    it('should track cache size', () => {
      const url1 = 'http://api.example.com/camps/123/campers';
      const url2 = 'http://api.example.com/camps/123/groups';
      const token = 'token';

      let stats = getCacheStats();
      expect(stats.size).toBe(0);

      setCachedResponse(generateCacheKey('GET', url1, token), { items: [] }, 30000);
      stats = getCacheStats();
      expect(stats.size).toBe(1);

      setCachedResponse(generateCacheKey('GET', url2, token), { items: [] }, 30000);
      stats = getCacheStats();
      expect(stats.size).toBe(2);
    });

    it('should track invalidations', () => {
      const url = 'http://api.example.com/camps/123/campers';
      const token = 'token';
      const key = generateCacheKey('GET', url, token);

      setCachedResponse(key, { items: [] }, 30000);

      invalidateEntityCache('campers');

      const stats = getCacheStats();
      expect(stats.invalidations).toBe(1);
    });

    it('should reset statistics', () => {
      const url = 'http://api.example.com/camps/123/campers';
      const token = 'token';
      const key = generateCacheKey('GET', url, token);

      getCachedResponse(key); // miss
      setCachedResponse(key, { items: [] }, 30000);
      getCachedResponse(key); // hit

      let stats = getCacheStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);

      resetCacheStats();

      stats = getCacheStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      // Cache entries should still exist
      expect(stats.size).toBe(1);
    });
  });
});

