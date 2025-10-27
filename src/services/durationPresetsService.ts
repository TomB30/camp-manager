import type {
  DurationPreset,
  DurationPresetCreationRequest,
  DurationPresetUpdateRequest,
} from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export const durationPresetsService = {
  listDurationPresets,
  createDurationPreset,
  updateDurationPreset,
  deleteDurationPreset,
  getDurationPresetById,
  getDefaultDurationPreset,
};

async function listDurationPresets(): Promise<DurationPreset[]> {
  return storageService.getAll<DurationPreset>(STORAGE_KEYS.DURATION_PRESETS);
}

async function createDurationPreset(
  preset: DurationPresetCreationRequest,
): Promise<DurationPreset> {
  // If this preset is being set as default, unset other defaults
  if (preset.default) {
    const allPresets = await listDurationPresets();
    for (const existingPreset of allPresets) {
      if (existingPreset.default) {
        await updateDurationPreset(existingPreset.id, { default: false });
      }
    }
  }

  const newPreset: DurationPreset = {
    ...preset,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return storageService.save<DurationPreset>(
    STORAGE_KEYS.DURATION_PRESETS,
    newPreset,
  );
}

async function updateDurationPreset(
  id: string,
  preset: DurationPresetUpdateRequest,
): Promise<DurationPreset> {
  const existingPreset = await storageService.getById<DurationPreset>(
    STORAGE_KEYS.DURATION_PRESETS,
    id,
  );
  
  if (!existingPreset) {
    throw new Error(`Duration preset with id ${id} not found`);
  }

  // If this preset is being set as default, unset other defaults
  if (preset.default && !existingPreset.default) {
    const allPresets = await listDurationPresets();
    for (const existingPreset of allPresets) {
      if (existingPreset.id !== id && existingPreset.default) {
        const updated = {
          ...existingPreset,
          default: false,
          updatedAt: new Date().toISOString(),
        };
        await storageService.save<DurationPreset>(
          STORAGE_KEYS.DURATION_PRESETS,
          updated,
        );
      }
    }
  }

  const updatedPreset: DurationPreset = {
    ...existingPreset,
    ...preset,
    updatedAt: new Date().toISOString(),
  };
  
  return storageService.save<DurationPreset>(
    STORAGE_KEYS.DURATION_PRESETS,
    updatedPreset,
  );
}

async function deleteDurationPreset(id: string): Promise<void> {
  return storageService.delete(STORAGE_KEYS.DURATION_PRESETS, id);
}

async function getDurationPresetById(
  id: string,
): Promise<DurationPreset | null> {
  return storageService.getById<DurationPreset>(
    STORAGE_KEYS.DURATION_PRESETS,
    id,
  );
}

async function getDefaultDurationPreset(): Promise<DurationPreset | null> {
  const presets = await listDurationPresets();
  return presets.find((p) => p.default) || null;
}

