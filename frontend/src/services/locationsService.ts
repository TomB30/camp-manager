/**
 * Unified Locations Service
 * Routes to either backend API or local storage based on configuration
 */
import { isBackendEnabled } from "@/config/dataSource";
import { locationsStorage } from "./locationsStorage";
import { locationsApi } from "./api/locationsApi";
import type {
  Location,
  LocationCreationRequest,
  LocationUpdateRequest,
} from "@/generated/api";

const impl = () => (isBackendEnabled() ? locationsApi : locationsStorage);

export const locationsService = {
  listLocations: (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    filterBy?: string[];
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<
    | { items: Location[]; total: number; limit: number; offset: number; next: number | null }
    | Location[]
  > => impl().listLocations(params as any),
  createLocation: (data: LocationCreationRequest): Promise<Location> =>
    impl().createLocation(data),
  updateLocation: (
    id: string,
    data: LocationUpdateRequest,
  ): Promise<Location> => impl().updateLocation(id, data),
  deleteLocation: (id: string): Promise<void> => impl().deleteLocation(id),
  getLocationById: (id: string): Promise<Location | null> =>
    impl().getLocationById(id),
  getLocationsByArea: (areaId: string): Promise<Location[]> =>
    impl().getLocationsByArea(areaId),
};
