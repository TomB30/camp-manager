/**
 * Backend API implementation for Camp
 */
import * as sdk from "@/generated/api/sdk.gen";
import type { Camp, CampUpdateRequest } from "@/generated/api";
import { apiClient } from "@/config/api";

export const campApi = {
  getCamp,
  updateCamp,
  getCampsApi,
};

/**
 * Get all camps
 */
async function getCampsApi(): Promise<Camp[]> {
  const response = await sdk.getCamps({
    client: apiClient,
  });

  if (response.error) {
    throw new Error("Failed to get camps");
  }

  return response.data?.items || [];
}

/**
 * Get the camp (singleton). Returns the first camp from the list.
 */
async function getCamp(): Promise<Camp> {
  const camps = await getCampsApi();

  if (camps.length === 0) {
    throw new Error("No camp found. Please create a camp first.");
  }

  return camps[0];
}

/**
 * Update the camp settings
 */
async function updateCamp(campUpdate: CampUpdateRequest): Promise<Camp> {
  const existingCamp = await getCamp();

  const response = await sdk.updateCampById({
    client: apiClient,
    path: { id: existingCamp.meta.id },
    body: campUpdate,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to update camp");
  }

  return response.data;
}
