/**
 * Backend API implementation for Activities
 */
import * as sdk from "@/generated/api/sdk.gen";
import type {
  Activity,
  ActivityCreationRequest,
  ActivityUpdateRequest,
} from "@/generated/api";
import { apiClient } from "@/config/api";
import { getApiCampId } from "@/utils/tenantContext";

export const activitiesApi = {
  listActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityById,
};

async function listActivities(): Promise<Activity[]> {
  const response = await sdk.listActivities({
    client: apiClient,
    path: { camp_id: getApiCampId() },
  });

  if (response.error) {
    throw new Error("Failed to fetch activities");
  }

  return response.data?.items || [];
}

async function createActivity(
  activity: ActivityCreationRequest,
): Promise<Activity> {
  const response = await sdk.createActivity({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    body: activity,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to create activity");
  }

  return response.data;
}

async function updateActivity(
  id: string,
  activity: ActivityUpdateRequest,
): Promise<Activity> {
  const response = await sdk.updateActivityById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
    body: activity,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to update activity");
  }

  return response.data;
}

async function deleteActivity(id: string): Promise<void> {
  const response = await sdk.deleteActivityById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    throw new Error("Failed to delete activity");
  }
}

async function getActivityById(id: string): Promise<Activity | null> {
  const response = await sdk.getActivityById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    return null;
  }

  return response.data || null;
}
