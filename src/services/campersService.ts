import type { Camper, CamperCreationRequest, CamperUpdateRequest } from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export const campersService = {
  listCampers,
  createCamper,
  updateCamper,
  deleteCamper,
  getCamperById,
  getCampersByFamilyGroup,
  getCampersBySession,
};

async function listCampers(): Promise<Camper[]> {
  return storageService.getAll<Camper>(STORAGE_KEYS.CAMPERS);
}

async function createCamper(camper: CamperCreationRequest): Promise<Camper> {
  const newCamper = {
    ...camper,
    id: crypto.randomUUID(),
  };
  return storageService.save<Camper>(STORAGE_KEYS.CAMPERS, newCamper);
}

async function updateCamper(
  id: string,
  camper: CamperUpdateRequest
): Promise<Camper> {
  const existingCamper = await storageService.getById<Camper>(
    STORAGE_KEYS.CAMPERS,
    id
  );
  if (!existingCamper) {
    throw new Error(`Camper with id ${id} not found`);
  }
  const updatedCamper = {
    ...existingCamper,
    ...camper,
  };
  return storageService.save<Camper>(STORAGE_KEYS.CAMPERS, updatedCamper);
}

async function deleteCamper(id: string): Promise<void> {
  // Delete the camper
  await storageService.delete(STORAGE_KEYS.CAMPERS, id);

  // Clean up: Remove from all events
  const events = await storageService.getAll(STORAGE_KEYS.EVENTS);
  const updatedEvents = events.map((event) => ({
    ...event,
    enrolledCamperIds:
      event.enrolledCamperIds?.filter(
        (camperId: string) => camperId !== id
      ) || [],
  }));

  // Save all updated events
  for (const event of updatedEvents) {
    await storageService.save(STORAGE_KEYS.EVENTS, event);
  }
}

async function getCamperById(id: string): Promise<Camper | null> {
  return storageService.getById<Camper>(STORAGE_KEYS.CAMPERS, id);
}

async function getCampersByFamilyGroup(familyGroupId: string): Promise<Camper[]> {
  const campers = await listCampers();
  return campers.filter((c) => c.familyGroupId === familyGroupId);
}

async function getCampersBySession(sessionId: string): Promise<Camper[]> {
  const campers = await listCampers();
  return campers.filter((c) => c.sessionId === sessionId);
}
