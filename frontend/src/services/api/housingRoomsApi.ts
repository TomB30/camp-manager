/**
 * Backend API implementation for Housing Rooms
 */
import * as sdk from '@/generated/api/sdk.gen';
import type {
  HousingRoom,
  HousingRoomCreationRequest,
  HousingRoomUpdateRequest,
} from '@/generated/api';
import { apiClient } from '@/config/api';

export const housingRoomsApi = {
  listHousingRooms,
  createHousingRoom,
  updateHousingRoom,
  deleteHousingRoom,
  getHousingRoomById,
};

async function listHousingRooms(): Promise<HousingRoom[]> {
  const response = await sdk.listHousingRooms({ client: apiClient });
  
  if (response.error) {
    throw new Error('Failed to fetch housing rooms');
  }
  
  return response.data?.items || [];
}

async function createHousingRoom(
  room: HousingRoomCreationRequest,
): Promise<HousingRoom> {
  const response = await sdk.createHousingRoom({
    client: apiClient,
    body: room,
  });
  
  if (response.error || !response.data) {
    throw new Error('Failed to create housing room');
  }
  
  return response.data;
}

async function updateHousingRoom(
  id: string,
  room: HousingRoomUpdateRequest,
): Promise<HousingRoom> {
  const response = await sdk.updateHousingRoomById({
    client: apiClient,
    path: { id },
    body: room,
  });
  
  if (response.error || !response.data) {
    throw new Error('Failed to update housing room');
  }
  
  return response.data;
}

async function deleteHousingRoom(id: string): Promise<void> {
  const response = await sdk.deleteHousingRoomById({
    client: apiClient,
    path: { id },
  });
  
  if (response.error) {
    throw new Error('Failed to delete housing room');
  }
}

async function getHousingRoomById(id: string): Promise<HousingRoom | null> {
  const response = await sdk.getHousingRoomById({
    client: apiClient,
    path: { id },
  });
  
  if (response.error) {
    return null;
  }
  
  return response.data || null;
}

