/**
 * Backend API implementation for Colors
 */
import * as sdk from "@/generated/api/sdk.gen";
import type {
  Color,
  ColorCreationRequest,
  ColorUpdateRequest,
} from "@/generated/api";
import { apiClient } from "@/config/api";
import { getApiCampId } from "@/utils/tenantContext";

export const colorsApi = {
  listColors,
  createColor,
  updateColor,
  deleteColor,
  getColorById,
};

async function listColors(params?: {
  limit?: number;
  offset?: number;
  search?: string;
  filterBy?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<
  | Color[]
  | {
      items: Color[];
      total: number;
      limit: number;
      offset: number;
      next: number | null;
    }
> {
  const response = await sdk.listColors({
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
    throw new Error("Failed to fetch colors");
  }

  return {
    items: response.data?.items || [],
    total: response.data?.total || 0,
    limit: response.data?.limit || 50,
    offset: response.data?.offset || 0,
    next: response.data?.next ?? null,
  };
}

async function createColor(color: ColorCreationRequest): Promise<Color> {
  const response = await sdk.createColor({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    body: color,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to create color");
  }

  return response.data;
}

async function updateColor(
  id: string,
  color: ColorUpdateRequest,
): Promise<Color> {
  const response = await sdk.updateColorById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
    body: color,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to update color");
  }

  return response.data;
}

async function deleteColor(id: string): Promise<void> {
  const response = await sdk.deleteColorById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    throw new Error("Failed to delete color");
  }
}

async function getColorById(id: string): Promise<Color | null> {
  const response = await sdk.getColorById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    return null;
  }

  return response.data || null;
}
