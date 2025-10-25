import type { Event, EventCreationRequest, EventUpdateRequest } from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export const eventsService = {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventById,
  saveEventsBatch,
  getEventsForLocation,
  getEventsForProgram,
  getEventsByDateRange,
};

async function listEvents(): Promise<Event[]> {
  return storageService.getAll<Event>(STORAGE_KEYS.EVENTS);
}

async function createEvent(event: EventCreationRequest): Promise<Event> {
  const newEvent = {
    ...event,
    id: crypto.randomUUID(),
  };
  return storageService.save<Event>(STORAGE_KEYS.EVENTS, newEvent);
}

async function updateEvent(
  id: string,
  event: EventUpdateRequest
): Promise<Event> {
  const existingEvent = await storageService.getById<Event>(
    STORAGE_KEYS.EVENTS,
    id
  );
  if (!existingEvent) {
    throw new Error(`Event with id ${id} not found`);
  }
  const updatedEvent = {
    ...existingEvent,
    ...event,
  };
  return storageService.save<Event>(STORAGE_KEYS.EVENTS, updatedEvent);
}

async function deleteEvent(id: string): Promise<void> {
  return storageService.delete(STORAGE_KEYS.EVENTS, id);
}

async function getEventById(id: string): Promise<Event | null> {
  return storageService.getById<Event>(STORAGE_KEYS.EVENTS, id);
}

async function saveEventsBatch(events: Event[]): Promise<Event[]> {
  return storageService.saveBatch<Event>(STORAGE_KEYS.EVENTS, events);
}

async function getEventsForLocation(locationId: string): Promise<Event[]> {
  const events = await listEvents();
  return events.filter((event) => event.locationId === locationId);
}

async function getEventsForProgram(programId: string): Promise<Event[]> {
  const events = await listEvents();
  return events.filter((event) => event.programId === programId);
}

async function getEventsByDateRange(
  startDate?: Date,
  endDate?: Date
): Promise<Event[]> {
  let events = await listEvents();

  if (startDate || endDate) {
    events = events.filter((event) => {
      const eventStart = new Date(event.startDate);
      if (startDate && eventStart < startDate) return false;
      if (endDate && eventStart > endDate) return false;
      return true;
    });
  }

  return events;
}
