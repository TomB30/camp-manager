/**
 * Backend API implementation for Campers
 */
import * as sdk from "@/generated/api/sdk.gen";
import type {
  Camper,
  CamperCreationRequest,
  CamperUpdateRequest,
} from "@/generated/api";
import { apiClient } from "@/config/api";
import { getApiCampId } from "@/utils/tenantContext";

export const campersApi = {
  listCampers,
  createCamper,
  updateCamper,
  deleteCamper,
  getCamperById,
  getCampersByFamilyGroup,
  getCampersBySession,
};

async function listCampers(params?: {
  limit?: number;
  offset?: number;
  search?: string;
  filterBy?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{ items: Camper[]; total: number; limit: number; offset: number; next: number | null }> {
  const response = await sdk.listCampers({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    query: params ? {
      limit: params.limit,
      offset: params.offset,
      search: params.search,
      filterBy: params.filterBy,
      sortBy: params.sortBy as any,
      sortOrder: params.sortOrder,
    } : undefined,
  });

  if (response.error) {
    throw new Error("Failed to fetch campers");
  }

  // Return full response with pagination metadata
  return {
    items: response.data?.items || [],
    total: response.data?.total || 0,
    limit: response.data?.limit || 50,
    offset: response.data?.offset || 0,
    next: response.data?.next ?? null,
  };
}

async function createCamper(camper: CamperCreationRequest): Promise<Camper> {
  const response = await sdk.createCamper({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    body: camper,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to create camper");
  }

  return response.data;
}

async function updateCamper(
  id: string,
  camper: CamperUpdateRequest,
): Promise<Camper> {
  const response = await sdk.updateCamperById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
    body: camper,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to update camper");
  }

  return response.data;
}

async function deleteCamper(id: string): Promise<void> {
  const response = await sdk.deleteCamperById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    throw new Error("Failed to delete camper");
  }
}

async function getCamperById(id: string): Promise<Camper | null> {
  const response = await sdk.getCamperById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    return null;
  }

  return response.data || null;
}

async function getCampersByFamilyGroup(
  housingGroupId: string,
): Promise<Camper[]> {
  // Backend doesn't have this specific filter, so fetch all and filter client-side
  const response = await listCampers();
  return response.items.filter((c: Camper) => c.spec.housingGroupId === housingGroupId);
}

async function getCampersBySession(sessionId: string): Promise<Camper[]> {
  // Backend doesn't have this specific filter, so fetch all and filter client-side
  const response = await listCampers();
  return response.items.filter((c: Camper) => c.spec.sessionId === sessionId);
}
