/**
 * Backend API implementation for Groups
 */
import * as sdk from "@/generated/api/sdk.gen";
import type {
  Group,
  GroupCreationRequest,
  GroupUpdateRequest,
} from "@/generated/api";
import { apiClient } from "@/config/api";
import { getApiCampId } from "@/utils/tenantContext";

export const groupsApi = {
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupById,
};

async function listGroups(params?: {
  limit?: number;
  offset?: number;
  search?: string;
  filterBy?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{
  items: Group[];
  total: number;
  limit: number;
  offset: number;
  next: number | null;
}> {
  const response = await sdk.listGroups({
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
    throw new Error("Failed to fetch groups");
  }

  return {
    items: response.data?.items || [],
    total: response.data?.total || 0,
    limit: response.data?.limit || 50,
    offset: response.data?.offset || 0,
    next: response.data?.next ?? null,
  };
}

async function createGroup(group: GroupCreationRequest): Promise<Group> {
  const response = await sdk.createGroup({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    body: group,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to create group");
  }

  return response.data;
}

async function updateGroup(
  id: string,
  group: GroupUpdateRequest,
): Promise<Group> {
  const response = await sdk.updateGroupById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
    body: group,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to update group");
  }

  return response.data;
}

async function deleteGroup(id: string): Promise<void> {
  const response = await sdk.deleteGroupById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    throw new Error("Failed to delete group");
  }
}

async function getGroupById(id: string): Promise<Group | null> {
  const response = await sdk.getGroupById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    return null;
  }

  return response.data || null;
}
