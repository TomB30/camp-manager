/**
 * Housing Rooms Service
 * Handles all housing/sleeping room-related operations
 */

import type { HousingRoom } from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

class HousingRoomsService {
  /**
   * Get all housing rooms
   */
  async getHousingRooms(): Promise<HousingRoom[]> {
    return storageService.getAll<HousingRoom>(STORAGE_KEYS.HOUSING_ROOMS);
  }

  /**
   * Get a housing room by ID
   */
  async getHousingRoom(id: string): Promise<HousingRoom | null> {
    return storageService.getById<HousingRoom>(STORAGE_KEYS.HOUSING_ROOMS, id);
  }

  /**
   * Save a housing room (create or update)
   */
  async saveHousingRoom(housingRoom: HousingRoom): Promise<HousingRoom> {
    return storageService.save<HousingRoom>(
      STORAGE_KEYS.HOUSING_ROOMS,
      housingRoom,
    );
  }

  /**
   * Delete a housing room
   */
  async deleteHousingRoom(id: string): Promise<void> {
    return storageService.delete(STORAGE_KEYS.HOUSING_ROOMS, id);
  }

  /**
   * Get housing rooms by area
   */
  async getHousingRoomsByArea(areaId: string): Promise<HousingRoom[]> {
    const rooms = await this.getHousingRooms();
    return rooms.filter((r) => r.areaId === areaId);
  }
}

export const housingRoomsService = new HousingRoomsService();
