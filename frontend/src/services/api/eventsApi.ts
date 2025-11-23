/**
 * Backend API implementation for Events
 */
import * as sdk from "@/generated/api/sdk.gen";
import type {
  Event,
  EventCreationRequest,
  EventUpdateRequest,
  UpdateScope,
  DeleteScope,
  EventsSortBy,
  SortOrder,
} from "@/generated/api";
import { apiClient } from "@/config/api";
import { getApiCampId } from "@/utils/tenantContext";

export interface ListEventsOptions {
  limit?: number;
  offset?: number;
  search?: string;
  filterBy?: Array<string>;
  sortBy?: EventsSortBy;
  sortOrder?: SortOrder;
}

export const eventsApi = {
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
  const response = await sdk.listEvents({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    query: options
      ? {
          limit: options.limit,
          offset: options.offset,
          search: options.search,
          filterBy: options.filterBy,
          sortBy: options.sortBy,
          sortOrder: options.sortOrder,
        }
      : undefined,
  });

  if (response.error) {
    throw new Error("Failed to fetch events");
  }

  return response.data?.items || [];
}

async function createEvent(event: EventCreationRequest): Promise<Event> {
  const response = await sdk.createEvent({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    body: event,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to create event");
  }

  return response.data;
}

async function updateEvent(
  id: string,
  event: EventUpdateRequest,
  updateScope?: UpdateScope,
): Promise<Event> {
  const response = await sdk.updateEventById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
    body: event,
    query: updateScope ? { updateScope } : undefined,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to update event");
  }

  return response.data;
}

async function deleteEvent(
  id: string,
  deleteScope?: DeleteScope,
): Promise<void> {
  const response = await sdk.deleteEventById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
    query: deleteScope ? { deleteScope } : undefined,
  });

  if (response.error) {
    throw new Error("Failed to delete event");
  }
}

async function getEventById(id: string): Promise<Event | null> {
  const response = await sdk.getEventById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    return null;
  }

  return response.data || null;
}

async function saveEventsBatch(events: Event[]): Promise<Event[]> {
  // Backend doesn't have batch endpoint, so create/update individually
  const results: Event[] = [];

  for (const event of events) {
    if (event.meta.id) {
      // Update existing
      const updated = await updateEvent(event.meta.id, {
        meta: event.meta,
        spec: event.spec,
      });
      results.push(updated);
    } else {
      // Create new
      const created = await createEvent({
        meta: event.meta,
        spec: event.spec,
      });
      results.push(created);
    }
  }

  return results;
}

async function getEventsForLocation(locationId: string): Promise<Event[]> {
  // Backend doesn't have this specific filter, so fetch all and filter client-side
  const events = await listEvents();
  return events.filter((event) => event.spec.locationId === locationId);
}

async function getEventsForProgram(programId: string): Promise<Event[]> {
  // Backend doesn't have this specific filter, so fetch all and filter client-side
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
