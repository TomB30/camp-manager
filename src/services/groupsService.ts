/**
 * Groups Service (Camper Groups)
 * Handles all camper group-related operations
 */

import type { CamperGroup } from '@/types';
import { storageService } from './storage';
import { STORAGE_KEYS } from './storageKeys';

class GroupsService {
  /**
   * Get all camper groups
   */
  async getCamperGroups(): Promise<CamperGroup[]> {
    return storageService.getAll<CamperGroup>(STORAGE_KEYS.CAMPER_GROUPS);
  }

  /**
   * Get a camper group by ID
   */
  async getCamperGroup(id: string): Promise<CamperGroup | null> {
    return storageService.getById<CamperGroup>(STORAGE_KEYS.CAMPER_GROUPS, id);
  }

  /**
   * Save a camper group (create or update)
   */
  async saveCamperGroup(group: CamperGroup): Promise<CamperGroup> {
    const updatedGroup = { ...group, updatedAt: new Date().toISOString() };
    return storageService.save<CamperGroup>(STORAGE_KEYS.CAMPER_GROUPS, updatedGroup);
  }

  /**
   * Delete a camper group
   */
  async deleteCamperGroup(id: string): Promise<void> {
    return storageService.delete(STORAGE_KEYS.CAMPER_GROUPS, id);
  }
}

export const groupsService = new GroupsService();

