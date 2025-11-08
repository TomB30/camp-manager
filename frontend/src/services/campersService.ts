import type {
  Camper,
  CamperCreationRequest,
  CamperUpdateRequest,
  Event,
} from "@/generated/api";
import { storageService } from "./storage";
import { getCurrentCampId, getCurrentTenantId } from "@/utils/tenantContext";
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
    meta: {
      id: crypto.randomUUID(),
      tenantId: getCurrentTenantId(),
      campId: getCurrentCampId(),
      name: camper.meta.name,
      description: camper.meta.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    name: camper.meta.name,
    description: camper.meta.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return storageService.save<Camper>(STORAGE_KEYS.CAMPERS, newCamper);
}

async function updateCamper(
  id: string,
  camper: CamperUpdateRequest,
): Promise<Camper> {
  const existingCamper = await storageService.getById<Camper>(
    STORAGE_KEYS.CAMPERS,
    id,
  );
  if (!existingCamper) {
    throw new Error(`Camper with id ${id} not found`);
  }
  const updatedCamper = {
    ...existingCamper,
    ...camper,
    meta: {
      tenantId: existingCamper.meta.tenantId,
      campId: existingCamper.meta.campId,
      id: existingCamper.meta.id,
      name: camper.meta.name,
      description: camper.meta.description,
      createdAt: existingCamper.meta.createdAt,
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<Camper>(STORAGE_KEYS.CAMPERS, updatedCamper);
}

async function deleteCamper(id: string): Promise<void> {
  // Delete the camper
  await storageService.delete(STORAGE_KEYS.CAMPERS, id);

  // Clean up: Remove from all events
  const events = await storageService.getAll<Event>(STORAGE_KEYS.EVENTS);
  const updatedEvents: Event[] = events.map((event: Event) => ({
    ...event,
    spec: {
      ...event.spec,
      excludeCamperIds:
        event.spec.excludeCamperIds?.filter(
          (camperId: string) => camperId !== id,
        ) || [],
    },
  }));

  // Save all updated events
  const prms: Promise<Event>[] = [];
  for (const event of updatedEvents) {
    prms.push(storageService.save<Event>(STORAGE_KEYS.EVENTS, event));
  }
  await Promise.all(prms);
}

async function getCamperById(id: string): Promise<Camper | null> {
  return storageService.getById<Camper>(STORAGE_KEYS.CAMPERS, id);
}

async function getCampersByFamilyGroup(
  housingGroupId: string,
): Promise<Camper[]> {
  const campers = await listCampers();
  return campers.filter((c) => c.spec.housingGroupId === housingGroupId);
}

async function getCampersBySession(sessionId: string): Promise<Camper[]> {
  const campers = await listCampers();
  return campers.filter((c) => c.spec.sessionId === sessionId);
}
