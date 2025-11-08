import { defineStore } from "pinia";
import type {
  Camper,
  CamperCreationRequest,
  CamperUpdateRequest,
} from "@/generated/api";
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
      if (camper.spec.housingGroupId) {
        await useGroupsStore().addCamperToGroup(
          camper.spec.housingGroupId,
          camper.meta.id,
        );
      }
      return camper;
    },
    async updateCamper(
      camperId: string,
      camperUpdate: CamperUpdateRequest,
    ): Promise<void> {
      const originalFamilyGroupId = this.campers.find(
        (c) => c.meta.id === camperId,
      )?.spec.housingGroupId;
      const camper = await campersService.updateCamper(camperId, camperUpdate);
      this.campers = this.campers.map((c) =>
        c.meta.id === camperId ? camper : c,
      );
      if (originalFamilyGroupId !== camperUpdate.spec.housingGroupId) {
        const prms: Promise<void>[] = [];
        if (originalFamilyGroupId) {
          prms.push(
            useGroupsStore().removeCamperFromGroup(
              originalFamilyGroupId,
              camperId,
            ),
          );
        }
        if (camperUpdate.spec.housingGroupId) {
          prms.push(
            useGroupsStore().addCamperToGroup(
              camperUpdate.spec.housingGroupId,
              camperId,
            ),
          );
        }
        await Promise.all(prms);
      }
    },
    async deleteCamper(camperId: string): Promise<void> {
      const originalFamilyGroupId = this.campers.find(
        (c) => c.meta.id === camperId,
      )?.spec.housingGroupId;
      await campersService.deleteCamper(camperId);
      this.campers = this.campers.filter((c) => c.meta.id !== camperId);
      if (originalFamilyGroupId) {
        await useGroupsStore().removeCamperFromGroup(
          originalFamilyGroupId,
          camperId,
        );
      }
    },
  },
});
