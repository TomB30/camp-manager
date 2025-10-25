import { defineStore } from "pinia";
import type { Event, StaffMember, EventCreationRequest, EventUpdateRequest } from "@/types";
import { eventsService } from "@/services";
import { dateUtils } from "@/utils/dateUtils";
import { useGroupsStore } from "./groupsStore";
import { useStaffMembersStore } from "./staffMembersStore";

export const useEventsStore = defineStore("events", {
  state: () => ({
    events: [] as Event[],
    loading: false,
    selectedDate: new Date(),
  }),

  getters: {
    getEventById(state): (id: string) => Event | undefined {
      return (id: string): Event | undefined => {
        return state.events.find((e) => e.id === id);
      };
    },

    eventsForDate(state): (date: Date) => Event[] {
      return (date: Date): Event[] => {
        return dateUtils.filterEventsByDate(state.events, date);
      };
    },

    /**
     * Get all camper IDs for an event based on assigned groups minus exclusions
     */
    getEventCamperIds(): (eventId: string) => string[] {
      return (eventId: string): string[] => {
        const event = this.events.find((e) => e.id === eventId);
        if (!event || !event.groupIds || event.groupIds.length === 0) return [];

        const groupsStore = useGroupsStore();

        const camperIds = new Set<string>();

        // Collect campers from all assigned groups
        event.groupIds.forEach((groupId) => {
          // Check if it's a camper group
          const camperGroup = groupsStore.getGroupById(groupId);
          if (camperGroup) {
            const groupCampers = groupsStore.getCampersInGroup(groupId);
            groupCampers.forEach((camper) => camperIds.add(camper.id));
          }
        });

        // Remove excluded campers
        if (event.excludeCamperIds && event.excludeCamperIds.length > 0) {
          event.excludeCamperIds.forEach((id) => camperIds.delete(id));
        }

        return Array.from(camperIds);
      };
    },

    /**
     * Get all staff IDs for an event based on assigned groups minus exclusions
     */
    getEventStaffIds(): (eventId: string) => string[] {
      return (eventId: string): string[] => {
        const event = this.events.find((e) => e.id === eventId);
        if (!event || !event.groupIds || event.groupIds.length === 0) return [];

        const staffIds = new Set<string>();

        // Collect staff from all assigned family groups
        event.groupIds.forEach((groupId) => {
          const group = useGroupsStore().getGroupById(groupId);
          if (group && group.staffIds) {
            group.staffIds.forEach((staffId) => staffIds.add(staffId));
          } else if (group && group.staffFilters) {
            const staff = useStaffMembersStore().getStaffMembersByFilters(
              group.staffFilters,
            );
            staff.forEach((s: StaffMember) => staffIds.add(s.id));
          }
        });

        // Remove excluded staff
        if (event.excludeStaffIds && event.excludeStaffIds.length > 0) {
          event.excludeStaffIds.forEach((id) => staffIds.delete(id));
        }

        return Array.from(staffIds);
      };
    },

    camperEvents(state): (camperId: string) => Event[] {
      return (camperId: string): Event[] => {
        return state.events.filter((event) => {
          const camperIds = this.getEventCamperIds(event.id);
          return camperIds.includes(camperId);
        });
      };
    },

    staffEvents(state): (staffId: string) => Event[] {
      return (staffId: string): Event[] => {
        return state.events.filter((event) => {
          const staffIds = this.getEventStaffIds(event.id);
          return staffIds.includes(staffId);
        });
      };
    },

    locationEvents(state): (locationId: string) => Event[] {
      return (locationId: string): Event[] => {
        return state.events.filter((event) => event.locationId === locationId);
      };
    },

    programEvents(state): (programId: string) => Event[] {
      return (programId: string): Event[] => {
        return state.events.filter((e) => e.programId === programId);
      };
    },
  },

  actions: {
    async loadEvents(): Promise<void> {
      this.loading = true;
      try {
        this.events = await eventsService.listEvents();
      } finally {
        this.loading = false;
      }
    },

    async createEvent(eventRequest: EventCreationRequest): Promise<Event> {
      const event = await eventsService.createEvent(eventRequest);
      this.events.push(event);
      return event;
    },

    async addEventsBatch(events: Event[]): Promise<void> {
      await eventsService.saveEventsBatch(events);
      this.events.push(...events);
    },

    async updateEvent(id: string, eventUpdate: EventUpdateRequest): Promise<void> {
      const event = await eventsService.updateEvent(id, eventUpdate);
      const index = this.events.findIndex((e) => e.id === id);
      if (index >= 0) {
        this.events[index] = event;
      }
    },

    async deleteEvent(id: string): Promise<void> {
      await eventsService.deleteEvent(id);
      this.events = this.events.filter((e) => e.id !== id);
    },

    /**
     * Add a group to an event
     */
    async addGroupToEvent(eventId: string, groupId: string): Promise<void> {
      const event = this.events.find((e) => e.id === eventId);
      if (!event) throw new Error("Event not found");

      if (!event.groupIds) {
        event.groupIds = [];
      }

      if (!event.groupIds.includes(groupId)) {
        event.groupIds.push(groupId);
        const updated = await eventsService.updateEvent(event.id, event);
        const index = this.events.findIndex((e) => e.id === event.id);
        if (index >= 0) {
          this.events[index] = updated;
        }
      }
    },

    /**
     * Remove a group from an event
     */
    async removeGroupFromEvent(
      eventId: string,
      groupId: string,
    ): Promise<void> {
      const event = this.events.find((e) => e.id === eventId);
      if (!event) throw new Error("Event not found");

      event.groupIds = event.groupIds?.filter((id) => id !== groupId) || [];
      const updated = await eventsService.updateEvent(event.id, event);
      const index = this.events.findIndex((e) => e.id === event.id);
      if (index >= 0) {
        this.events[index] = updated;
      }
    },

    /**
     * Exclude a camper from an event
     */
    async excludeCamper(eventId: string, camperId: string): Promise<void> {
      const event = this.events.find((e) => e.id === eventId);
      if (!event) throw new Error("Event not found");

      if (!event.excludeCamperIds) {
        event.excludeCamperIds = [];
      }

      if (!event.excludeCamperIds.includes(camperId)) {
        event.excludeCamperIds.push(camperId);
        const updated = await eventsService.updateEvent(event.id, event);
        const index = this.events.findIndex((e) => e.id === event.id);
        if (index >= 0) {
          this.events[index] = updated;
        }
      }
    },

    /**
     * Remove a camper exclusion from an event
     */
    async removeExcludedCamper(
      eventId: string,
      camperId: string,
    ): Promise<void> {
      const event = this.events.find((e) => e.id === eventId);
      if (!event) throw new Error("Event not found");

      event.excludeCamperIds =
        event.excludeCamperIds?.filter((id) => id !== camperId) || [];
      const updated = await eventsService.updateEvent(event.id, event);
      const index = this.events.findIndex((e) => e.id === event.id);
      if (index >= 0) {
        this.events[index] = updated;
      }
    },

    /**
     * Exclude a staff member from an event
     */
    async excludeStaff(eventId: string, staffId: string): Promise<void> {
      const event = this.events.find((e) => e.id === eventId);
      if (!event) throw new Error("Event not found");

      if (!event.excludeStaffIds) {
        event.excludeStaffIds = [];
      }

      if (!event.excludeStaffIds.includes(staffId)) {
        event.excludeStaffIds.push(staffId);
        const updated = await eventsService.updateEvent(event.id, event);
        const index = this.events.findIndex((e) => e.id === event.id);
        if (index >= 0) {
          this.events[index] = updated;
        }
      }
    },

    /**
     * Remove a staff exclusion from an event
     */
    async removeExcludedStaff(eventId: string, staffId: string): Promise<void> {
      const event = this.events.find((e) => e.id === eventId);
      if (!event) throw new Error("Event not found");

      event.excludeStaffIds =
        event.excludeStaffIds?.filter((id) => id !== staffId) || [];
      const updated = await eventsService.updateEvent(event.id, event);
      const index = this.events.findIndex((e) => e.id === event.id);
      if (index >= 0) {
        this.events[index] = updated;
      }
    },
  },
});
