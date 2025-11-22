/**
 * Backend API implementation for Areas
 */
import * as sdk from '@/generated/api/sdk.gen';
import type {
  Area,
  AreaCreationRequest,
  AreaUpdateRequest,
} from '@/generated/api';
import { apiClient } from '@/config/api';
import { getApiCampId } from '@/utils/tenantContext';

export const areasApi = {
  listAreas,
  createArea,
  updateArea,
  deleteArea,
  getAreaById,
};

async function listAreas(): Promise<Area[]> {
  const response = await sdk.listAreas({ client: apiClient, path: { camp_id: getApiCampId() } });
  
  if (response.error) {
    throw new Error('Failed to fetch areas');
  }
  
  return response.data?.items || [];
}

async function createArea(area: AreaCreationRequest): Promise<Area> {
  const response = await sdk.createArea({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    body: area,
  });
  
  if (response.error || !response.data) {
    throw new Error('Failed to create area');
  }
  
  return response.data;
}

async function updateArea(
  id: string,
  area: AreaUpdateRequest,
): Promise<Area> {
  const response = await sdk.updateAreaById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
    body: area,
  });
  
  if (response.error || !response.data) {
    throw new Error('Failed to update area');
  }
  
  return response.data;
}

async function deleteArea(id: string): Promise<void> {
  const response = await sdk.deleteAreaById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });
  
  if (response.error) {
    throw new Error('Failed to delete area');
  }
}

async function getAreaById(id: string): Promise<Area | null> {
  const response = await sdk.getAreaById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });
  
  if (response.error) {
    return null;
  }
  
  return response.data || null;
}

