/**
 * Unified Staff Members Service
 * Routes to either backend API or local storage based on configuration
 */
import { isBackendEnabled } from "@/config/dataSource";
import { staffMembersStorage } from "./staffMembersStorage";
import { staffMembersApi } from "./api/staffMembersApi";
import type {
  StaffMember,
  StaffMemberCreationRequest,
  StaffMemberUpdateRequest,
} from "@/generated/api";

const impl = () => (isBackendEnabled() ? staffMembersApi : staffMembersStorage);

export const staffMembersService = {
  listStaffMembers: async (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    filterBy?: string[];
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<StaffMember[]> => {
    const result = await impl().listStaffMembers(params as any);
    return Array.isArray(result) ? result : result.items;
  },
  createStaffMember: (data: StaffMemberCreationRequest): Promise<StaffMember> =>
    impl().createStaffMember(data),
  updateStaffMember: (
    id: string,
    data: StaffMemberUpdateRequest,
  ): Promise<StaffMember> => impl().updateStaffMember(id, data),
  deleteStaffMember: (id: string): Promise<void> =>
    impl().deleteStaffMember(id),
  getStaffMemberById: (id: string): Promise<StaffMember | null> =>
    impl().getStaffMemberById(id),
  getStaffMembersByCertification: (
    certificationId: string,
  ): Promise<StaffMember[]> =>
    impl().getStaffMembersByCertification(certificationId),
};
