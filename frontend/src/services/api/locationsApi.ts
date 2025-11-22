/**
 * Backend API implementation for Locations
 */
import * as sdk from '@/generated/api/sdk.gen';
import type {
  Location,
  LocationCreationRequest,
  LocationUpdateRequest,
} from '@/generated/api';
import { apiClient } from '@/config/api';
import { getApiCampId } from '@/utils/tenantContext';

export const locationsApi = {
  listLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationById,
  getLocationsByArea,
};

async function listLocations(): Promise<Location[]> {
  const response = await sdk.listLocations({ client: apiClient, path: { camp_id: getApiCampId() } });
  
  if (response.error) {
    throw new Error('Failed to fetch locations');
  }
  
  return response.data?.items || [];
}

async function createLocation(
  location: LocationCreationRequest,
): Promise<Location> {
  const response = await sdk.createLocation({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    body: location,
  });
  
  if (response.error || !response.data) {
    throw new Error('Failed to create location');
  }
  
  return response.data;
}

async function updateLocation(
  id: string,
  location: LocationUpdateRequest,
): Promise<Location> {
  const response = await sdk.updateLocationById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
    body: location,
  });
  
  if (response.error || !response.data) {
    throw new Error('Failed to update location');
  }
  
  return response.data;
}

async function deleteLocation(id: string): Promise<void> {
  const response = await sdk.deleteLocationById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });
  
  if (response.error) {
    throw new Error('Failed to delete location');
  }
}

async function getLocationById(id: string): Promise<Location | null> {
  const response = await sdk.getLocationById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });
  
  if (response.error) {
    return null;
  }
  
  return response.data || null;
}

async function getLocationsByArea(areaId: string): Promise<Location[]> {
  // Backend doesn't have this specific filter, so fetch all and filter client-side
  const locations = await listLocations();
  return locations.filter((l) => l.spec.areaId === areaId);
}

