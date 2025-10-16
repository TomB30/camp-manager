/**
 * Family Groups Service
 * Handles all family group-related operations
 */

import type { FamilyGroup } from '@/types';
import { storageService } from './storage';
import { STORAGE_KEYS } from './storageKeys';

class FamilyGroupsService {
  /**
   * Get all family groups
   */
  async getFamilyGroups(): Promise<FamilyGroup[]> {
    return storageService.getAll<FamilyGroup>(STORAGE_KEYS.FAMILY_GROUPS);
  }

  /**
   * Get a family group by ID
   */
  async getFamilyGroup(id: string): Promise<FamilyGroup | null> {
    return storageService.getById<FamilyGroup>(STORAGE_KEYS.FAMILY_GROUPS, id);
  }

  /**
   * Save a family group (create or update)
   */
  async saveFamilyGroup(group: FamilyGroup): Promise<FamilyGroup> {
    const updatedGroup = { ...group, updatedAt: new Date().toISOString() };
    return storageService.save<FamilyGroup>(STORAGE_KEYS.FAMILY_GROUPS, updatedGroup);
  }

  /**
   * Delete a family group
   */
  async deleteFamilyGroup(id: string): Promise<void> {
    return storageService.delete(STORAGE_KEYS.FAMILY_GROUPS, id);
  }

  /**
   * Get family groups by housing room
   */
  async getFamilyGroupsByRoom(housingRoomId: string): Promise<FamilyGroup[]> {
    const groups = await this.getFamilyGroups();
    return groups.filter(g => g.housingRoomId === housingRoomId);
  }

  /**
   * Get family groups by session
   */
  async getFamilyGroupsBySession(sessionId: string): Promise<FamilyGroup[]> {
    const groups = await this.getFamilyGroups();
    return groups.filter(g => g.sessionId === sessionId);
  }
}

export const familyGroupsService = new FamilyGroupsService();

