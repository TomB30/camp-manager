/**
 * Areas Service
 * Handles all area-related operations
 */

import type { Area } from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

class AreasService {
  /**
   * Get all areas
   */
  async getAreas(): Promise<Area[]> {
    return storageService.getAll<Area>(STORAGE_KEYS.AREAS);
  }

  /**
   * Get an area by ID
   */
  async getArea(id: string): Promise<Area | null> {
    return storageService.getById<Area>(STORAGE_KEYS.AREAS, id);
  }

  /**
   * Save an area (create or update)
   */
  async saveArea(area: Area): Promise<Area> {
    const updatedArea = { ...area, updatedAt: new Date().toISOString() };
    return storageService.save<Area>(STORAGE_KEYS.AREAS, updatedArea);
  }

  /**
   * Delete an area
   */
  async deleteArea(id: string): Promise<void> {
    return storageService.delete(STORAGE_KEYS.AREAS, id);
  }

  /**
   * Get areas by type
   */
  async getAreasByType(type: Area["type"]): Promise<Area[]> {
    const areas = await this.getAreas();
    return areas.filter((a) => a.type === type);
  }
}

export const areasService = new AreasService();
