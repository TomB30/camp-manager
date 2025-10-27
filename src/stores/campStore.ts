import { defineStore } from "pinia";
import type { Camp, CampUpdateRequest } from "@/types";
import { campService } from "@/services";

export const useCampStore = defineStore("camp", {
  state: () => ({
    camp: null as Camp | null,
    loading: false,
  }),

  getters: {
    /**
     * Get the camp name
     */
    campName(state): string {
      return state.camp?.meta.name || "My Camp";
    },

    /**
     * Get the camp daily hours
     */
    dailyHours(state): { start: string; end: string } | null {
      if (!state.camp) return null;
      return {
        start: state.camp.spec.dailyStartTime,
        end: state.camp.spec.dailyEndTime,
      };
    },

    /**
     * Get the camp date range
     */
    dateRange(state): { start: string; end: string } | null {
      if (!state.camp) return null;
      return {
        start: state.camp.spec.startDate,
        end: state.camp.spec.endDate,
      };
    },
  },

  actions: {
    /**
     * Load the camp (singleton). Initialize default if none exists.
     */
    async loadCamp(): Promise<void> {
      this.loading = true;
      try {
        this.camp = await campService.getCamp();
      } finally {
        this.loading = false;
      }
    },

    /**
     * Update the camp settings
     */
    async updateCamp(campUpdate: CampUpdateRequest): Promise<void> {
      const updatedCamp = await campService.updateCamp(campUpdate);
      this.camp = updatedCamp;
    },
  },
});

