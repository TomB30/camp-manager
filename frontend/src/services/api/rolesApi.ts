/**
 * Backend API implementation for Roles
 */
import * as sdk from '@/generated/api/sdk.gen';
import type {
  Role,
  RoleCreationRequest,
  RoleUpdateRequest,
} from '@/generated/api';
import { apiClient } from '@/config/api';
import { getApiCampId } from '@/utils/tenantContext';

export const rolesApi = {
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  getRoleById,
};

async function listRoles(): Promise<Role[]> {
  const response = await sdk.listRoles({ client: apiClient, path: { camp_id: getApiCampId() } });
  
  if (response.error) {
    throw new Error('Failed to fetch roles');
  }
  
  return response.data?.items || [];
}

async function createRole(role: RoleCreationRequest): Promise<Role> {
  const response = await sdk.createRole({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    body: role,
  });
  
  if (response.error || !response.data) {
    throw new Error('Failed to create role');
  }
  
  return response.data;
}

async function updateRole(
  id: string,
  role: RoleUpdateRequest,
): Promise<Role> {
  const response = await sdk.updateRoleById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
    body: role,
  });
  
  if (response.error || !response.data) {
    throw new Error('Failed to update role');
  }
  
  return response.data;
}

async function deleteRole(id: string): Promise<void> {
  const response = await sdk.deleteRoleById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });
  
  if (response.error) {
    throw new Error('Failed to delete role');
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

