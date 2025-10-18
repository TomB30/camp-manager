/**
 * Groups Service (Unified Groups)
 * Handles all group-related operations for the unified Group type
 */

import type { Group } from '@/types';
import { storageService } from './storage';
import { STORAGE_KEYS } from './storageKeys';

class GroupsService {
  /**
   * Get all groups
   */
  async getGroups(): Promise<Group[]> {
    return storageService.getAll<Group>(STORAGE_KEYS.GROUPS);
  }

  /**
   * Get a group by ID
   */
  async getGroup(id: string): Promise<Group | null> {
    return storageService.getById<Group>(STORAGE_KEYS.GROUPS, id);
  }

  /**
   * Save a group (create or update)
   */
  async saveGroup(group: Group): Promise<Group> {
    const updatedGroup = { ...group, updatedAt: new Date().toISOString() };
    return storageService.save<Group>(STORAGE_KEYS.GROUPS, updatedGroup);
  }

  /**
   * Delete a group
   */
  async deleteGroup(id: string): Promise<void> {
    return storageService.delete(STORAGE_KEYS.GROUPS, id);
  }
}

export const groupsService = new GroupsService();
