/**
 * Events Service
 * Handles all event-related operations
 */

import type { Event } from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

class EventsService {
  /**
   * Get all events, optionally filtered by date range
   */
  async getEvents(startDate?: Date, endDate?: Date): Promise<Event[]> {
    let events = await storageService.getAll<Event>(STORAGE_KEYS.EVENTS);

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

  /**
   * Get an event by ID
   */
  async getEvent(id: string): Promise<Event | null> {
    return storageService.getById<Event>(STORAGE_KEYS.EVENTS, id);
  }

  /**
   * Save an event (create or update)
   */
  async saveEvent(event: Event): Promise<Event> {
    return storageService.save<Event>(STORAGE_KEYS.EVENTS, event);
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: string): Promise<void> {
    return storageService.delete(STORAGE_KEYS.EVENTS, id);
  }

  /**
   * Save multiple events in batch (useful for recurring events)
   */
  async saveEventsBatch(events: Event[]): Promise<Event[]> {
    return storageService.saveBatch<Event>(STORAGE_KEYS.EVENTS, events);
  }

  /**
   * Get events for a specific location
   */
  async getEventsForLocation(locationId: string): Promise<Event[]> {
    const events = await this.getEvents();
    return events.filter((event) => event.locationId === locationId);
  }

  /**
   * Get events for a specific program
   */
  async getEventsForProgram(programId: string): Promise<Event[]> {
    const events = await this.getEvents();
    return events.filter((event) => event.programId === programId);
  }
}

export const eventsService = new EventsService();
