import { storageService, STORAGE_KEYS } from "@/services";
import { useMainStore } from "@/stores";

/**
 * Development Tools - Functions exposed to browser console for easy data management
 *
 * Available functions:
 * - clearData(): Clear all data from localStorage
 * - insertMockData(): Insert fresh mock data
 * - resetData(): Clear and re-insert mock data in one step
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

// Expose functions to window object for console access
if (typeof window !== "undefined") {
  (window as any).devTools = {
    clearData,
    insertMockData,
    resetData,
  };

  console.log(`
🛠️  Development Tools Loaded!
    
Available commands:
  devTools.clearData()      - Clear all data from localStorage
  devTools.insertMockData() - Insert fresh mock data
  devTools.resetData()      - Clear and re-insert mock data (recommended)

Example usage:
  await devTools.resetData()
  `);
}
