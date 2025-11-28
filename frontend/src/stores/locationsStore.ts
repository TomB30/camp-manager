import { defineStore } from "pinia";
import type {
  Location,
  LocationCreationRequest,
  LocationUpdateRequest,
} from "@/generated/api";
import { locationsService } from "@/services";

export const useLocationsStore = defineStore("locations", {
  state: () => ({
    locations: [] as Location[],
    loading: false,
  }),

  getters: {
    getLocationById(state): (id: string) => Location | undefined {
      return (id: string): Location | undefined => {
        return state.locations.find((l) => l.meta.id === id);
      };
    },

    getLocationsByArea(state): (areaId: string) => Location[] {
      return (areaId: string): Location[] => {
        return state.locations.filter((l) => l.spec.areaId === areaId);
      };
    },
  },

  actions: {
    async loadLocations(params?: {
      limit?: number;
      offset?: number;
      search?: string;
      filterBy?: string[];
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }): Promise<
      Location[] | { items: Location[]; total: number; limit: number; offset: number; next: number | null }
    > {
      this.loading = true;
      try {
        const response = await locationsService.listLocations(params);
        this.locations = Array.isArray(response) ? response : response.items;
        return response;
      } finally {
        this.loading = false;
      }
    },

    async loadLocationsPaginated(params?: {
      limit?: number;
      offset?: number;
      search?: string;
      filterBy?: string[];
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }): Promise<{
      items: Location[];
      total: number;
      limit: number;
      offset: number;
      next: number | null;
    }> {
      this.loading = true;
      try {
        const response = await locationsService.listLocations(params);
        if (Array.isArray(response)) {
          return {
            items: response,
            total: response.length,
            limit: params?.limit || response.length,
            offset: params?.offset || 0,
            next: null,
          };
        }
        this.locations = response.items;
        return response;
      } finally {
        this.loading = false;
      }
    },

    async createLocation(
      locationRequest: LocationCreationRequest,
    ): Promise<Location> {
      const location = await locationsService.createLocation(locationRequest);
      this.locations.push(location);
      return location;
    },

    async updateLocation(
      id: string,
      locationUpdate: LocationUpdateRequest,
    ): Promise<void> {
      const location = await locationsService.updateLocation(
        id,
        locationUpdate,
      );
      const index = this.locations.findIndex((r) => r.meta.id === id);
      if (index >= 0) {
        this.locations[index] = location;
      }
    },

    async deleteLocation(id: string): Promise<void> {
      await locationsService.deleteLocation(id);
      this.locations = this.locations.filter((l) => l.meta.id !== id);
    },
  },
});
