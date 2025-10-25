import { defineStore } from "pinia";
import type {
  GroupStaffFilters,
  StaffMember,
  StaffMemberCreationRequest,
  StaffMemberUpdateRequest,
} from "@/types";
import { staffMembersService } from "@/services";

export const useStaffMembersStore = defineStore("staffMembers", {
  state: () => ({
    staffMembers: [] as StaffMember[],
    loading: false,
  }),
  getters: {
    getStaffMemberById(state): (id: string) => StaffMember | undefined {
      return (id: string): StaffMember | undefined => {
        return state.staffMembers.find((m) => m.id === id);
      };
    },

    getStaffMembersByCertification(
      state,
    ): (certificationId: string) => StaffMember[] {
      return (certificationId: string): StaffMember[] => {
        return state.staffMembers.filter((s) =>
          s.certificationIds?.includes(certificationId),
        );
      };
    },

    getStaffMembersByManager(state): (managerId: string) => StaffMember[] {
      return (managerId: string): StaffMember[] => {
        return state.staffMembers.filter((s) => s.managerId === managerId);
      };
    },

    getStaffMembersByFilters(
      state,
    ): (filters: GroupStaffFilters) => StaffMember[] {
      return (filters: GroupStaffFilters | undefined): StaffMember[] => {
        if (!filters) return [];
        return state.staffMembers.filter((s) => {
          if (filters.roles && filters.roles.length > 0) {
            if (!filters.roles.includes(s.roleId)) return false;
          }
          if (filters.certificationIds && filters.certificationIds.length > 0) {
            if (!s.certificationIds || s.certificationIds?.length === 0)
              return false;
          }
          return true;
        });
      };
    },
  },
  actions: {
    async loadStaffMembers(): Promise<void> {
      this.loading = true;
      try {
        this.staffMembers = await staffMembersService.listStaffMembers();
      } finally {
        this.loading = false;
      }
    },

    async createStaffMember(
      memberRequest: StaffMemberCreationRequest,
    ): Promise<StaffMember> {
      const member = await staffMembersService.createStaffMember(memberRequest);
      this.staffMembers = this.staffMembers
        ? [...this.staffMembers, member]
        : [member];
      return member;
    },

    async updateStaffMember(
      id: string,
      memberUpdate: StaffMemberUpdateRequest,
    ): Promise<void> {
      const member = await staffMembersService.updateStaffMember(
        id,
        memberUpdate,
      );
      const index = this.staffMembers.findIndex(
        (m: StaffMember) => m.id === id,
      );
      if (index >= 0) {
        this.staffMembers[index] = member;
      }
    },

    async deleteStaffMember(id: string): Promise<void> {
      await staffMembersService.deleteStaffMember(id);
      this.staffMembers =
        this.staffMembers?.filter((m: StaffMember) => m.id !== id) || [];
    },
  },
});
