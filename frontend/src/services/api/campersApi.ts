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

async function listCampers(): Promise<Camper[]> {
  const response = await sdk.listCampers({
    client: apiClient,
    path: { camp_id: getApiCampId() },
  });

  if (response.error) {
    throw new Error("Failed to fetch campers");
  }

  return response.data?.items || [];
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
  const campers = await listCampers();
  return campers.filter((c) => c.spec.housingGroupId === housingGroupId);
}

async function getCampersBySession(sessionId: string): Promise<Camper[]> {
  // Backend doesn't have this specific filter, so fetch all and filter client-side
  const campers = await listCampers();
  return campers.filter((c) => c.spec.sessionId === sessionId);
}
