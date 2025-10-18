/**
 * Generic Storage Service
 * Provides low-level CRUD operations for localStorage
 */

import { STORAGE_KEYS } from './storageKeys';

// Simulate async operations to match future API
const delay = (ms: number = 50) => new Promise(resolve => setTimeout(resolve, ms));

export interface BaseEntity {
  id: string;
  [key: string]: any;
}

class StorageService {
  /**
   * Get all items from a storage key
   */
  async getAll<T extends BaseEntity>(storageKey: string): Promise<T[]> {
    await delay();
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get a single item by ID from a storage key
   */
  async getById<T extends BaseEntity>(storageKey: string, id: string): Promise<T | null> {
    await delay();
    const items = await this.getAll<T>(storageKey);
    return items.find(item => item.id === id) || null;
  }

  /**
   * Save (create or update) an item in storage
   */
  async save<T extends BaseEntity>(storageKey: string, item: T): Promise<T> {
    await delay();
    const items = await this.getAll<T>(storageKey);
    const index = items.findIndex(i => i.id === item.id);
    
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(items));
    return item;
  }

  /**
   * Delete an item by ID from storage
   */
  async delete(storageKey: string, id: string): Promise<void> {
    await delay();
    const items = await this.getAll(storageKey);
    const filtered = items.filter(item => item.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(filtered));
  }

  /**
   * Bulk save multiple items
   */
  async saveBatch<T extends BaseEntity>(storageKey: string, items: T[]): Promise<T[]> {
    await delay();
    const existingItems = await this.getAll<T>(storageKey);
    const itemMap = new Map(existingItems.map(item => [item.id, item]));
    
    // Update or add items
    items.forEach(item => {
      itemMap.set(item.id, item);
    });
    
    const updatedItems = Array.from(itemMap.values());
    localStorage.setItem(storageKey, JSON.stringify(updatedItems));
    return items;
  }

  /**
   * Clear a specific storage key
   */
  async clear(storageKey: string): Promise<void> {
    await delay();
    localStorage.removeItem(storageKey);
  }

  /**
   * Clear all storage keys
   */
  async clearAll(storageKeys: string[]): Promise<void> {
    await delay();
    storageKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Seed data to storage
   */
  async seed<T extends BaseEntity>(storageKey: string, data: T[]): Promise<void> {
    await delay();
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  /**
   * Seed multiple data sets to storage (for mock data initialization)
   */
  async seedData(data: {
    campers?: any[];
    staffMembers?: any[];
    rooms?: any[];
    sleepingRooms?: any[];
    events?: any[];
    groups?: any[];
    camperGroups?: any[];
    familyGroups?: any[];
    programs?: any[];
    activities?: any[];
    locations?: any[];
    certifications?: any[];
    colors?: any[];
    sessions?: any[];
    labels?: any[];
  }): Promise<void> {
    await delay();
    
    if (data.campers) {
      localStorage.setItem(STORAGE_KEYS.CAMPERS, JSON.stringify(data.campers));
    }
    if (data.staffMembers) {
      localStorage.setItem(STORAGE_KEYS.STAFF_MEMBERS, JSON.stringify(data.staffMembers));
    }
    if (data.rooms) {
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(data.rooms));
    }
    if (data.sleepingRooms) {
      localStorage.setItem(STORAGE_KEYS.HOUSING_ROOMS, JSON.stringify(data.sleepingRooms));
    }
    if (data.events) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data.events));
    }
    if (data.groups) {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(data.groups));
    }
    if (data.programs) {
      localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(data.programs));
    }
    if (data.activities) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(data.activities));
    }
    if (data.locations) {
      localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(data.locations));
    }
    if (data.certifications) {
      localStorage.setItem(STORAGE_KEYS.CERTIFICATIONS, JSON.stringify(data.certifications));
    }
    if (data.colors) {
      localStorage.setItem(STORAGE_KEYS.COLORS, JSON.stringify(data.colors));
    }
    if (data.sessions) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions));
    }
    if (data.labels) {
      localStorage.setItem(STORAGE_KEYS.LABELS, JSON.stringify(data.labels));
    }
  }
}

export const storageService = new StorageService();
