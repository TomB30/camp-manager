/**
 * Backend API implementation for Time Blocks
 */
import * as sdk from "@/generated/api/sdk.gen";
import type {
  TimeBlock,
  TimeBlockCreationRequest,
  TimeBlockUpdateRequest,
} from "@/generated/api";
import { apiClient } from "@/config/api";
import { getApiCampId } from "@/utils/tenantContext";

export const timeBlocksApi = {
  listTimeBlocks,
  createTimeBlock,
  updateTimeBlock,
  deleteTimeBlock,
  getTimeBlockById,
};

async function listTimeBlocks(params?: {
  limit?: number;
  offset?: number;
  search?: string;
  filterBy?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{
  items: TimeBlock[];
  total: number;
  limit: number;
  offset: number;
  next: number | null;
}> {
  const response = await sdk.listTimeBlocks({
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
    throw new Error("Failed to fetch time blocks");
  }

  return {
    items: response.data?.items || [],
    total: response.data?.total || 0,
    limit: response.data?.limit || 50,
    offset: response.data?.offset || 0,
    next: response.data?.next ?? null,
  };
}

async function createTimeBlock(
  timeBlock: TimeBlockCreationRequest,
): Promise<TimeBlock> {
  const response = await sdk.createTimeBlock({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    body: timeBlock,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to create time block");
  }

  return response.data;
}

async function updateTimeBlock(
  id: string,
  timeBlock: TimeBlockUpdateRequest,
): Promise<TimeBlock> {
  const response = await sdk.updateTimeBlockById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
    body: timeBlock,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to update time block");
  }

  return response.data;
}

async function deleteTimeBlock(id: string): Promise<void> {
  const response = await sdk.deleteTimeBlockById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    throw new Error("Failed to delete time block");
  }
}

async function getTimeBlockById(id: string): Promise<TimeBlock | null> {
  const response = await sdk.getTimeBlockById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    return null;
  }

  return response.data || null;
}
