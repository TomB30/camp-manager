/**
 * Labels Service
 * Handles all label-related operations
 */

import type { Label } from '@/types';
import { storageService } from './storage';
import { STORAGE_KEYS } from './storageKeys';

class LabelsService {
  /**
   * Get all labels
   */
  async getLabels(): Promise<Label[]> {
    return storageService.getAll<Label>(STORAGE_KEYS.LABELS);
  }

  /**
   * Get a label by ID
   */
  async getLabel(id: string): Promise<Label | null> {
    return storageService.getById<Label>(STORAGE_KEYS.LABELS, id);
  }

  /**
   * Save a label (create or update)
   */
  async saveLabel(label: Label): Promise<Label> {
    const updatedLabel = { ...label, updatedAt: new Date().toISOString() };
    return storageService.save<Label>(STORAGE_KEYS.LABELS, updatedLabel);
  }

  /**
   * Delete a label
   */
  async deleteLabel(id: string): Promise<void> {
    return storageService.delete(STORAGE_KEYS.LABELS, id);
  }

  /**
   * Get a label by name
   */
  async getLabelByName(name: string): Promise<Label | null> {
    const labels = await this.getLabels();
    return labels.find(l => l.name.toLowerCase() === name.toLowerCase()) || null;
  }
}

export const labelsService = new LabelsService();

