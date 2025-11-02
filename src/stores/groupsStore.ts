import { defineStore } from "pinia";
import type {
  Group,
  Camper,
  StaffMember,
  GroupCreationRequest,
  GroupUpdateRequest,
} from "@/generated/api";
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
        return state.groups.find((g) => g.meta.id === id);
      };
    },

    /**
     * Get all campers in a group, either by filter or by explicit IDs
     */
    getCampersInGroup(): (groupId: string) => Camper[] {
      return (groupId: string): Camper[] => {
        const group = this.groups.find((g) => g.meta.id === groupId);
        if (!group) return [];

        const campersStore = useCampersStore();

        // If group has nested groups, recursively collect campers from child groups
        if (group.spec.groupIds && group.spec.groupIds.length > 0) {
          const childCampers = new Set<Camper>();
          for (const childGroupId of group.spec.groupIds) {
            const childGroupCampers = this.getCampersInGroup(childGroupId);
            childGroupCampers.forEach((c) => childCampers.add(c));
          }
          return Array.from(childCampers);
        }

        // If explicit camper IDs are specified, use those
        if (group.spec.camperIds && group.spec.camperIds.length > 0) {
          return group.spec.camperIds
            .map((id) => campersStore.getCamperById(id))
            .filter((c): c is Camper => c !== undefined);
        }

        return [];
      };
    },

    /**
     * Get all staff in a group, either by filter or by explicit IDs
     */
    getStaffInGroup(): (groupId: string) => StaffMember[] {
      return (groupId: string): StaffMember[] => {
        const group = this.groups.find((g) => g.meta.id === groupId);
        if (!group) return [];

        const staffStore = useStaffMembersStore();

        // If group has nested groups, recursively collect staff from child groups
        if (group.spec.groupIds && group.spec.groupIds.length > 0) {
          const childStaff = new Set<StaffMember>();
          for (const childGroupId of group.spec.groupIds) {
            const childGroupStaff = this.getStaffInGroup(childGroupId);
            childGroupStaff.forEach((s) => childStaff.add(s));
          }
          return Array.from(childStaff);
        }

        // If explicit staff IDs are specified, use those
        if (group.spec.staffIds && group.spec.staffIds.length > 0) {
          return group.spec.staffIds
            .map((id) => staffStore.getStaffMemberById(id))
            .filter((s): s is StaffMember => s !== undefined);
        }

        return [];
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
            const hasHousing = !!group.spec.housingRoomId;
            if (hasHousing !== options.hasHousing) return false;
          }

          if (options.hasSession !== undefined) {
            const hasSession = !!group.spec.sessionId;
            if (hasSession !== options.hasSession) return false;
          }

          if (options.isNested !== undefined) {
            const isNested = !!(
              group.spec.groupIds && group.spec.groupIds.length > 0
            );
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

    async updateGroup(
      id: string,
      groupUpdate: GroupUpdateRequest,
    ): Promise<void> {
      const group = await groupsService.updateGroup(id, groupUpdate);
      const index = this.groups.findIndex((g) => g.meta.id === id);
      if (index >= 0) {
        this.groups[index] = group;
      }
    },

    async deleteGroup(id: string): Promise<void> {
      await groupsService.deleteGroup(id);
      this.groups = this.groups.filter((g) => g.meta.id !== id);
    },

    /**
     * Validate that a group doesn't violate business rules
     */
    validateGroup(group: Group): { valid: boolean; errors: string[] } {
      const errors: string[] = [];

      // Cannot use both groupIds (nested) and camperIds/staffIds (manual)
      if (
        group.spec.groupIds &&
        group.spec.groupIds.length > 0 &&
        ((group.spec.camperIds && group.spec.camperIds.length > 0) ||
          (group.spec.staffIds && group.spec.staffIds.length > 0))
      ) {
        errors.push(
          "Cannot use both nested groups and manual camper/staff selection",
        );
      }

      // If has housing room, should have a session
      if (group.spec.housingRoomId && !group.spec.sessionId) {
        errors.push("Groups with housing rooms should have a session assigned");
      }

      // Check for circular group references
      if (group.spec.groupIds && group.spec.groupIds.includes(group.meta.id)) {
        errors.push("Group cannot contain itself");
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
    async addCamperToGroup(groupId: string, camperId: string): Promise<void> {
      const group = this.groups.find((g) => g.meta.id === groupId);
      if (!group) return;

      const groupToUpdate: GroupUpdateRequest = {
        ...group,
        spec: {
          ...group.spec,
          camperIds: [...(group.spec.camperIds || []), camperId],
        },
      };
      const updatedGroup = await groupsService.updateGroup(
        groupId,
        groupToUpdate,
      );
      this.groups = this.groups.map((g) =>
        g.meta.id === groupId ? updatedGroup : g,
      );
    },
    async removeCamperFromGroup(
      groupId: string,
      camperId: string,
    ): Promise<void> {
      const group = this.groups.find((g) => g.meta.id === groupId);
      if (!group) return;

      const groupToUpdate: GroupUpdateRequest = {
        ...group,
        spec: {
          ...group.spec,
          camperIds:
            group.spec.camperIds?.filter((id) => id !== camperId) || [],
        },
      };
      const updatedGroup = await groupsService.updateGroup(
        groupId,
        groupToUpdate,
      );
      this.groups = this.groups.map((g) =>
        g.meta.id === groupId ? updatedGroup : g,
      );
    },
  },
});
