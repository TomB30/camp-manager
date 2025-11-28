import { defineStore } from "pinia";
import type {
  StaffMember,
  StaffMemberCreationRequest,
  StaffMemberUpdateRequest,
} from "@/generated/api";
import { staffMembersService } from "@/services";
import { staffMembersApi } from "@/services/api/staffMembersApi";

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
  },
  actions: {
    async loadStaffMembers(): Promise<StaffMember[]> {
      this.loading = true;
      try {
        this.staffMembers = await staffMembersService.listStaffMembers();
        return this.staffMembers;
      } finally {
        this.loading = false;
      }
    },
    
    async loadStaffMembersPaginated(params: {
      limit?: number;
      offset?: number;
      search?: string;
      filterBy?: string[];
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }): Promise<{ items: StaffMember[]; total: number; limit: number; offset: number; next: number | null }> {
      this.loading = true;
      try {
        const response = await staffMembersApi.listStaffMembers(params);
        this.staffMembers = response.items;
        return response;
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
