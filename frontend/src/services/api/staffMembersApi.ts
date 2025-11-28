/**
 * Backend API implementation for Staff Members
 */
import * as sdk from "@/generated/api/sdk.gen";
import type {
  StaffMember,
  StaffMemberCreationRequest,
  StaffMemberUpdateRequest,
} from "@/generated/api";
import { apiClient } from "@/config/api";
import { getApiCampId } from "@/utils/tenantContext";

export const staffMembersApi = {
  listStaffMembers,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  getStaffMemberById,
  getStaffMembersByCertification,
};

async function listStaffMembers(params?: {
  limit?: number;
  offset?: number;
  search?: string;
  filterBy?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{
  items: StaffMember[];
  total: number;
  limit: number;
  offset: number;
  next: number | null;
}> {
  const response = await sdk.listStaffMembers({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    query: params
      ? {
          limit: params.limit,
          offset: params.offset,
          search: params.search,
          filterBy: params.filterBy,
          sortBy: params.sortBy as any,
          sortOrder: params.sortOrder,
        }
      : undefined,
  });

  if (response.error) {
    throw new Error("Failed to fetch staff members");
  }

  return {
    items: response.data?.items || [],
    total: response.data?.total || 0,
    limit: response.data?.limit || 50,
    offset: response.data?.offset || 0,
    next: response.data?.next ?? null,
  };
}

async function createStaffMember(
  member: StaffMemberCreationRequest,
): Promise<StaffMember> {
  const response = await sdk.createStaffMember({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    body: member,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to create staff member");
  }

  return response.data;
}

async function updateStaffMember(
  id: string,
  member: StaffMemberUpdateRequest,
): Promise<StaffMember> {
  const response = await sdk.updateStaffMemberById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
    body: member,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to update staff member");
  }

  return response.data;
}

async function deleteStaffMember(id: string): Promise<void> {
  const response = await sdk.deleteStaffMemberById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    throw new Error("Failed to delete staff member");
  }
}

async function getStaffMemberById(id: string): Promise<StaffMember | null> {
  const response = await sdk.getStaffMemberById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    return null;
  }

  return response.data || null;
}

async function getStaffMembersByCertification(
  certificationId: string,
): Promise<StaffMember[]> {
  // Backend doesn't have this specific filter, so fetch all and filter client-side
  const response = await listStaffMembers({
    filterBy: [`certificationId==${certificationId}`],
  });
  return response.items;
}
