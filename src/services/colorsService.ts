/**
 * Colors Service
 * Handles all camp color-related operations
 */

import type { CampColor } from '@/types';
import { storageService } from './storage';
import { STORAGE_KEYS } from './storageKeys';

class ColorsService {
  /**
   * Get all colors
   */
  async getColors(): Promise<CampColor[]> {
    return storageService.getAll<CampColor>(STORAGE_KEYS.COLORS);
  }

  /**
   * Get a color by ID
   */
  async getColor(id: string): Promise<CampColor | null> {
    return storageService.getById<CampColor>(STORAGE_KEYS.COLORS, id);
  }

  /**
   * Save a color (create or update)
   */
  async saveColor(color: CampColor): Promise<CampColor> {
    const updatedColor = { ...color, updatedAt: new Date().toISOString() };
    return storageService.save<CampColor>(STORAGE_KEYS.COLORS, updatedColor);
  }

  /**
   * Delete a color
   */
  async deleteColor(id: string): Promise<void> {
    return storageService.delete(STORAGE_KEYS.COLORS, id);
  }

  /**
   * Get a color by name
   */
  async getColorByName(name: string): Promise<CampColor | null> {
    const colors = await this.getColors();
    return colors.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
  }

  /**
   * Get a color by hex value
   */
  async getColorByHex(hexValue: string): Promise<CampColor | null> {
    const colors = await this.getColors();
    return colors.find(c => c.hexValue.toLowerCase() === hexValue.toLowerCase()) || null;
  }
}

export const colorsService = new ColorsService();

