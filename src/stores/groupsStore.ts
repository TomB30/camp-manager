import { defineStore } from 'pinia';
import type { CamperGroup, Camper } from '@/types';
import { groupsService, conflictDetector, eventsService } from '@/services';
import { useCampersStore } from './campersStore';
import { useEventsStore } from './eventsStore';

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

    async enrollCamperGroup(eventId: string, groupId: string): Promise<{ enrolled: number; errors: string[]; total: number; message: string }> {
      const eventsStore = useEventsStore();
      const event = eventsStore.events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');

      const group = this.camperGroups.find(g => g.id === groupId);
      if (!group) throw new Error('Group not found');

      // Use the getter to get all campers in the group (includes family groups and filters)
      const groupCampers = this.getCampersInGroup(groupId);
      
      if (groupCampers.length === 0) {
        throw new Error('No campers match this group criteria');
      }

      // Initialize enrolledCamperIds if needed
      if (!event.enrolledCamperIds) {
        event.enrolledCamperIds = [];
      }

      // Filter out already enrolled campers
      const campersToEnroll = groupCampers.filter(
        camper => !event.enrolledCamperIds?.includes(camper.id)
      );

      if (campersToEnroll.length === 0) {
        return {
          enrolled: 0,
          errors: [],
          total: groupCampers.length,
          message: 'All campers from this group are already enrolled in this event.'
        };
      }

      // Process all campers in parallel using Promise.allSettled
      const enrollmentPromises = campersToEnroll.map(async (camper) => {
        const validation = conflictDetector.canEnrollCamper(event, camper.id, eventsStore.events);
        
        if (!validation.canEnroll) {
          return {
            status: 'rejected' as const,
            camper,
            reason: validation.reason
          };
        }

        try {
          await eventsService.enrollCamper(eventId, camper.id);
          return {
            status: 'fulfilled' as const,
            camper
          };
        } catch (error: any) {
          return {
            status: 'rejected' as const,
            camper,
            reason: error.message
          };
        }
      });

      // Wait for all enrollments to complete
      const results = await Promise.all(enrollmentPromises);

      // Process results
      const errors: string[] = [];
      const enrolled: string[] = [];
      const enrolledIds: string[] = [];

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          enrolled.push(`${result.camper.firstName} ${result.camper.lastName}`);
          enrolledIds.push(result.camper.id);
        } else {
          errors.push(`${result.camper.firstName} ${result.camper.lastName}: ${result.reason}`);
        }
      });

      // Update event with all successfully enrolled campers at once
      event.enrolledCamperIds.push(...enrolledIds);

      // Return summary of the operation
      return {
        enrolled: enrolled.length,
        errors,
        total: groupCampers.length,
        message: errors.length > 0 
          ? `Enrolled ${enrolled.length} of ${groupCampers.length} campers. ${errors.length} conflicts occurred.`
          : `Successfully enrolled all ${enrolled.length} campers from group "${group.name}".`
      };
    },
  }
});

