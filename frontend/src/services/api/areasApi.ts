/**
 * Backend API implementation for Areas
 */
import * as sdk from "@/generated/api/sdk.gen";
import type {
  Area,
  AreaCreationRequest,
  AreaUpdateRequest,
} from "@/generated/api";
import { apiClient } from "@/config/api";
import { getApiCampId } from "@/utils/tenantContext";

export const areasApi = {
  listAreas,
  createArea,
  updateArea,
  deleteArea,
  getAreaById,
};

async function listAreas(params?: {
  limit?: number;
  offset?: number;
  search?: string;
  filterBy?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{
  items: Area[];
  total: number;
  limit: number;
  offset: number;
  next: number | null;
}> {
  const response = await sdk.listAreas({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    query: params
      ? {
          limit: params.limit,
          offset: params.offset,
          search: params.search,
          filterBy: params.filterBy,
          sortBy: params.sortBy as any,
          sortOrder: params.sortOrder,
        }
      : undefined,
  });

  if (response.error) {
    throw new Error("Failed to fetch areas");
  }

  return {
    items: response.data?.items || [],
    total: response.data?.total || 0,
    limit: response.data?.limit || 50,
    offset: response.data?.offset || 0,
    next: response.data?.next ?? null,
  };
}

async function createArea(area: AreaCreationRequest): Promise<Area> {
  const response = await sdk.createArea({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    body: area,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to create area");
  }

  return response.data;
}

async function updateArea(id: string, area: AreaUpdateRequest): Promise<Area> {
  const response = await sdk.updateAreaById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
    body: area,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to update area");
  }

  return response.data;
}

async function deleteArea(id: string): Promise<void> {
  const response = await sdk.deleteAreaById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    throw new Error("Failed to delete area");
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
