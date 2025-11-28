import { defineStore } from "pinia";
import type {
  Camper,
  CamperCreationRequest,
  CamperUpdateRequest,
} from "@/generated/api";
import { campersService } from "@/services";
import { campersApi } from "@/services/api/campersApi";

export const useCampersStore = defineStore("campers", {
  state: () => ({
    campers: [] as Camper[],
    loading: false,
  }),

  getters: {
    getCamperById(state): (id: string) => Camper | undefined {
      return (id: string): Camper | undefined => {
        return state.campers.find((c) => c.meta.id === id);
      };
    },

    getCampersInHousingGroup(state): (housingGroupId: string) => Camper[] {
      return (housingGroupId: string): Camper[] => {
        return state.campers.filter(
          (c) => c.spec.housingGroupId === housingGroupId,
        );
      };
    },

    getCampersBySession(state): (sessionId: string) => Camper[] {
      return (sessionId: string): Camper[] => {
        return state.campers.filter((c) => c.spec.sessionId === sessionId);
      };
    },
  },

  actions: {
    async loadCampers(): Promise<Camper[]> {
      this.loading = true;
      try {
        this.campers = await campersService.listCampers();
        return this.campers;
      } finally {
        this.loading = false;
      }
    },

    async loadCampersPaginated(params: {
      limit?: number;
      offset?: number;
      search?: string;
      filterBy?: string[];
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }): Promise<{
      items: Camper[];
      total: number;
      limit: number;
      offset: number;
      next: number | null;
    }> {
      this.loading = true;
      try {
        const response = await campersApi.listCampers(params);
        this.campers = response.items;
        return response;
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
      this.campers = this.campers.map((c) =>
        c.meta.id === camperId ? camper : c,
      );
    },
    async deleteCamper(camperId: string): Promise<void> {
      await campersService.deleteCamper(camperId);
      this.campers = this.campers.filter((c) => c.meta.id !== camperId);
    },
  },
});
