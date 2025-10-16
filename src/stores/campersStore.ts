import { defineStore } from 'pinia';
import type { Camper } from '@/types';
import { campersService } from '@/services';

export const useCampersStore = defineStore('campers', {
  state: () => ({
    campers: [] as Camper[],
    loading: false,
  }),

  getters: {
    getCamperById(state): (id: string) => Camper | undefined {
      return (id: string): Camper | undefined => {
        return state.campers.find(c => c.id === id);
      };
    },

    getCampersInFamilyGroup(state): (familyGroupId: string) => Camper[] {
      return (familyGroupId: string): Camper[] => {
        return state.campers.filter(c => c.familyGroupId === familyGroupId);
      };
    },

    getCampersBySession(state): (sessionId: string) => Camper[] {
      return (sessionId: string): Camper[] => {
        return state.campers.filter(c => c.sessionId === sessionId);
      };
    },
  },

  actions: {
    async loadCampers(): Promise<void> {
      this.loading = true;
      try {
        this.campers = await campersService.getCampers();
      } finally {
        this.loading = false;
      }
    },

    async addCamper(camper: Camper): Promise<void> {
      await campersService.saveCamper(camper);
      this.campers.push(camper);
    },

    async updateCamper(camper: Camper): Promise<void> {
      await campersService.saveCamper(camper);
      const index = this.campers.findIndex(c => c.id === camper.id);
      if (index >= 0) {
        this.campers[index] = camper;
      }
    },

    async deleteCamper(id: string): Promise<void> {
      await campersService.deleteCamper(id);
      this.campers = this.campers.filter(c => c.id !== id);
    },
  }
});

