import { defineStore } from 'pinia';
import type { Event } from '@/types';
import { eventsService, conflictDetector } from '@/services';
import { filterEventsByDate } from '@/utils/dateUtils';

export const useEventsStore = defineStore('events', {
  state: () => ({
    events: [] as Event[],
    loading: false,
    selectedDate: new Date(),
  }),

  getters: {
    getEventById(state): (id: string) => Event | undefined {
      return (id: string): Event | undefined => {
        return state.events.find(e => e.id === id);
      };
    },

    eventsForDate(state): (date: Date) => Event[] {
      return (date: Date): Event[] => {
        return filterEventsByDate(state.events, date);
      };
    },

    camperEvents(state): (camperId: string) => Event[] {
      return (camperId: string): Event[] => {
        return state.events.filter(event => 
          event.enrolledCamperIds?.includes(camperId)
        );
      };
    },

    staffEvents(state): (staffId: string) => Event[] {
      return (staffId: string): Event[] => {
        return state.events.filter(event => 
          event.assignedStaffIds?.includes(staffId)
        );
      };
    },

    locationEvents(state): (locationId: string) => Event[] {
      return (locationId: string): Event[] => {
        return state.events.filter(event => event.locationId === locationId);
      };
    },

    programEvents(state): (programId: string) => Event[] {
      return (programId: string): Event[] => {
        return state.events.filter(e => e.programId === programId);
      };
    },
  },

  actions: {
    async loadEvents(): Promise<void> {
      this.loading = true;
      try {
        this.events = await eventsService.getEvents();
      } finally {
        this.loading = false;
      }
    },

    async addEvent(event: Event): Promise<void> {
      await eventsService.saveEvent(event);
      this.events.push(event);
    },

    async addEventsBatch(events: Event[]): Promise<void> {
      await eventsService.saveEventsBatch(events);
      this.events.push(...events);
    },

    async updateEvent(event: Event): Promise<void> {
      await eventsService.saveEvent(event);
      const index = this.events.findIndex(e => e.id === event.id);
      if (index >= 0) {
        this.events[index] = event;
      }
    },

    async deleteEvent(id: string): Promise<void> {
      await eventsService.deleteEvent(id);
      this.events = this.events.filter(e => e.id !== id);
    },

    async enrollCamper(eventId: string, camperId: string): Promise<void> {
      const event = this.events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');

      const validation = conflictDetector.canEnrollCamper(event, camperId, this.events);
      if (!validation.canEnroll) {
        throw new Error(validation.reason);
      }

      await eventsService.enrollCamper(eventId, camperId);
      
      if (!event.enrolledCamperIds) {
        event.enrolledCamperIds = [];
      }
      event.enrolledCamperIds.push(camperId);
    },

    async unenrollCamper(eventId: string, camperId: string): Promise<void> {
      const event = this.events.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');

      await eventsService.unenrollCamper(eventId, camperId);
      event.enrolledCamperIds = event.enrolledCamperIds?.filter(id => id !== camperId) || [];
    },

    async moveCamper(fromEventId: string, toEventId: string, camperId: string): Promise<void> {
      await this.unenrollCamper(fromEventId, camperId);
      await this.enrollCamper(toEventId, camperId);
    },
  }
});

