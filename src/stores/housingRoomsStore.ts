import { defineStore } from "pinia";
import type {
  HousingRoom,
  HousingRoomCreationRequest,
  HousingRoomUpdateRequest,
} from "@/types";
import { housingRoomsService } from "@/services";

export const useHousingRoomsStore = defineStore("housingRooms", {
  state: () => ({
    housingRooms: [] as HousingRoom[],
    loading: false,
  }),

  getters: {
    getHousingRoomById(state): (id: string) => HousingRoom | undefined {
      return (id: string): HousingRoom | undefined => {
        return state.housingRooms.find((h) => h.meta.id === id);
      };
    },

    getHousingRoomsByArea(state): (areaId: string) => HousingRoom[] {
      return (areaId: string): HousingRoom[] => {
        return state.housingRooms.filter((r) => r.spec.areaId === areaId);
      };
    },
  },

  actions: {
    async loadHousingRooms(): Promise<void> {
      this.loading = true;
      try {
        this.housingRooms = await housingRoomsService.listHousingRooms();
      } finally {
        this.loading = false;
      }
    },

    async createHousingRoom(
      housingRoomRequest: HousingRoomCreationRequest,
    ): Promise<HousingRoom> {
      const housingRoom =
        await housingRoomsService.createHousingRoom(housingRoomRequest);
      this.housingRooms.push(housingRoom);
      return housingRoom;
    },

    async updateHousingRoom(
      housingRoomId: string,
      housingRoomUpdate: HousingRoomUpdateRequest,
    ): Promise<void> {
      const housingRoom = await housingRoomsService.updateHousingRoom(
        housingRoomId,
        housingRoomUpdate,
      );
      const index = this.housingRooms.findIndex((r) => r.meta.id === housingRoomId);
      if (index >= 0) {
        this.housingRooms[index] = housingRoom;
      }
    },

    async deleteHousingRoom(housingRoomId: string): Promise<void> {
      await housingRoomsService.deleteHousingRoom(housingRoomId);
      this.housingRooms = this.housingRooms.filter(
        (r) => r.meta.id !== housingRoomId,
      );
    },
  },
});
