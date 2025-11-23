import type {
  Event,
  EventCreationRequest,
  EventUpdateRequest,
  UpdateScope,
  DeleteScope,
} from "@/generated/api";
import type { ListEventsOptions } from "./api/eventsApi";
import { storageService } from "./storage";
import { getCurrentTenantId, getCurrentCampId } from "@/utils/tenantContext";
import { STORAGE_KEYS } from "./storageKeys";

export const eventsStorage = {
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

async function listEvents(options?: ListEventsOptions): Promise<Event[]> {
  let events = await storageService.getAll<Event>(STORAGE_KEYS.EVENTS);

  // Apply search filter
  if (options?.search) {
    const searchLower = options.search.toLowerCase();
    events = events.filter(
      (event) =>
        event.meta.name.toLowerCase().includes(searchLower) ||
        event.meta.description?.toLowerCase().includes(searchLower),
    );
  }

  // Apply filterBy (basic implementation)
  if (options?.filterBy && options.filterBy.length > 0) {
    // This is a simplified implementation - full filtering would need parser
    // For now, just log that it's not fully implemented
    console.warn("filterBy not fully implemented in storage layer");
  }

  // Apply sorting
  if (options?.sortBy) {
    events.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (options.sortBy) {
        case "name":
          aVal = a.meta.name;
          bVal = b.meta.name;
          break;
        case "startDate":
          aVal = new Date(a.spec.startDate);
          bVal = new Date(b.spec.startDate);
          break;
        case "endDate":
          aVal = new Date(a.spec.endDate);
          bVal = new Date(b.spec.endDate);
          break;
        default:
          return 0;
      }

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return options.sortOrder === "desc" ? -comparison : comparison;
    });
  }

  // Apply pagination
  if (options?.offset !== undefined || options?.limit !== undefined) {
    const offset = options.offset || 0;
    const limit = options.limit || events.length;
    events = events.slice(offset, offset + limit);
  }

  return events;
}

async function createEvent(event: EventCreationRequest): Promise<Event> {
  const newEvent = {
    meta: {
      id: crypto.randomUUID(),
      tenantId: getCurrentTenantId(),
      campId: getCurrentCampId(),
      name: event.meta.name,
      description: event.meta.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: event.spec,
  };
  return storageService.save<Event>(STORAGE_KEYS.EVENTS, newEvent);
}

async function updateEvent(
  id: string,
  event: EventUpdateRequest,
  updateScope?: UpdateScope,
): Promise<Event> {
  const existingEvent = await storageService.getById<Event>(
    STORAGE_KEYS.EVENTS,
    id,
  );
  if (!existingEvent) {
    throw new Error(`Event with id ${id} not found`);
  }

  // Handle recurring event update scope
  if (updateScope && existingEvent.spec.recurrenceId) {
    const allEvents = await storageService.getAll<Event>(STORAGE_KEYS.EVENTS);
    const recurrenceId = existingEvent.spec.recurrenceId;
    const eventStartDate = new Date(existingEvent.spec.startDate);

    // Get all events in the series
    const seriesEvents = allEvents.filter(
      (e) => e.spec.recurrenceId === recurrenceId,
    );

    if (updateScope === "all") {
      // Update all events in the series
      for (const seriesEvent of seriesEvents) {
        const updated = {
          ...seriesEvent,
          meta: {
            ...seriesEvent.meta,
            name: event.meta.name,
            description: event.meta.description,
            updatedAt: new Date().toISOString(),
          },
          spec: {
            ...seriesEvent.spec,
            ...event.spec,
            // Keep the original dates for each event
            startDate: seriesEvent.spec.startDate,
            endDate: seriesEvent.spec.endDate,
          },
        };
        await storageService.save<Event>(STORAGE_KEYS.EVENTS, updated);
      }
      return existingEvent;
    } else if (updateScope === "future") {
      // Update this event and all future events
      for (const seriesEvent of seriesEvents) {
        const seriesDate = new Date(seriesEvent.spec.startDate);
        if (seriesDate >= eventStartDate) {
          const updated = {
            ...seriesEvent,
            meta: {
              ...seriesEvent.meta,
              name: event.meta.name,
              description: event.meta.description,
              updatedAt: new Date().toISOString(),
            },
            spec: {
              ...seriesEvent.spec,
              ...event.spec,
              startDate: seriesEvent.spec.startDate,
              endDate: seriesEvent.spec.endDate,
            },
          };
          await storageService.save<Event>(STORAGE_KEYS.EVENTS, updated);
        }
      }
      return existingEvent;
    }
  }

  // Default: update single event (updateScope === 'single' or no recurrence)
  const updatedEvent = {
    ...existingEvent,
    ...event,
    meta: {
      id: existingEvent.meta.id,
      tenantId: existingEvent.meta.tenantId,
      campId: existingEvent.meta.campId,
      name: event.meta.name,
      description: event.meta.description,
      createdAt: existingEvent.meta.createdAt,
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<Event>(STORAGE_KEYS.EVENTS, updatedEvent);
}

async function deleteEvent(
  id: string,
  deleteScope?: DeleteScope,
): Promise<void> {
  const existingEvent = await storageService.getById<Event>(
    STORAGE_KEYS.EVENTS,
    id,
  );
  if (!existingEvent) {
    throw new Error(`Event with id ${id} not found`);
  }

  // Handle recurring event delete scope
  if (deleteScope && existingEvent.spec.recurrenceId) {
    const allEvents = await storageService.getAll<Event>(STORAGE_KEYS.EVENTS);
    const recurrenceId = existingEvent.spec.recurrenceId;
    const eventStartDate = new Date(existingEvent.spec.startDate);

    // Get all events in the series
    const seriesEvents = allEvents.filter(
      (e) => e.spec.recurrenceId === recurrenceId,
    );

    if (deleteScope === "all") {
      // Delete all events in the series
      for (const seriesEvent of seriesEvents) {
        await storageService.delete(STORAGE_KEYS.EVENTS, seriesEvent.meta.id);
      }
      return;
    } else if (deleteScope === "future") {
      // Delete this event and all future events
      for (const seriesEvent of seriesEvents) {
        const seriesDate = new Date(seriesEvent.spec.startDate);
        if (seriesDate >= eventStartDate) {
          await storageService.delete(STORAGE_KEYS.EVENTS, seriesEvent.meta.id);
        }
      }
      return;
    }
  }

  // Default: delete single event (deleteScope === 'single' or no recurrence)
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
  return events.filter((event) => event.spec.locationId === locationId);
}

async function getEventsForProgram(programId: string): Promise<Event[]> {
  const events = await listEvents();
  return events.filter((event) => event.spec.programId === programId);
}

async function getEventsByDateRange(
  startDate?: Date,
  endDate?: Date,
): Promise<Event[]> {
  let events = await listEvents();

  if (startDate || endDate) {
    events = events.filter((event) => {
      const eventStart = new Date(event.spec.startDate);
      if (startDate && eventStart < startDate) return false;
      if (endDate && eventStart > endDate) return false;
      return true;
    });
  }

  return events;
}
