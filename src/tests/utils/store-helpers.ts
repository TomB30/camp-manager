/**
 * Store testing helper functions
 */

import { setActivePinia, createPinia, Store } from "pinia";
import type { StateTree } from "pinia";

/**
 * Create a fresh Pinia instance for each test
 */
export function setupTestPinia() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
}

/**
 * Reset all stores to initial state
 */
export function resetAllStores() {
  const pinia = createPinia();
  setActivePinia(pinia);
}

/**
 * Populate a store with test data
 */
export function populateStore<T extends StateTree>(
  store: Store,
  data: Partial<T>,
): void {
  Object.assign(store.$state, data);
}

/**
 * Mock a store action
 */
export function mockStoreAction(
  store: Store,
  actionName: string,
  mockImplementation: (...args: unknown[]) => unknown,
): void {
  (store as any)[actionName] = mockImplementation;
}

/**
 * Spy on a store action
 */
export function spyOnStoreAction(store: Store, actionName: string) {
  const original = (store as any)[actionName];
  const calls: unknown[][] = [];

  (store as any)[actionName] = (...args: unknown[]) => {
    calls.push(args);
    return original.apply(store, args);
  };

  return {
    calls,
    restore: () => {
      (store as any)[actionName] = original;
    },
  };
}

/**
 * Get store state snapshot
 */
export function getStoreSnapshot<T extends StateTree>(store: Store): T {
  return JSON.parse(JSON.stringify(store.$state));
}

/**
 * Wait for store action to complete
 */
export async function waitForStoreAction(
  store: Store,
  actionName: string,
  timeout = 1000,
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    // This is a simplified check; you might need more sophisticated logic
    if (!((store.$state as Record<string, unknown>)._pending as Record<string, unknown>)?.[actionName]) {
      return;
    }
  }
  throw new Error(`Store action "${actionName}" did not complete within timeout`);
}

