import { storageService, STORAGE_KEYS } from "@/services";
import { useMainStore } from "@/stores";
import {
  isBackendEnabled,
  setBackendEnabled,
  getDataSourceMode,
} from "@/config/dataSource";
import {
  getCacheStats,
  clearAllCache,
  resetCacheStats,
  invalidateEntityCache,
} from "@/utils/requestCache";

/**
 * Development Tools - Functions exposed to browser console for easy data management
 *
 * Available functions:
 * - clearData(): Clear all data from localStorage
 * - insertMockData(): Insert fresh mock data
 * - resetData(): Clear and re-insert mock data in one step
 * - toggleBackendMode(): Switch between backend API and localStorage
 * - getDataSource(): Check current data source mode
 */

/**
 * Clear all data from localStorage
 */
export async function clearData(): Promise<void> {
  console.log("🧹 Clearing all data from localStorage...");
  await storageService.clearAll(Object.values(STORAGE_KEYS));

  // Reload all stores to clear state
  const mainStore = useMainStore();
  await mainStore.loadAll();

  console.log("✅ All data cleared successfully!");
}

/**
 * Insert fresh mock data
 */
export async function insertMockData(): Promise<void> {
  console.log("📦 Inserting mock data...");

  // Lazy load mock data only when needed
  const { mockData } = await import("@/data/mockData");

  console.log(`- 1 camp`);
  console.log(`- ${mockData.certifications.length} certifications`);
  console.log(`- ${mockData.roles.length} roles`);
  console.log(`- ${mockData.locations.length} locations`);
  console.log(`- ${mockData.staffMembers.length} staff members`);
  console.log(`- ${mockData.areas.length} areas`);
  console.log(`- ${mockData.housingRooms.length} housing rooms`);
  console.log(`- ${mockData.groups.length} groups`);
  console.log(`- ${mockData.campers.length} campers`);
  console.log(`- ${mockData.programs.length} programs`);
  console.log(`- ${mockData.activities.length} activities`);
  console.log(`- ${mockData.events.length} events`);

  await storageService.seedData(mockData);

  // Reload data in store
  const mainStore = useMainStore();
  await mainStore.loadAll();

  console.log("✅ Mock data inserted successfully!");
}

/**
 * Clear all data and insert fresh mock data
 */
export async function resetData(): Promise<void> {
  console.log("🔄 Resetting all data...");
  await clearData();
  await insertMockData();
  console.log("✅ Data reset complete!");
}

/**
 * Toggle between backend API and localStorage mode
 * Clears authentication data since backend and localStorage use different users/tokens
 */
export function toggleBackendMode(): void {
  const currentMode = isBackendEnabled();
  const newMode = !currentMode;

  // Clear all authentication data
  console.log("🔐 Logging out and clearing authentication data...");
  localStorage.removeItem("auth_token");
  localStorage.removeItem("camp_manager_auth");
  localStorage.removeItem("camp_manager_selected_camp");

  // Set new mode
  setBackendEnabled(newMode);

  console.log(`
🔄 Data Source Mode Changed!
  
Previous: ${currentMode ? "BACKEND API" : "LOCAL_STORAGE"}
Current:  ${newMode ? "BACKEND API" : "LOCAL_STORAGE"}

🔐 Authentication cleared - you'll need to login again
⚠️  Page will reload to apply changes...
  `);

  // Reload the page to apply changes (redirects to login via router guard)
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

/**
 * Get current data source mode
 */
export function getDataSource(): string {
  const mode = getDataSourceMode();
  const modeDisplay = mode === "backend" ? "BACKEND API" : "LOCAL_STORAGE";

  console.log(`
📊 Current Data Source: ${modeDisplay}
  
To switch modes, use:
  devTools.toggleBackendMode()
  `);

  return modeDisplay;
}

/**
 * Get request cache statistics
 */
export function getCacheInfo(): void {
  const stats = getCacheStats();
  const hitRate =
    stats.hits + stats.misses > 0
      ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2)
      : "0";

  console.log(`
📊 Request Cache Statistics
  
Cache Size: ${stats.size} entries
Hits:       ${stats.hits}
Misses:     ${stats.misses}
Hit Rate:   ${hitRate}%
Invalidations: ${stats.invalidations}

Recent Cache Keys:
${stats.entries
  .slice(0, 10)
  .map((key, idx) => `  ${idx + 1}. ${key.substring(0, 80)}...`)
  .join("\n")}
${stats.entries.length > 10 ? `  ... and ${stats.entries.length - 10} more` : ""}

Use devTools.clearCache() to clear all cached requests
Use devTools.invalidateCache('entityType') to clear cache for a specific entity
  `);
}

/**
 * Clear request cache
 */
export function clearCache(): void {
  clearAllCache();
}

/**
 * Reset cache statistics
 */
export function resetCacheInfo(): void {
  resetCacheStats();
}

/**
 * Invalidate cache for a specific entity type
 */
export function invalidateCache(entityType: string): void {
  invalidateEntityCache(entityType);
}

// Expose functions to window object for console access
if (typeof window !== "undefined") {
  (window as any).devTools = {
    clearData,
    insertMockData,
    resetData,
    toggleBackendMode,
    getDataSource,
    getCacheInfo,
    clearCache,
    resetCacheInfo,
    invalidateCache,
  };

  const currentMode = getDataSourceMode();
  const modeDisplay =
    currentMode === "backend" ? "BACKEND API" : "LOCAL_STORAGE";

  console.log(`
🛠️  Development Tools Loaded!
📊 Current Data Source: ${modeDisplay}
    
Available commands:
  
  Data Management:
    devTools.clearData()         - Clear all data from localStorage
    devTools.insertMockData()    - Insert fresh mock data
    devTools.resetData()         - Clear and re-insert mock data (recommended)
  
  Data Source:
    devTools.toggleBackendMode() - Switch modes (⚠️  logs you out!)
    devTools.getDataSource()     - Check current data source mode
  
  Request Cache:
    devTools.getCacheInfo()      - View cache statistics and entries
    devTools.clearCache()        - Clear all cached requests
    devTools.resetCacheInfo()    - Reset cache statistics counters
    devTools.invalidateCache(entityType) - Clear cache for specific entity

Example usage:
  await devTools.resetData()
  devTools.toggleBackendMode()  // Note: This will logout and reload
  devTools.getCacheInfo()       // View cache stats

⚠️  Important: Switching modes logs you out since backend and localStorage
   use different users and tokens. You'll need to login again after switching.
  `);
}
