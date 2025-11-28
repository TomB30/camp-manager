/**
 * Backend API implementation for Roles
 */
import * as sdk from "@/generated/api/sdk.gen";
import type {
  Role,
  RoleCreationRequest,
  RoleUpdateRequest,
} from "@/generated/api";
import { apiClient } from "@/config/api";
import { getApiCampId } from "@/utils/tenantContext";

export const rolesApi = {
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  getRoleById,
};

async function listRoles(params?: {
  limit?: number;
  offset?: number;
  search?: string;
  filterBy?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{
  items: Role[];
  total: number;
  limit: number;
  offset: number;
  next: number | null;
}> {
  const response = await sdk.listRoles({
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
    throw new Error("Failed to fetch roles");
  }

  return {
    items: response.data?.items || [],
    total: response.data?.total || 0,
    limit: response.data?.limit || 50,
    offset: response.data?.offset || 0,
    next: response.data?.next ?? null,
  };
}

async function createRole(role: RoleCreationRequest): Promise<Role> {
  const response = await sdk.createRole({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    body: role,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to create role");
  }

  return response.data;
}

async function updateRole(id: string, role: RoleUpdateRequest): Promise<Role> {
  const response = await sdk.updateRoleById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
    body: role,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to update role");
  }

  return response.data;
}

async function deleteRole(id: string): Promise<void> {
  const response = await sdk.deleteRoleById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    throw new Error("Failed to delete role");
  }
}

async function getRoleById(id: string): Promise<Role | null> {
  const response = await sdk.getRoleById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    return null;
  }

  return response.data || null;
}
