import { defineStore } from "pinia";
import type {
  DurationPreset,
  DurationPresetCreationRequest,
  DurationPresetUpdateRequest,
} from "@/types";
import { durationPresetsService } from "@/services";

export const useDurationPresetsStore = defineStore("durationPresets", {
  state: () => ({
    durationPresets: [] as DurationPreset[],
    loading: false,
  }),

  getters: {
    /**
     * Get a duration preset by ID
     */
    getDurationPresetById(state): (id: string) => DurationPreset | undefined {
      return (id: string): DurationPreset | undefined => {
        return state.durationPresets.find((p) => p.meta.id === id);
      };
    },

    /**
     * Get the default duration preset
     */
    defaultDurationPreset(state): DurationPreset | undefined {
      return state.durationPresets.find((p) => p.spec.default);
    },

    /**
     * Get duration presets sorted by duration (ascending)
     */
    sortedDurationPresets(state): DurationPreset[] {
      return [...state.durationPresets].sort(
        (a, b) => a.spec.durationMinutes - b.spec.durationMinutes,
      );
    },
  },

  actions: {
    /**
     * Load all duration presets
     */
    async loadDurationPresets(): Promise<void> {
      this.loading = true;
      try {
        this.durationPresets =
          await durationPresetsService.listDurationPresets();
      } finally {
        this.loading = false;
      }
    },

    /**
     * Create a new duration preset
     */
    async createDurationPreset(
      preset: DurationPresetCreationRequest,
    ): Promise<DurationPreset> {
      const newPreset =
        await durationPresetsService.createDurationPreset(preset);
      this.durationPresets.push(newPreset);
      return newPreset;
    },

    /**
     * Update an existing duration preset
     */
    async updateDurationPreset(
      presetId: string,
      presetUpdate: DurationPresetUpdateRequest,
    ): Promise<void> {
      const updatedPreset = await durationPresetsService.updateDurationPreset(
        presetId,
        presetUpdate,
      );
      const index = this.durationPresets.findIndex((p) => p.meta.id === presetId);
      if (index >= 0) {
        this.durationPresets[index] = updatedPreset;
      }
    },

    /**
     * Delete a duration preset
     */
    async deleteDurationPreset(presetId: string): Promise<void> {
      await durationPresetsService.deleteDurationPreset(presetId);
      this.durationPresets = this.durationPresets.filter(
        (p) => p.meta.id !== presetId,
      );
    },
  },
});

