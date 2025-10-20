import { defineStore } from "pinia";
import type { HousingRoom } from "@/types";
import { housingRoomsService } from "@/services";

export const useHousingRoomsStore = defineStore("housingRooms", {
  state: () => ({
    housingRooms: [] as HousingRoom[],
    loading: false,
  }),

  getters: {
    getHousingRoomById(state): (id: string) => HousingRoom | undefined {
      return (id: string): HousingRoom | undefined => {
        return state.housingRooms.find((h) => h.id === id);
      };
    },

    getHousingRoomsByArea(state): (areaId: string) => HousingRoom[] {
      return (areaId: string): HousingRoom[] => {
        return state.housingRooms.filter((r) => r.areaId === areaId);
      };
    },
  },

  actions: {
    async loadHousingRooms(): Promise<void> {
      this.loading = true;
      try {
        this.housingRooms = await housingRoomsService.getHousingRooms();
      } finally {
        this.loading = false;
      }
    },

    async addHousingRoom(housingRoom: HousingRoom): Promise<void> {
      await housingRoomsService.saveHousingRoom(housingRoom);
      this.housingRooms.push(housingRoom);
    },

    async updateHousingRoom(housingRoom: HousingRoom): Promise<void> {
      await housingRoomsService.saveHousingRoom(housingRoom);
      const index = this.housingRooms.findIndex((r) => r.id === housingRoom.id);
      if (index >= 0) {
        this.housingRooms[index] = housingRoom;
      }
    },

    async deleteHousingRoom(id: string): Promise<void> {
      await housingRoomsService.deleteHousingRoom(id);
      this.housingRooms = this.housingRooms.filter((r) => r.id !== id);
    },
  },
});
