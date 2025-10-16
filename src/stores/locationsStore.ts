import { defineStore } from 'pinia';
import type { Location } from '@/types';
import { locationsService } from '@/services';

export const useLocationsStore = defineStore('locations', {
  state: () => ({
    locations: [] as Location[],
    loading: false,
  }),

  getters: {
    getLocationById(state): (id: string) => Location | undefined {
      return (id: string): Location | undefined => {
        return state.locations.find(l => l.id === id);
      };
    },

    getLocationsByArea(state): (areaId: string) => Location[] {
      return (areaId: string): Location[] => {
        return state.locations.filter(l => l.areaId === areaId);
      };
    },

    getLocationsByType(state): (type: Location['type']) => Location[] {
      return (type: Location['type']): Location[] => {
        return state.locations.filter(l => l.type === type);
      };
    },
  },

  actions: {
    async loadLocations(): Promise<void> {
      this.loading = true;
      try {
        this.locations = await locationsService.getLocations();
      } finally {
        this.loading = false;
      }
    },

    async addLocation(location: Location): Promise<void> {
      await locationsService.saveLocation(location);
      this.locations.push(location);
    },

    async updateLocation(location: Location): Promise<void> {
      await locationsService.saveLocation(location);
      const index = this.locations.findIndex(r => r.id === location.id);
      if (index >= 0) {
        this.locations[index] = location;
      }
    },

    async deleteLocation(id: string): Promise<void> {
      await locationsService.deleteLocation(id);
      this.locations = this.locations.filter(l => l.id !== id);
    },
  }
});

