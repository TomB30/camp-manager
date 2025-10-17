import { defineStore } from 'pinia';
import type { CamperGroup, Camper } from '@/types';
import { groupsService } from '@/services';
import { useCampersStore } from './campersStore';

export const useGroupsStore = defineStore('groups', {
  state: () => ({
    camperGroups: [] as CamperGroup[],
    loading: false,
  }),

  getters: {
    getCamperGroupById(state): (id: string) => CamperGroup | undefined {
      return (id: string): CamperGroup | undefined => {
        return state.camperGroups.find(g => g.id === id);
      };
    },

    getCampersInGroup(): (groupId: string) => Camper[] {
      return (groupId: string): Camper[] => {
        const group = this.camperGroups.find(g => g.id === groupId);
        if (!group) return [];
        
        const campersStore = useCampersStore();
        
        // Determine base set of campers to filter
        let baseCampers: Camper[];
        
        if (group.familyGroupIds && group.familyGroupIds.length > 0) {
          // If family groups are selected, only consider campers from those family groups
          baseCampers = campersStore.campers.filter(c => 
            c.familyGroupId && group.familyGroupIds!.includes(c.familyGroupId)
          );
        } else {
          // If no family groups selected, consider all campers
          baseCampers = campersStore.campers;
        }
        
        // Apply filters to the base set of campers
        return baseCampers.filter(camper => {
          // Age filter
          if (group.filters.ageMin !== undefined && camper.age < group.filters.ageMin) return false;
          if (group.filters.ageMax !== undefined && camper.age > group.filters.ageMax) return false;
          
          // Gender filter
          if (group.filters.gender && camper.gender !== group.filters.gender) return false;
          
          // Allergies filter
          if (group.filters.hasAllergies !== undefined) {
            const hasAllergies = camper.allergies && camper.allergies.length > 0;
            if (group.filters.hasAllergies !== hasAllergies) return false;
          }
          
          return true;
        });
      };
    },
  },

  actions: {
    async loadCamperGroups(): Promise<void> {
      this.loading = true;
      try {
        this.camperGroups = await groupsService.getCamperGroups();
      } finally {
        this.loading = false;
      }
    },

    async addCamperGroup(group: CamperGroup): Promise<void> {
      await groupsService.saveCamperGroup(group);
      this.camperGroups.push(group);
    },

    async updateCamperGroup(group: CamperGroup): Promise<void> {
      await groupsService.saveCamperGroup(group);
      const index = this.camperGroups.findIndex(g => g.id === group.id);
      if (index >= 0) {
        this.camperGroups[index] = group;
      }
    },

    async deleteCamperGroup(id: string): Promise<void> {
      await groupsService.deleteCamperGroup(id);
      this.camperGroups = this.camperGroups.filter(g => g.id !== id);
    },
  }
});

