/**
 * Backend API implementation for Housing Rooms
 */
import * as sdk from "@/generated/api/sdk.gen";
import type {
  HousingRoom,
  HousingRoomCreationRequest,
  HousingRoomUpdateRequest,
} from "@/generated/api";
import { apiClient } from "@/config/api";
import { getApiCampId } from "@/utils/tenantContext";

export const housingRoomsApi = {
  listHousingRooms,
  createHousingRoom,
  updateHousingRoom,
  deleteHousingRoom,
  getHousingRoomById,
};

async function listHousingRooms(params?: {
  limit?: number;
  offset?: number;
  search?: string;
  filterBy?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{
  items: HousingRoom[];
  total: number;
  limit: number;
  offset: number;
  next: number | null;
}> {
  const response = await sdk.listHousingRooms({
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
    throw new Error("Failed to fetch housing rooms");
  }

  return {
    items: response.data?.items || [],
    total: response.data?.total || 0,
    limit: response.data?.limit || 50,
    offset: response.data?.offset || 0,
    next: response.data?.next ?? null,
  };
}

async function createHousingRoom(
  room: HousingRoomCreationRequest,
): Promise<HousingRoom> {
  const response = await sdk.createHousingRoom({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    body: room,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to create housing room");
  }

  return response.data;
}

async function updateHousingRoom(
  id: string,
  room: HousingRoomUpdateRequest,
): Promise<HousingRoom> {
  const response = await sdk.updateHousingRoomById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
    body: room,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to update housing room");
  }

  return response.data;
}

async function deleteHousingRoom(id: string): Promise<void> {
  const response = await sdk.deleteHousingRoomById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    throw new Error("Failed to delete housing room");
  }
}

async function getHousingRoomById(id: string): Promise<HousingRoom | null> {
  const response = await sdk.getHousingRoomById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    return null;
  }

  return response.data || null;
}
