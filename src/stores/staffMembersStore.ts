import { defineStore } from "pinia";
import type {
  StaffMember,
  StaffMemberCreationRequest,
  StaffMemberUpdateRequest,
} from "@/generated/api";
import { staffMembersService } from "@/services";

export const useStaffMembersStore = defineStore("staffMembers", {
  state: () => ({
    staffMembers: [] as StaffMember[],
    loading: false,
  }),
  getters: {
    getStaffMemberById(state): (id: string) => StaffMember | undefined {
      return (id: string): StaffMember | undefined => {
        return state.staffMembers.find((m) => m.meta.id === id);
      };
    },

    getStaffMembersByCertification(
      state,
    ): (certificationId: string) => StaffMember[] {
      return (certificationId: string): StaffMember[] => {
        return state.staffMembers.filter((s) =>
          s.spec.certificationIds?.includes(certificationId),
        );
      };
    },

    getStaffMembersByManager(state): (managerId: string) => StaffMember[] {
      return (managerId: string): StaffMember[] => {
        return state.staffMembers.filter((s) => s.spec.managerId === managerId);
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
        (m: StaffMember) => m.meta.id === id,
      );
      if (index >= 0) {
        this.staffMembers[index] = member;
      }
    },

    async deleteStaffMember(id: string): Promise<void> {
      await staffMembersService.deleteStaffMember(id);
      this.staffMembers =
        this.staffMembers?.filter((m: StaffMember) => m.meta.id !== id) || [];
    },
  },
});
