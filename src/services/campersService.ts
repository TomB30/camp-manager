/**
 * Campers Service
 * Handles all camper-related operations
 */

import type { Camper } from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

class CampersService {
  /**
   * Get all campers
   */
  async getCampers(): Promise<Camper[]> {
    return storageService.getAll<Camper>(STORAGE_KEYS.CAMPERS);
  }

  /**
   * Get a camper by ID
   */
  async getCamper(id: string): Promise<Camper | null> {
    return storageService.getById<Camper>(STORAGE_KEYS.CAMPERS, id);
  }

  /**
   * Save a camper (create or update)
   */
  async saveCamper(camper: Camper): Promise<Camper> {
    return storageService.save<Camper>(STORAGE_KEYS.CAMPERS, camper);
  }

  /**
   * Delete a camper and clean up references
   */
  async deleteCamper(id: string): Promise<void> {
    // Delete the camper
    await storageService.delete(STORAGE_KEYS.CAMPERS, id);

    // Clean up: Remove from all events
    const events = await storageService.getAll(STORAGE_KEYS.EVENTS);
    const updatedEvents = events.map((event) => ({
      ...event,
      enrolledCamperIds:
        event.enrolledCamperIds?.filter(
          (camperId: string) => camperId !== id,
        ) || [],
    }));

    // Save all updated events
    for (const event of updatedEvents) {
      await storageService.save(STORAGE_KEYS.EVENTS, event);
    }
  }

  /**
   * Get campers by family group
   */
  async getCampersByFamilyGroup(familyGroupId: string): Promise<Camper[]> {
    const campers = await this.getCampers();
    return campers.filter((c) => c.familyGroupId === familyGroupId);
  }

  /**
   * Get campers by session
   */
  async getCampersBySession(sessionId: string): Promise<Camper[]> {
    const campers = await this.getCampers();
    return campers.filter((c) => c.sessionId === sessionId);
  }
}

export const campersService = new CampersService();
