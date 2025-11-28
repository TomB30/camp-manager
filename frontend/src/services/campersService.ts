/**
 * Unified Campers Service
 * Routes to either backend API or local storage based on configuration
 */
import { isBackendEnabled } from "@/config/dataSource";
import { campersStorage } from "./campersStorage";
import { campersApi } from "./api/campersApi";
import type {
  Camper,
  CamperCreationRequest,
  CamperUpdateRequest,
} from "@/generated/api";

const impl = () => (isBackendEnabled() ? campersApi : campersStorage);

export const campersService = {
  listCampers: async (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    filterBy?: string[];
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<Camper[]> => {
    const result = await impl().listCampers(params as any);
    // Handle both array (from storage) and paginated response (from API)
    return Array.isArray(result) ? result : result.items;
  },
  createCamper: (data: CamperCreationRequest): Promise<Camper> =>
    impl().createCamper(data),
  updateCamper: (id: string, data: CamperUpdateRequest): Promise<Camper> =>
    impl().updateCamper(id, data),
  deleteCamper: (id: string): Promise<void> => impl().deleteCamper(id),
  getCamperById: (id: string): Promise<Camper | null> =>
    impl().getCamperById(id),
  getCampersByFamilyGroup: (housingGroupId: string): Promise<Camper[]> =>
    impl().getCampersByFamilyGroup(housingGroupId),
  getCampersBySession: (sessionId: string): Promise<Camper[]> =>
    impl().getCampersBySession(sessionId),
};
