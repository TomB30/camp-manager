import { defineStore } from "pinia";
import type {
  Camper,
  CamperCreationRequest,
  CamperUpdateRequest,
} from "@/types";
import { campersService } from "@/services";

export const useCampersStore = defineStore("campers", {
  state: () => ({
    campers: [] as Camper[],
    loading: false,
  }),

  getters: {
    getCamperById(state): (id: string) => Camper | undefined {
      return (id: string): Camper | undefined => {
        return state.campers.find((c) => c.id === id);
      };
    },

    getCampersInFamilyGroup(state): (familyGroupId: string) => Camper[] {
      return (familyGroupId: string): Camper[] => {
        return state.campers.filter((c) => c.familyGroupId === familyGroupId);
      };
    },

    getCampersBySession(state): (sessionId: string) => Camper[] {
      return (sessionId: string): Camper[] => {
        return state.campers.filter((c) => c.sessionId === sessionId);
      };
    },
  },

  actions: {
    async loadCampers(): Promise<void> {
      this.loading = true;
      try {
        this.campers = await campersService.listCampers();
      } finally {
        this.loading = false;
      }
    },
    async createCamper(camperRequest: CamperCreationRequest): Promise<Camper> {
      const camper = await campersService.createCamper(camperRequest);
      this.campers.push(camper);
      return camper;
    },
    async updateCamper(
      camperId: string,
      camperUpdate: CamperUpdateRequest,
    ): Promise<void> {
      const camper = await campersService.updateCamper(camperId, camperUpdate);
      const index = this.campers.findIndex((c) => c.id === camperId);
      if (index >= 0) {
        this.campers[index] = camper;
      }
    },
    async deleteCamper(camperId: string): Promise<void> {
      await campersService.deleteCamper(camperId);
      this.campers = this.campers.filter((c) => c.id !== camperId);
    },
  },
});
