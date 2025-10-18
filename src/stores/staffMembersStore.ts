import { defineStore } from "pinia";
import type { StaffFilter, StaffMember } from "@/types";
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
      state
    ): (certificationId: string) => StaffMember[] {
      return (certificationId: string): StaffMember[] => {
        return state.staffMembers.filter((s) =>
          s.certificationIds?.includes(certificationId)
        );
      };
    },

    getStaffMembersByManager(state): (managerId: string) => StaffMember[] {
      return (managerId: string): StaffMember[] => {
        return state.staffMembers.filter((s) => s.managerId === managerId);
      };
    },

    getStaffMembersByFilters(state): (filters: StaffFilter) => StaffMember[] {
      return (filters: StaffFilter): StaffMember[] => {
        return state.staffMembers.filter((s) => {
          if (filters.roles && filters.roles.length > 0) {
            if (!filters.roles.includes(s.role)) return false;
          }
          if (filters.certificationIds && filters.certificationIds.length > 0) {
            if (!s.certificationIds || s.certificationIds.length === 0)
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
        this.staffMembers = await staffMembersService.getStaffMembers();
      } finally {
        this.loading = false;
      }
    },

    async addStaffMember(member: StaffMember): Promise<void> {
      await staffMembersService.saveStaffMember(member);
      this.staffMembers.push(member);
    },

    async updateStaffMember(member: StaffMember): Promise<void> {
      await staffMembersService.saveStaffMember(member);
      const index = this.staffMembers.findIndex((m) => m.id === member.id);
      if (index >= 0) {
        this.staffMembers[index] = member;
      }
    },

    async deleteStaffMember(id: string): Promise<void> {
      await staffMembersService.deleteStaffMember(id);
      this.staffMembers = this.staffMembers.filter((m) => m.id !== id);
    },
  },
});
