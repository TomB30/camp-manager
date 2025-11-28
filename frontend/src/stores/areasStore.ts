import { defineStore } from "pinia";
import type {
  Area,
  AreaCreationRequest,
  AreaUpdateRequest,
} from "@/generated/api";
import { areasService } from "@/services";

export const useAreasStore = defineStore("areas", {
  state: () => ({
    areas: [] as Area[],
    loading: false,
  }),

  getters: {
    getAreaById(state): (id: string) => Area | undefined {
      return (id: string): Area | undefined => {
        return state.areas.find((a) => a.meta.id === id);
      };
    },
  },

  actions: {
    async loadAreas(params?: {
      limit?: number;
      offset?: number;
      search?: string;
      filterBy?: string[];
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }): Promise<
      | Area[]
      | {
          items: Area[];
          total: number;
          limit: number;
          offset: number;
          next: number | null;
        }
    > {
      this.loading = true;
      try {
        const response = await areasService.listAreas(params);
        this.areas = Array.isArray(response) ? response : response.items;
        return response;
      } finally {
        this.loading = false;
      }
    },

    async loadAreasPaginated(params?: {
      limit?: number;
      offset?: number;
      search?: string;
      filterBy?: string[];
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }): Promise<{
      items: Area[];
      total: number;
      limit: number;
      offset: number;
      next: number | null;
    }> {
      this.loading = true;
      try {
        const response = await areasService.listAreas(params);
        if (Array.isArray(response)) {
          return {
            items: response,
            total: response.length,
            limit: params?.limit || response.length,
            offset: params?.offset || 0,
            next: null,
          };
        }
        this.areas = response.items;
        return response;
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
      const index = this.areas.findIndex((a) => a.meta.id === id);
      if (index >= 0) {
        this.areas[index] = area;
      }
    },

    async deleteArea(id: string): Promise<void> {
      await areasService.deleteArea(id);
      this.areas = this.areas.filter((a) => a.meta.id !== id);
    },
  },
});
