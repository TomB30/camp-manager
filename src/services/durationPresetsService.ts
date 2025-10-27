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
  if (preset.spec.default) {
    const allPresets = await listDurationPresets();
    for (const existingPreset of allPresets) {
      if (existingPreset.spec.default) {
        await updateDurationPreset(existingPreset.meta.id, {
          ...existingPreset,
          spec: { ...existingPreset.spec, default: false },
        });
      }
    }
  }

  const newPreset: DurationPreset = {
    meta: {
      id: crypto.randomUUID(),
      name: preset.meta.name,
      description: preset.meta.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: preset.spec,
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
  if (preset.spec.default && !existingPreset.spec.default) {
    const allPresets = await listDurationPresets();
    for (const existingPreset of allPresets) {
      if (existingPreset.meta.id !== id && existingPreset.spec.default) {
        const updated = {
          ...existingPreset,
          spec: { ...existingPreset.spec, default: false },
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
    meta: {
      ...existingPreset.meta,
      name: preset.meta.name,
      description: preset.meta.description,
      updatedAt: new Date().toISOString(),
    },
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
  return presets.find((p) => p.spec.default) || null;
}
