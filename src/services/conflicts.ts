import type {
  Conflict,
  Event,
  Camper,
  StaffMember,
  Location,
  HousingRoom,
  Certification,
  Group,
} from "@/types";

export class ConflictDetector {
  /**
   * Helper to get camper IDs from an event's groups minus exclusions
   * Note: In production, this should be computed by the store, but we include it here for standalone use
   */
  private getEventCamperIds(event: Event): string[] {
    if (!event.spec.groupIds || event.spec.groupIds.length === 0) return [];

    // For this simplified version, we just return empty since actual computation
    // requires store access. In practice, this will be computed by the eventsStore
    return [];
  }

  /**
   * Helper to get staff IDs from an event's groups minus exclusions
   */
  private getEventStaffIds(event: Event): string[] {
    if (!event.spec.groupIds || event.spec.groupIds.length === 0) return [];

    // For this simplified version, we just return empty since actual computation
    // requires store access. In practice, this will be computed by the eventsStore
    return [];
  }

  detectConflicts(
    events: Event[],
    campers: Camper[],
    staffMembers: StaffMember[],
    rooms: Location[],
    certifications: Certification[] = [],
    eventCamperMap?: Map<string, string[]>,
    eventStaffMap?: Map<string, string[]>,
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    // Check for event capacity conflicts
    events.forEach((event) => {
      const enrolledCamperIds =
        eventCamperMap?.get(event.meta.id) || this.getEventCamperIds(event);
      const enrolledCount = enrolledCamperIds.length;
      if (event.spec.capacity && enrolledCount > event.spec.capacity) {
        const eventDate = new Date(event.spec.startDate);
        const formattedDate = eventDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        conflicts.push({
          type: "event_overcapacity",
          message: `Event "${event.meta.name}" on ${formattedDate} has ${enrolledCount} campers enrolled but capacity is ${event.spec.capacity}`,
          entityId: event.meta.id,
          conflictingIds: enrolledCamperIds,
        });
      }
    });

    // Check for room capacity conflicts (multiple events in same room at same time)
    const roomUsage = new Map<string, Event[]>();
    events.forEach((event) => {
      if (!event.spec.locationId) return;
      if (!roomUsage.has(event.spec.locationId)) {
        roomUsage.set(event.spec.locationId, []);
      }
      roomUsage.get(event.spec.locationId)!.push(event);
    });

    roomUsage.forEach((roomEvents, locationId) => {
      const room = rooms.find((r) => r.meta.id === locationId);
      if (!room) return;

      // Check for overlapping events in the same room
      for (let i = 0; i < roomEvents.length; i++) {
        for (let j = i + 1; j < roomEvents.length; j++) {
          const event1 = roomEvents[i];
          const event2 = roomEvents[j];

          if (this.eventsOverlap(event1, event2)) {
            const event1CamperIds =
              eventCamperMap?.get(event1.meta.id) ||
              this.getEventCamperIds(event1);
            const event2CamperIds =
              eventCamperMap?.get(event2.meta.id) ||
              this.getEventCamperIds(event2);
            const totalCapacity =
              event1CamperIds.length + event2CamperIds.length;

            if (room.spec.capacity && totalCapacity > room.spec.capacity) {
              const eventDate = new Date(event1.spec.startDate);
              const formattedDate = eventDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              conflicts.push({
                type: "room_overcapacity",
                message: `Room "${room.meta.name}" has overlapping events exceeding capacity on ${formattedDate} (${totalCapacity}/${room.spec.capacity})`,
                entityId: room.meta.id,
                conflictingIds: [event1.meta.id, event2.meta.id],
              });
            }
          }
        }
      }
    });

    // Check for camper double-booking
    const camperSchedules = new Map<string, Event[]>();
    events.forEach((event) => {
      const enrolledCamperIds =
        eventCamperMap?.get(event.meta.id) || this.getEventCamperIds(event);
      enrolledCamperIds.forEach((camperId) => {
        if (!camperSchedules.has(camperId)) {
          camperSchedules.set(camperId, []);
        }
        camperSchedules.get(camperId)!.push(event);
      });
    });

    camperSchedules.forEach((camperEvents, camperId) => {
      const camper = campers.find((c) => c.meta.id === camperId);
      if (!camper) return;

      for (let i = 0; i < camperEvents.length; i++) {
        for (let j = i + 1; j < camperEvents.length; j++) {
          if (this.eventsOverlap(camperEvents[i], camperEvents[j])) {
            const eventDate = new Date(camperEvents[i].spec.startDate);
            const formattedDate = eventDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const event1Time = new Date(
              camperEvents[i].spec.startDate,
            ).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            });
            const event2Time = new Date(
              camperEvents[j].spec.startDate,
            ).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            });

            conflicts.push({
              type: "camper_double_booked",
              message: `${camper.meta.name} is enrolled in overlapping events on ${formattedDate} ("${camperEvents[i].meta.name}" at ${event1Time} and "${camperEvents[j].meta.name}" at ${event2Time})`,
              entityId: camperId,
              conflictingIds: [
                camperEvents[i].meta.id,
                camperEvents[j].meta.id,
              ],
            });
          }
        }
      }
    });

    // Check for staff double-booking
    const staffSchedules = new Map<string, Event[]>();
    events.forEach((event) => {
      const assignedStaffIds =
        eventStaffMap?.get(event.meta.id) || this.getEventStaffIds(event);
      assignedStaffIds.forEach((staffId) => {
        if (!staffSchedules.has(staffId)) {
          staffSchedules.set(staffId, []);
        }
        staffSchedules.get(staffId)!.push(event);
      });
    });

    staffSchedules.forEach((staffEvents, staffId) => {
      const staff = staffMembers.find((m) => m.meta.id === staffId);
      if (!staff) return;

      for (let i = 0; i < staffEvents.length; i++) {
        for (let j = i + 1; j < staffEvents.length; j++) {
          if (this.eventsOverlap(staffEvents[i], staffEvents[j])) {
            const eventDate = new Date(staffEvents[i].spec.startDate);
            const formattedDate = eventDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const event1Time = new Date(
              staffEvents[i].spec.startDate,
            ).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            });
            const event2Time = new Date(
              staffEvents[j].spec.startDate,
            ).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            });

            conflicts.push({
              type: "staff_double_booked",
              message: `${staff.meta.name} is assigned to overlapping events on ${formattedDate} ("${staffEvents[i].meta.name}" at ${event1Time} and "${staffEvents[j].meta.name}" at ${event2Time})`,
              entityId: staffId,
              conflictingIds: [staffEvents[i].meta.id, staffEvents[j].meta.id],
            });
          }
        }
      }
    });

    // Check for missing certifications
    events.forEach((event) => {
      if (
        !event.spec.requiredCertificationIds ||
        event.spec.requiredCertificationIds.length === 0
      ) {
        return;
      }

      const assignedStaffIds =
        eventStaffMap?.get(event.meta.id) || this.getEventStaffIds(event);
      const assignedStaff = staffMembers.filter((m) =>
        assignedStaffIds.includes(m.meta.id),
      );

      // Collect all certifications from assigned staff
      const allCertifications = new Set<string>();
      assignedStaff.forEach((staff) => {
        if (
          staff.spec.certificationIds &&
          staff.spec.certificationIds.length > 0
        ) {
          staff.spec.certificationIds.forEach((certId) => {
            const cert = certifications.find((c) => c.meta.id === certId);
            if (cert) {
              allCertifications.add(cert.meta.name);
            }
          });
        }
      });

      const missingCerts = event.spec.requiredCertificationIds.filter(
        (cert) => !allCertifications.has(cert),
      );

      if (missingCerts.length > 0) {
        const eventDate = new Date(event.spec.startDate);
        const formattedDate = eventDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const assignedStaffIds =
          eventStaffMap?.get(event.meta.id) || this.getEventStaffIds(event);
        const missingCertNames = missingCerts.map(
          (certId) =>
            certifications.find((c) => c.meta.id === certId)?.meta.name ||
            certId,
        );
        conflicts.push({
          type: "missing_certification",
          message: `Event "${event.meta.name}" on ${formattedDate} requires certifications: ${missingCertNames.join(", ")}`,
          entityId: event.meta.id,
          conflictingIds: assignedStaffIds,
        });
      }
    });

    return conflicts;
  }

  /**
   * Check if a staff member is available for a specific event time
   * Note: This method requires eventStaffMap to be passed when checking against existing events
   */
  canAssignStaff(
    eventStartTime: string | Date,
    eventEndTime: string | Date,
    staffId: string,
    allEvents: Event[],
    eventStaffMap?: Map<string, string[]>,
    excludeEventId?: string,
  ): {
    canAssign: boolean;
    reason?: string;
    conflictingEvent?: Event;
  } {
    // Get all events this staff member is assigned to
    const staffEvents = allEvents.filter((e) => {
      if (e.meta.id === excludeEventId) return false;
      const staffIds =
        eventStaffMap?.get(e.meta.id) || this.getEventStaffIds(e);
      return staffIds.includes(staffId);
    });

    // Create a temporary event object to check overlaps
    const tempEvent = {
      spec: {
        startDate:
          typeof eventStartTime === "string"
            ? eventStartTime
            : eventStartTime.toISOString(),
        endDate:
          typeof eventEndTime === "string"
            ? eventEndTime
            : eventEndTime.toISOString(),
      },
    } as Event;

    // Check for time conflicts
    for (const existingEvent of staffEvents) {
      if (this.eventsOverlap(tempEvent, existingEvent)) {
        const startDate = new Date(
          existingEvent.spec.startDate,
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
        return {
          canAssign: false,
          reason: `Already assigned to "${existingEvent.meta.name}" at ${startDate}`,
          conflictingEvent: existingEvent,
        };
      }
    }

    return { canAssign: true };
  }

  private eventsOverlap(event1: Event, event2: Event): boolean {
    const start1 = new Date(event1.spec.startDate).getTime();
    const end1 = new Date(event1.spec.endDate).getTime();
    const start2 = new Date(event2.spec.startDate).getTime();
    const end2 = new Date(event2.spec.endDate).getTime();

    return start1 < end2 && start2 < end1;
  }

  /**
   * Get all family groups that conflict with a given date range in a specific housing room
   * @deprecated Use canAssignFamilyGroupToRoomBySession instead
   */
  getFamilyGroupConflictsInRoom(
    housingRoomId: string,
    _startDate: string,
    _endDate: string,
    familyGroups: Group[],
    excludeGroupId?: string,
  ): Group[] {
    // This method is deprecated - keeping for backward compatibility only
    return familyGroups.filter((group) => {
      // Skip the group we're excluding (e.g., the one being edited)
      if (excludeGroupId && group.meta.id === excludeGroupId) {
        return false;
      }

      // Only check groups in the same housing room
      if (group.spec.housingRoomId !== housingRoomId) {
        return false;
      }

      // Since we now use sessions, always return false
      return false;
    });
  }

  /**
   * Get all family groups that conflict with a given session in a specific housing room
   */
  getFamilyGroupConflictsInRoomBySession(
    housingRoomId: string,
    sessionId: string,
    familyGroups: Group[],
    excludeGroupId?: string,
  ): Group[] {
    return familyGroups.filter((group) => {
      // Skip the group we're excluding (e.g., the one being edited)
      if (excludeGroupId && group.meta.id === excludeGroupId) {
        return false;
      }

      // Only check groups in the same housing room
      if (group.spec.housingRoomId !== housingRoomId) {
        return false;
      }

      // Check if they have the same sessionId
      return group.spec.sessionId === sessionId;
    });
  }

  /**
   * Check if a family group can be assigned to a housing room (for date-based, deprecated)
   * @deprecated Use canAssignFamilyGroupToRoomBySession instead
   */
  canAssignFamilyGroupToRoom(
    housingRoomId: string,
    startDate: string,
    endDate: string,
    familyGroups: Group[],
    excludeGroupId?: string,
  ): { canAssign: boolean; reason?: string; conflictingGroups?: Group[] } {
    const conflictingGroups = this.getFamilyGroupConflictsInRoom(
      housingRoomId,
      startDate,
      endDate,
      familyGroups,
      excludeGroupId,
    );

    if (conflictingGroups.length > 0) {
      return {
        canAssign: false,
        reason: `This room is already occupied by ${conflictingGroups.length === 1 ? "another family group" : "other family groups"} during these dates`,
        conflictingGroups,
      };
    }

    return { canAssign: true };
  }

  /**
   * Check if a family group can be assigned to a housing room for a specific session
   */
  canAssignFamilyGroupToRoomBySession(
    housingRoomId: string,
    sessionId: string,
    familyGroups: Group[],
    excludeFamilyGroupId?: string,
  ): { canAssign: boolean; reason?: string; conflictingGroups?: Group[] } {
    const conflictingGroups = this.getFamilyGroupConflictsInRoomBySession(
      housingRoomId,
      sessionId,
      familyGroups,
      excludeFamilyGroupId,
    );

    if (conflictingGroups.length > 0) {
      return {
        canAssign: false,
        reason: `This room is already occupied by ${conflictingGroups.length === 1 ? "another family group" : "other family groups"} during this session`,
        conflictingGroups,
      };
    }

    return { canAssign: true };
  }

  /**
   * Get available housing rooms for a given date range
   */
  getAvailableSleepingRooms(
    startDate: string,
    endDate: string,
    allSleepingRooms: HousingRoom[],
    familyGroups: Group[],
    excludeFamilyGroupId?: string,
  ): HousingRoom[] {
    return allSleepingRooms.filter((room) => {
      const validation = this.canAssignFamilyGroupToRoom(
        room.meta.id,
        startDate,
        endDate,
        familyGroups,
        excludeFamilyGroupId,
      );
      return validation.canAssign;
    });
  }
}

export const conflictDetector = new ConflictDetector();
