/**
 * Locations Service (Rooms)
 * Handles all location/room-related operations
 */

import type { Location } from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

class LocationsService {
  /**
   * Get all locations
   */
  async getLocations(): Promise<Location[]> {
    return storageService.getAll<Location>(STORAGE_KEYS.LOCATIONS);
  }

  /**
   * Get a location by ID
   */
  async getLocation(id: string): Promise<Location | null> {
    return storageService.getById<Location>(STORAGE_KEYS.LOCATIONS, id);
  }

  /**
   * Save a location (create or update)
   */
  async saveLocation(location: Location): Promise<Location> {
    return storageService.save<Location>(STORAGE_KEYS.LOCATIONS, location);
  }

  /**
   * Delete a location
   */
  async deleteLocation(id: string): Promise<void> {
    return storageService.delete(STORAGE_KEYS.LOCATIONS, id);
  }

  /**
   * Get locations by area
   */
  async getLocationsByArea(areaId: string): Promise<Location[]> {
    const locations = await this.getLocations();
    return locations.filter((l) => l.areaId === areaId);
  }

  /**
   * Get locations by type
   */
  async getLocationsByType(type: Location["type"]): Promise<Location[]> {
    const locations = await this.getLocations();
    return locations.filter((l) => l.type === type);
  }
}

export const locationsService = new LocationsService();
