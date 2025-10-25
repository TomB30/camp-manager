import { defineStore } from "pinia";
import type { Area, AreaCreationRequest, AreaUpdateRequest } from "@/types";
import { areasService } from "@/services";

export const useAreasStore = defineStore("areas", {
  state: () => ({
    areas: [] as Area[],
    loading: false,
  }),

  getters: {
    getAreaById(state): (id: string) => Area | undefined {
      return (id: string): Area | undefined => {
        return state.areas.find((a) => a.id === id);
      };
    },

    getAreasByType(state): (type: Area["type"]) => Area[] {
      return (type: Area["type"]): Area[] => {
        return state.areas.filter((a) => a.type === type);
      };
    },
  },

  actions: {
    async loadAreas(): Promise<void> {
      this.loading = true;
      try {
        this.areas = await areasService.listAreas();
      } finally {
        this.loading = false;
      }
    },

    async createArea(areaRequest: AreaCreationRequest): Promise<Area> {
      const area = await areasService.createArea(areaRequest);
      this.areas.push(area);
      return area;
    },

    async updateArea(id: string, areaUpdate: AreaUpdateRequest): Promise<void> {
      const area = await areasService.updateArea(id, areaUpdate);
      const index = this.areas.findIndex((a) => a.id === id);
      if (index >= 0) {
        this.areas[index] = area;
      }
    },

    async deleteArea(id: string): Promise<void> {
      await areasService.deleteArea(id);
      this.areas = this.areas.filter((a) => a.id !== id);
    },
  },
});
