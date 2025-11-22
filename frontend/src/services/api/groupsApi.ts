/**
 * Backend API implementation for Groups
 */
import * as sdk from '@/generated/api/sdk.gen';
import type {
  Group,
  GroupCreationRequest,
  GroupUpdateRequest,
} from '@/generated/api';
import { apiClient } from '@/config/api';
import { getApiCampId } from '@/utils/tenantContext';

export const groupsApi = {
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupById,
};

async function listGroups(): Promise<Group[]> {
  const response = await sdk.listGroups({ client: apiClient, path: { camp_id: getApiCampId() } });
  
  if (response.error) {
    throw new Error('Failed to fetch groups');
  }
  
  return response.data?.items || [];
}

async function createGroup(group: GroupCreationRequest): Promise<Group> {
  const response = await sdk.createGroup({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    body: group,
  });
  
  if (response.error || !response.data) {
    throw new Error('Failed to create group');
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
    throw new Error('Failed to update group');
  }
  
  return response.data;
}

async function deleteGroup(id: string): Promise<void> {
  const response = await sdk.deleteGroupById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });
  
  if (response.error) {
    throw new Error('Failed to delete group');
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

