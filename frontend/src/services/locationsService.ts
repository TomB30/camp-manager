import type {
  Location,
  LocationCreationRequest,
  LocationUpdateRequest,
} from "@/generated/api";
import { storageService } from "./storage";
import { getCurrentTenantId, getCurrentCampId } from "@/utils/tenantContext";
import { STORAGE_KEYS } from "./storageKeys";

export const locationsService = {
  listLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationById,
  getLocationsByArea,
};

async function listLocations(): Promise<Location[]> {
  return storageService.getAll<Location>(STORAGE_KEYS.LOCATIONS);
}

async function createLocation(
  location: LocationCreationRequest,
): Promise<Location> {
  const newLocation = {
    ...location,
    meta: {
      id: crypto.randomUUID(),
      tenantId: getCurrentTenantId(),
      campId: getCurrentCampId(),
      name: location.meta.name,
      description: location.meta.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<Location>(STORAGE_KEYS.LOCATIONS, newLocation);
}

async function updateLocation(
  id: string,
  location: LocationUpdateRequest,
): Promise<Location> {
  const existingLocation = await storageService.getById<Location>(
    STORAGE_KEYS.LOCATIONS,
    id,
  );
  if (!existingLocation) {
    throw new Error(`Location with id ${id} not found`);
  }
  const updatedLocation = {
    ...existingLocation,
    ...location,
    meta: {
      id: existingLocation.meta.id,
      tenantId: existingLocation.meta.tenantId,
      campId: existingLocation.meta.campId,
      name: location.meta.name,
      description: location.meta.description,
      createdAt: existingLocation.meta.createdAt,
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<Location>(STORAGE_KEYS.LOCATIONS, updatedLocation);
}

async function deleteLocation(id: string): Promise<void> {
  return storageService.delete(STORAGE_KEYS.LOCATIONS, id);
}

async function getLocationById(id: string): Promise<Location | null> {
  return storageService.getById<Location>(STORAGE_KEYS.LOCATIONS, id);
}

async function getLocationsByArea(areaId: string): Promise<Location[]> {
  const locations = await listLocations();
  return locations.filter((l) => l.spec.areaId === areaId);
}
