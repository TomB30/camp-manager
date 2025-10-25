import { defineStore } from "pinia";
import type { Group, Camper, StaffMember, GroupCreationRequest, GroupUpdateRequest } from "@/types";
import { groupsService } from "@/services";
import { useCampersStore } from "./campersStore";
import { useStaffMembersStore } from "./staffMembersStore";

export const useGroupsStore = defineStore("groups", {
  state: () => ({
    groups: [] as Group[],
    loading: false,
  }),

  getters: {
    getGroupById(state): (id: string) => Group | undefined {
      return (id: string): Group | undefined => {
        return state.groups.find((g) => g.id === id);
      };
    },

    /**
     * Get all campers in a group, either by filter or by explicit IDs
     */
    getCampersInGroup(): (groupId: string) => Camper[] {
      return (groupId: string): Camper[] => {
        const group = this.groups.find((g) => g.id === groupId);
        if (!group) return [];

        const campersStore = useCampersStore();

        // If group has nested groups, recursively collect campers from child groups
        if (group.groupIds && group.groupIds.length > 0) {
          const childCampers = new Set<Camper>();
          for (const childGroupId of group.groupIds) {
            const childGroupCampers = this.getCampersInGroup(childGroupId);
            childGroupCampers.forEach((c) => childCampers.add(c));
          }
          return Array.from(childCampers);
        }

        // If explicit camper IDs are specified, use those
        if (group.camperIds && group.camperIds.length > 0) {
          return group.camperIds
            .map((id) => campersStore.getCamperById(id))
            .filter((c): c is Camper => c !== undefined);
        }

        // Otherwise, use filters to determine campers
        if (group.camperFilters) {
          return this.filterCampers(group.camperFilters);
        }

        return [];
      };
    },

    /**
     * Get all staff in a group, either by filter or by explicit IDs
     */
    getStaffInGroup(): (groupId: string) => StaffMember[] {
      return (groupId: string): StaffMember[] => {
        const group = this.groups.find((g) => g.id === groupId);
        if (!group) return [];

        const staffStore = useStaffMembersStore();

        // If group has nested groups, recursively collect staff from child groups
        if (group.groupIds && group.groupIds.length > 0) {
          const childStaff = new Set<StaffMember>();
          for (const childGroupId of group.groupIds) {
            const childGroupStaff = this.getStaffInGroup(childGroupId);
            childGroupStaff.forEach((s) => childStaff.add(s));
          }
          return Array.from(childStaff);
        }

        // If explicit staff IDs are specified, use those
        if (group.staffIds && group.staffIds.length > 0) {
          return group.staffIds
            .map((id) => staffStore.getStaffMemberById(id))
            .filter((s): s is StaffMember => s !== undefined);
        }

        // Otherwise, use filters to determine staff
        if (group.staffFilters) {
          return this.filterStaff(group.staffFilters);
        }

        return [];
      };
    },

    /**
     * Filter campers based on camper filter criteria
     */
    filterCampers(): (
      filters: NonNullable<Group["camperFilters"]>,
    ) => Camper[] {
      return (filters): Camper[] => {
        const campersStore = useCampersStore();

        // Determine base set of campers to filter
        let baseCampers: Camper[];

        if (filters.familyGroupIds && filters.familyGroupIds.length > 0) {
          // If family groups are selected, only consider campers from those family groups
          baseCampers = campersStore.campers.filter(
            (c) =>
              c.familyGroupId &&
              filters.familyGroupIds!.includes(c.familyGroupId),
          );
        } else if (filters.sessionId) {
          // If session is specified, only consider campers from that session
          baseCampers = campersStore.campers.filter(
            (c) => c.sessionId === filters.sessionId,
          );
        } else {
          // Otherwise, consider all campers
          baseCampers = campersStore.campers;
        }

        // Apply filters to the base set of campers
        return baseCampers.filter((camper) => {
          // Age filter
          if (filters.ageMin !== undefined && camper.age < filters.ageMin)
            return false;
          if (filters.ageMax !== undefined && camper.age > filters.ageMax)
            return false;

          // Gender filter
          if (filters.gender && camper.gender !== filters.gender) return false;

          // Allergies filter
          if (filters.hasAllergies !== undefined) {
            const hasAllergies =
              camper.allergies && camper.allergies.length > 0;
            if (filters.hasAllergies !== hasAllergies) return false;
          }

          return true;
        });
      };
    },

    /**
     * Filter staff based on staff filter criteria
     */
    filterStaff(): (
      filters: NonNullable<Group["staffFilters"]>,
    ) => StaffMember[] {
      return (filters): StaffMember[] => {
        const staffStore = useStaffMembersStore();
        let baseStaff = staffStore.staffMembers;

        return baseStaff.filter((staff) => {
          // Role filter
          if (filters.roles && filters.roles.length > 0) {
            if (!filters.roles.includes(staff.roleId)) return false;
          }

          // Certification filter
          if (filters.certificationIds && filters.certificationIds.length > 0) {
            if (!staff.certificationIds || staff.certificationIds.length === 0)
              return false;
            // Staff must have all required certifications
            const hasAllCerts = filters.certificationIds.every((certId) =>
              staff.certificationIds!.includes(certId),
            );
            if (!hasAllCerts) return false;
          }

          return true;
        });
      };
    },

    /**
     * Check if a group is using filters vs explicit IDs
     */
    isFilterBasedGroup(): (groupId: string) => {
      campers: boolean;
      staff: boolean;
    } {
      return (groupId: string) => {
        const group = this.groups.find((g) => g.id === groupId);
        if (!group) return { campers: false, staff: false };

        return {
          campers: !!(group.camperFilters && !group.camperIds),
          staff: !!(group.staffFilters && !group.staffIds),
        };
      };
    },

    /**
     * Get groups by type (has housing room, has filters, etc.)
     */
    getGroupsByType(): (options: {
      hasHousing?: boolean;
      hasSession?: boolean;
      isNested?: boolean;
    }) => Group[] {
      return (options) => {
        return this.groups.filter((group) => {
          if (options.hasHousing !== undefined) {
            const hasHousing = !!group.housingRoomId;
            if (hasHousing !== options.hasHousing) return false;
          }

          if (options.hasSession !== undefined) {
            const hasSession = !!group.sessionId;
            if (hasSession !== options.hasSession) return false;
          }

          if (options.isNested !== undefined) {
            const isNested = !!(group.groupIds && group.groupIds.length > 0);
            if (isNested !== options.isNested) return false;
          }

          return true;
        });
      };
    },
  },

  actions: {
    async loadGroups(): Promise<void> {
      this.loading = true;
      try {
        this.groups = await groupsService.listGroups();
      } finally {
        this.loading = false;
      }
    },

    async addGroup(groupRequest: GroupCreationRequest): Promise<Group> {
      const group = await groupsService.createGroup(groupRequest);
      this.groups.push(group);
      return group;
    },

    async updateGroup(id: string, groupUpdate: GroupUpdateRequest): Promise<void> {
      const group = await groupsService.updateGroup(id, groupUpdate);
      const index = this.groups.findIndex((g) => g.id === id);
      if (index >= 0) {
        this.groups[index] = group;
      }
    },

    async deleteGroup(id: string): Promise<void> {
      await groupsService.deleteGroup(id);
      this.groups = this.groups.filter((g) => g.id !== id);
    },

    /**
     * Validate that a group doesn't violate business rules
     */
    validateGroup(group: Group): { valid: boolean; errors: string[] } {
      const errors: string[] = [];

      // Cannot use both camperFilters and camperIds
      if (
        group.camperFilters &&
        group.camperIds &&
        group.camperIds.length > 0
      ) {
        errors.push("Cannot use both camper filters and explicit camper IDs");
      }

      // Cannot use both staffFilters and staffIds
      if (group.staffFilters && group.staffIds && group.staffIds.length > 0) {
        errors.push("Cannot use both staff filters and explicit staff IDs");
      }

      // If has housing room, should have a session
      if (group.housingRoomId && !group.sessionId) {
        errors.push("Groups with housing rooms should have a session assigned");
      }

      // Check for circular group references
      if (group.groupIds && group.groupIds.includes(group.id)) {
        errors.push("Group cannot contain itself");
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
  },
});
