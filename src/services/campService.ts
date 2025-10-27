import type { Camp, CampUpdateRequest } from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export const campService = {
  getCamp,
  updateCamp,
  initializeDefaultCamp,
};

/**
 * Get the camp (singleton). If no camp exists, initialize a default one.
 */
async function getCamp(): Promise<Camp> {
  const camps = await storageService.getAll<Camp>(STORAGE_KEYS.CAMP);

  if (camps.length === 0) {
    return await initializeDefaultCamp();
  }

  return camps[0];
}

/**
 * Update the camp settings
 */
async function updateCamp(campUpdate: CampUpdateRequest): Promise<Camp> {
  const existingCamp = await getCamp();

  const updatedCamp: Camp = {
    meta: {
      id: existingCamp.meta.id,
      name: campUpdate.meta.name,
      description: campUpdate.meta.description,
      createdAt: existingCamp.meta.createdAt,
      updatedAt: new Date().toISOString(),
    },
    spec: {
      ...existingCamp.spec,
      ...campUpdate.spec,
    },
  };

  return storageService.save<Camp>(STORAGE_KEYS.CAMP, updatedCamp);
}

/**
 * Initialize a default camp if none exists
 */
async function initializeDefaultCamp(): Promise<Camp> {
  const defaultCamp: Camp = {
    meta: {
      id: crypto.randomUUID(),
      name: "My Summer Camp",
      description: "Welcome to our summer camp!",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 90 days from now
      dailyStartTime: "08:00",
      dailyEndTime: "20:00",
    },
  };

  return storageService.save<Camp>(STORAGE_KEYS.CAMP, defaultCamp);
}
