import { storageService, STORAGE_KEYS } from "@/services";
import { useMainStore } from "@/stores";
import { isBackendEnabled, setBackendEnabled, getDataSourceMode } from "@/config/dataSource";

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
  
Previous: ${currentMode ? 'BACKEND API' : 'LOCAL_STORAGE'}
Current:  ${newMode ? 'BACKEND API' : 'LOCAL_STORAGE'}

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
  const modeDisplay = mode === 'backend' ? 'BACKEND API' : 'LOCAL_STORAGE';
  
  console.log(`
📊 Current Data Source: ${modeDisplay}
  
To switch modes, use:
  devTools.toggleBackendMode()
  `);
  
  return modeDisplay;
}

// Expose functions to window object for console access
if (typeof window !== "undefined") {
  (window as any).devTools = {
    clearData,
    insertMockData,
    resetData,
    toggleBackendMode,
    getDataSource,
  };

  const currentMode = getDataSourceMode();
  const modeDisplay = currentMode === 'backend' ? 'BACKEND API' : 'LOCAL_STORAGE';

  console.log(`
🛠️  Development Tools Loaded!
📊 Current Data Source: ${modeDisplay}
    
Available commands:
  devTools.clearData()         - Clear all data from localStorage
  devTools.insertMockData()    - Insert fresh mock data
  devTools.resetData()         - Clear and re-insert mock data (recommended)
  devTools.toggleBackendMode() - Switch modes (⚠️  logs you out!)
  devTools.getDataSource()     - Check current data source mode

Example usage:
  await devTools.resetData()
  devTools.toggleBackendMode()  // Note: This will logout and reload

⚠️  Important: Switching modes logs you out since backend and localStorage
   use different users and tokens. You'll need to login again after switching.
  `);
}
