/**
 * Colors Service
 * Handles all camp color-related operations
 */

import type { Color } from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

class ColorsService {
  /**
   * Get all colors
   */
  async getColors(): Promise<Color[]> {
    return storageService.getAll<Color>(STORAGE_KEYS.COLORS);
  }

  /**
   * Get a color by ID
   */
  async getColor(id: string): Promise<Color | null> {
    return storageService.getById<Color>(STORAGE_KEYS.COLORS, id);
  }

  /**
   * Save a color (create or update)
   */
  async saveColor(color: Color): Promise<Color> {
    const updatedColor = { ...color, updatedAt: new Date().toISOString() };
    return storageService.save<Color>(STORAGE_KEYS.COLORS, updatedColor);
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
  async getColorByName(name: string): Promise<Color | null> {
    const colors = await this.getColors();
    return (
      colors.find((c) => c.name.toLowerCase() === name.toLowerCase()) || null
    );
  }

  /**
   * Get a color by hex value
   */
  async getColorByHex(hexValue: string): Promise<Color | null> {
    const colors = await this.getColors();
    return (
      colors.find((c) => c.hexValue.toLowerCase() === hexValue.toLowerCase()) ||
      null
    );
  }
}

export const colorsService = new ColorsService();
