import { defineStore } from 'pinia';
import type { FamilyGroup, Camper } from '@/types';
import { familyGroupsService } from '@/services';
import { useCampersStore } from './campersStore';

export const useFamilyGroupsStore = defineStore('familyGroups', {
  state: () => ({
    familyGroups: [] as FamilyGroup[],
    loading: false,
  }),

  getters: {
    getFamilyGroupById(state): (id: string) => FamilyGroup | undefined {
      return (id: string): FamilyGroup | undefined => {
        return state.familyGroups.find(g => g.id === id);
      };
    },

    getCampersInFamilyGroup(): (familyGroupId: string) => Camper[] {
      return (familyGroupId: string): Camper[] => {
        const campersStore = useCampersStore();
        return campersStore.campers.filter(c => c.familyGroupId === familyGroupId);
      };
    },

    getFamilyGroupsInRoom(state): (housingRoomId: string) => FamilyGroup[] {
      return (housingRoomId: string): FamilyGroup[] => {
        return state.familyGroups.filter(g => g.housingRoomId === housingRoomId);
      };
    },

    getFamilyGroupsBySession(state): (sessionId: string) => FamilyGroup[] {
      return (sessionId: string): FamilyGroup[] => {
        return state.familyGroups.filter(g => g.sessionId === sessionId);
      };
    },
  },

  actions: {
    async loadFamilyGroups(): Promise<void> {
      this.loading = true;
      try {
        this.familyGroups = await familyGroupsService.getFamilyGroups();
      } finally {
        this.loading = false;
      }
    },

    async addFamilyGroup(group: FamilyGroup): Promise<void> {
      await familyGroupsService.saveFamilyGroup(group);
      this.familyGroups.push(group);
    },

    async updateFamilyGroup(group: FamilyGroup): Promise<void> {
      await familyGroupsService.saveFamilyGroup(group);
      const index = this.familyGroups.findIndex(g => g.id === group.id);
      if (index >= 0) {
        this.familyGroups[index] = group;
      }
    },

    async deleteFamilyGroup(id: string): Promise<void> {
      await familyGroupsService.deleteFamilyGroup(id);
      this.familyGroups = this.familyGroups.filter(g => g.id !== id);
    },
  }
});

