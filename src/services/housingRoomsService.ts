import type {
  HousingRoom,
  HousingRoomCreationRequest,
  HousingRoomUpdateRequest,
} from "@/generated/api";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export const housingRoomsService = {
  listHousingRooms,
  createHousingRoom,
  updateHousingRoom,
  deleteHousingRoom,
  getHousingRoomById,
  getHousingRoomsByArea,
};

async function listHousingRooms(): Promise<HousingRoom[]> {
  return storageService.getAll<HousingRoom>(STORAGE_KEYS.HOUSING_ROOMS);
}

async function createHousingRoom(
  housingRoom: HousingRoomCreationRequest,
): Promise<HousingRoom> {
  const newHousingRoom = {
    ...housingRoom,
    meta: {
      id: crypto.randomUUID(),
      name: housingRoom.meta.name,
      description: housingRoom.meta.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<HousingRoom>(
    STORAGE_KEYS.HOUSING_ROOMS,
    newHousingRoom,
  );
}

async function updateHousingRoom(
  id: string,
  housingRoom: HousingRoomUpdateRequest,
): Promise<HousingRoom> {
  const existingHousingRoom = await storageService.getById<HousingRoom>(
    STORAGE_KEYS.HOUSING_ROOMS,
    id,
  );
  if (!existingHousingRoom) {
    throw new Error(`Housing room with id ${id} not found`);
  }
  const updatedHousingRoom = {
    ...existingHousingRoom,
    ...housingRoom,
    meta: {
      ...existingHousingRoom.meta,
      name: housingRoom.meta.name,
      description: housingRoom.meta.description,
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<HousingRoom>(
    STORAGE_KEYS.HOUSING_ROOMS,
    updatedHousingRoom,
  );
}

async function deleteHousingRoom(id: string): Promise<void> {
  return storageService.delete(STORAGE_KEYS.HOUSING_ROOMS, id);
}

async function getHousingRoomById(id: string): Promise<HousingRoom | null> {
  return storageService.getById<HousingRoom>(STORAGE_KEYS.HOUSING_ROOMS, id);
}

async function getHousingRoomsByArea(areaId: string): Promise<HousingRoom[]> {
  const rooms = await listHousingRooms();
  return rooms.filter((r) => r.spec.areaId === areaId);
}
