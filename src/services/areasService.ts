import type { Area, AreaCreationRequest, AreaUpdateRequest } from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export const areasService = {
  listAreas,
  createArea,
  updateArea,
  deleteArea,
  getAreaById,
  getAreasByType,
};

async function listAreas(): Promise<Area[]> {
  return storageService.getAll<Area>(STORAGE_KEYS.AREAS);
}

async function createArea(area: AreaCreationRequest): Promise<Area> {
  const newArea = {
    ...area,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return storageService.save<Area>(STORAGE_KEYS.AREAS, newArea);
}

async function updateArea(id: string, area: AreaUpdateRequest): Promise<Area> {
  const existingArea = await storageService.getById<Area>(
    STORAGE_KEYS.AREAS,
    id,
  );
  if (!existingArea) {
    throw new Error(`Area with id ${id} not found`);
  }
  const updatedArea = {
    ...existingArea,
    ...area,
    updatedAt: new Date().toISOString(),
  };
  return storageService.save<Area>(STORAGE_KEYS.AREAS, updatedArea);
}

async function deleteArea(id: string): Promise<void> {
  return storageService.delete(STORAGE_KEYS.AREAS, id);
}

async function getAreaById(id: string): Promise<Area | null> {
  return storageService.getById<Area>(STORAGE_KEYS.AREAS, id);
}

async function getAreasByType(type: Area["type"]): Promise<Area[]> {
  const areas = await listAreas();
  return areas.filter((a) => a.type === type);
}
