/**
 * Unified Events Service
 * Routes to either backend API or local storage based on configuration
 */
import { isBackendEnabled } from "@/config/dataSource";
import { eventsStorage } from "./eventsStorage";
import { eventsApi, type ListEventsOptions } from "./api/eventsApi";
import type {
  Event,
  EventCreationRequest,
  EventUpdateRequest,
  UpdateScope,
  DeleteScope,
} from "@/generated/api";

const impl = () => (isBackendEnabled() ? eventsApi : eventsStorage);

export const eventsService = {
  listEvents: (options?: ListEventsOptions): Promise<Event[]> =>
    impl().listEvents(options),
  createEvent: (data: EventCreationRequest): Promise<Event> =>
    impl().createEvent(data),
  updateEvent: (
    id: string,
    data: EventUpdateRequest,
    updateScope?: UpdateScope,
  ): Promise<Event> => impl().updateEvent(id, data, updateScope),
  deleteEvent: (id: string, deleteScope?: DeleteScope): Promise<void> =>
    impl().deleteEvent(id, deleteScope),
  getEventById: (id: string): Promise<Event | null> => impl().getEventById(id),
  saveEventsBatch: (events: Event[]): Promise<Event[]> =>
    impl().saveEventsBatch(events),
  getEventsForLocation: (locationId: string): Promise<Event[]> =>
    impl().getEventsForLocation(locationId),
  getEventsForProgram: (programId: string): Promise<Event[]> =>
    impl().getEventsForProgram(programId),
  getEventsByDateRange: (startDate?: Date, endDate?: Date): Promise<Event[]> =>
    impl().getEventsByDateRange(startDate, endDate),
};
