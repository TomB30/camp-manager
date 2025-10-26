import { defineStore } from "pinia";
import type {
  Camper,
  CamperCreationRequest,
  CamperUpdateRequest,
} from "@/types";
import { campersService } from "@/services";
import { useGroupsStore } from "./groupsStore";

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
      if (camper.familyGroupId) {
        await useGroupsStore().addCamperToGroup(
          camper.familyGroupId,
          camper.id,
        );
      }
      return camper;
    },
    async updateCamper(
      camperId: string,
      camperUpdate: CamperUpdateRequest,
    ): Promise<void> {
      const originalFamilyGroupId = this.campers.find((c) => c.id === camperId)?.familyGroupId;
      const camper = await campersService.updateCamper(camperId, camperUpdate);
      this.campers = this.campers.map((c) => c.id === camperId ? camper : c);
      if (originalFamilyGroupId !== camperUpdate.familyGroupId) {
        const prms: Promise<void>[] = []; 
        if (originalFamilyGroupId) {
          prms.push(useGroupsStore().removeCamperFromGroup(originalFamilyGroupId, camperId));
        }
        if (camperUpdate.familyGroupId) {
          prms.push(useGroupsStore().addCamperToGroup(camperUpdate.familyGroupId, camperId));
        }
        await Promise.all(prms);
      }
    },
    async deleteCamper(camperId: string): Promise<void> {
      const originalFamilyGroupId = this.campers.find((c) => c.id === camperId)?.familyGroupId;
      await campersService.deleteCamper(camperId);
      this.campers = this.campers.filter((c) => c.id !== camperId);
      if (originalFamilyGroupId) {
        await useGroupsStore().removeCamperFromGroup(originalFamilyGroupId, camperId);
      }
    },
  },
});
