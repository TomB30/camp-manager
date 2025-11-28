/**
 * usePageFilters - Composable for managing page filters with URL and localStorage persistence
 *
 * This composable provides a unified way to manage filters across pages with:
 * 1. URL synchronization (for shareable links)
 * 2. localStorage persistence (for remembering user preferences)
 * 3. Type safety and validation
 *
 * Priority: URL params → localStorage → defaults
 */

import { reactive, watch, ref, onMounted, UnwrapNestedRefs, Ref } from "vue";
import { useRouter, useRoute, LocationQuery } from "vue-router";

type FilterValue = string | number | boolean | object | null | undefined;
type Filters = Record<string, FilterValue>;

export function usePageFilters<T extends Filters>(
  pageId: string,
  defaults: T,
): {
  filters: UnwrapNestedRefs<T>;
  updateFilter: <K extends keyof T>(key: K, value: T[K]) => void;
  updateFilters: (updates: Partial<T>) => void;
  resetFilters: () => void;
  isInitialized: Ref<boolean>;
} {
  const router = useRouter();
  const route = useRoute();
  const isInitialized = ref(false);

  // Create reactive filters object
  const filters = reactive<T>({ ...defaults });

  // Debounce timer for URL updates
  let urlUpdateTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Load filters from localStorage
   */
  function loadFromStorage(pageId: string, defaults: T): Partial<T> {
    try {
      const stored = localStorage.getItem(`filters_${pageId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate that parsed data has expected structure
        return validateFilters(parsed, defaults);
      }
    } catch (error) {
      console.warn(
        `Failed to load filters from localStorage for ${pageId}:`,
        error,
      );
    }
    return {};
  }

  /**
   * Save filters to localStorage
   */
  function saveToStorage(pageId: string, filters: T): void {
    try {
      localStorage.setItem(`filters_${pageId}`, JSON.stringify(filters));
    } catch (error) {
      console.warn(
        `Failed to save filters to localStorage for ${pageId}:`,
        error,
      );
    }
  }

  /**
   * Validate and merge loaded filters with defaults
   */
  function validateFilters(loaded: any, defaults: T): Partial<T> {
    const validated: Partial<T> = {};

    for (const key in defaults) {
      if (key in loaded) {
        const defaultValue = defaults[key];
        const loadedValue = loaded[key];

        // Type checking and validation
        if (typeof defaultValue === typeof loadedValue) {
          validated[key] = loadedValue;
        } else if (defaultValue !== null && defaultValue !== undefined) {
          // Try to coerce types for nested objects
          if (
            typeof defaultValue === "object" &&
            typeof loadedValue === "object"
          ) {
            validated[key] = { ...defaultValue, ...loadedValue } as T[Extract<
              keyof T,
              string
            >];
          }
        }
      }
    }

    return validated;
  }

  /**
   * Deserialize filters from URL query params
   */
  function deserializeFilters(query: LocationQuery, defaults: T): Partial<T> {
    const deserialized: Partial<T> = {};

    for (const key in defaults) {
      if (key in query) {
        const value = query[key];
        const defaultValue = defaults[key];

        if (value === null || value === undefined) continue;

        // Handle different types
        if (typeof defaultValue === "number") {
          const strValue = Array.isArray(value) ? value[0] : value;
          if (strValue) {
            const parsed = parseInt(strValue);
            if (!isNaN(parsed)) {
              deserialized[key] = parsed as T[Extract<keyof T, string>];
            }
          }
        } else if (typeof defaultValue === "boolean") {
          const strValue = Array.isArray(value) ? value[0] : value;
          if (strValue) {
            deserialized[key] = (strValue === "true") as T[Extract<
              keyof T,
              string
            >];
          }
        } else if (typeof defaultValue === "object" && defaultValue !== null) {
          // Handle nested objects (like pagination)
          try {
            const strValue = Array.isArray(value) ? value[0] : value;
            if (strValue) {
              const parsed = JSON.parse(strValue);
              deserialized[key] = { ...defaultValue, ...parsed } as T[Extract<
                keyof T,
                string
              >];
            }
          } catch {
            // If can't parse, try to extract individual fields
            const nested: any = { ...defaultValue };
            for (const nestedKey in nested) {
              const queryKey = `${String(key)}.${nestedKey}`;
              if (queryKey in query) {
                const nestedValue = query[queryKey];
                if (nestedValue !== null && nestedValue !== undefined) {
                  if (typeof nested[nestedKey] === "number") {
                    const strValue = Array.isArray(nestedValue)
                      ? nestedValue[0]
                      : nestedValue;
                    if (strValue) {
                      const parsed = parseInt(strValue);
                      if (!isNaN(parsed)) {
                        nested[nestedKey] = parsed;
                      }
                    }
                  } else {
                    nested[nestedKey] = Array.isArray(nestedValue)
                      ? nestedValue[0]
                      : nestedValue;
                  }
                }
              }
            }
            deserialized[key] = nested as T[Extract<keyof T, string>];
          }
        } else {
          // String values
          deserialized[key] = (
            Array.isArray(value) ? value[0] : value
          ) as T[Extract<keyof T, string>];
        }
      }
    }

    return deserialized;
  }

  /**
   * Serialize filters to URL query params
   */
  function serializeFilters(filters: T): LocationQuery {
    const query: LocationQuery = {};

    for (const key in filters) {
      const value = filters[key];
      const defaultValue = defaults[key];

      // Skip if value is same as default (keeps URL clean)
      if (JSON.stringify(value) === JSON.stringify(defaultValue)) {
        continue;
      }

      // Skip null, undefined, empty strings
      if (value === null || value === undefined || value === "") {
        continue;
      }

      // Handle different types
      if (typeof value === "object" && value !== null) {
        // For nested objects, flatten to individual query params
        for (const nestedKey in value) {
          const nestedValue = (value as any)[nestedKey];
          const defaultNestedValue = (defaultValue as any)?.[nestedKey];

          // Skip defaults
          if (
            nestedValue === defaultNestedValue ||
            nestedValue === null ||
            nestedValue === undefined
          ) {
            continue;
          }

          query[`${String(key)}.${nestedKey}`] = String(nestedValue);
        }
      } else {
        query[String(key)] = String(value);
      }
    }

    return query;
  }

  /**
   * Update URL with current filters (debounced)
   */
  function syncToUrl(filters: T): void {
    if (urlUpdateTimer) {
      clearTimeout(urlUpdateTimer);
    }

    urlUpdateTimer = setTimeout(() => {
      const query = serializeFilters(filters);

      // Only update if query actually changed
      if (JSON.stringify(query) !== JSON.stringify(route.query)) {
        router.replace({ query });
      }
    }, 300); // 300ms debounce
  }

  /**
   * Initialize filters from URL or localStorage
   */
  function initializeFilters(): void {
    // Priority 1: URL query params
    const urlFilters = deserializeFilters(route.query, defaults);

    // Priority 2: localStorage (only for keys not in URL)
    const storedFilters = loadFromStorage(pageId, defaults);

    // Merge: URL > localStorage > defaults
    const merged = {
      ...defaults,
      ...storedFilters,
      ...urlFilters,
    };

    // Apply to reactive filters
    Object.assign(filters, merged);

    // Mark as initialized
    isInitialized.value = true;
  }

  /**
   * Update a single filter
   */
  function updateFilter<K extends keyof T>(key: K, value: T[K]): void {
    (filters as any)[key] = value;
  }

  /**
   * Update multiple filters at once
   */
  function updateFilters(updates: Partial<T>): void {
    Object.assign(filters, updates);
  }

  /**
   * Reset filters to defaults
   */
  function resetFilters(): void {
    Object.assign(filters, defaults);
  }

  // Watch filters for changes and sync to storage/URL
  watch(
    () => ({ ...filters }),
    (newFilters) => {
      if (!isInitialized.value) return;

      // Save to localStorage
      saveToStorage(pageId, newFilters as T);

      // Sync to URL (debounced)
      syncToUrl(newFilters as T);
    },
    { deep: true },
  );

  // Initialize on mount
  onMounted(() => {
    initializeFilters();
  });

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    isInitialized,
  };
}
