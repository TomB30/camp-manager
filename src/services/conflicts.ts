import type { Conflict, Event, Camper, StaffMember, Location, HousingRoom, FamilyGroup, Certification } from '@/types';

export class ConflictDetector {
  /**
   * Helper to get camper IDs from an event's groups minus exclusions
   * Note: In production, this should be computed by the store, but we include it here for standalone use
   */
  private getEventCamperIds(event: Event): string[] {
    if (!event.groupIds || event.groupIds.length === 0) return [];
    
    // For this simplified version, we just return empty since actual computation 
    // requires store access. In practice, this will be computed by the eventsStore
    return [];
  }

  /**
   * Helper to get staff IDs from an event's groups minus exclusions
   */
  private getEventStaffIds(event: Event): string[] {
    if (!event.groupIds || event.groupIds.length === 0) return [];
    
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
    eventStaffMap?: Map<string, string[]>
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    // Check for event capacity conflicts
    events.forEach(event => {
      const enrolledCamperIds = eventCamperMap?.get(event.id) || this.getEventCamperIds(event);
      const enrolledCount = enrolledCamperIds.length;
      if (enrolledCount > event.capacity) {
        const eventDate = new Date(event.startTime);
        const formattedDate = eventDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
        
        conflicts.push({
          type: 'event_overcapacity',
          message: `Event "${event.title}" on ${formattedDate} has ${enrolledCount} campers enrolled but capacity is ${event.capacity}`,
          entityId: event.id,
          conflictingIds: enrolledCamperIds,
        });
      }
    });

    // Check for room capacity conflicts (multiple events in same room at same time)
    const roomUsage = new Map<string, Event[]>();
    events.forEach(event => {
      if (!roomUsage.has(event.locationId)) {
        roomUsage.set(event.locationId, []);
      }
      roomUsage.get(event.locationId)!.push(event);
    });

    roomUsage.forEach((roomEvents, locationId) => {
      const room = rooms.find(r => r.id === locationId);
      if (!room) return;

      // Check for overlapping events in the same room
      for (let i = 0; i < roomEvents.length; i++) {
        for (let j = i + 1; j < roomEvents.length; j++) {
          const event1 = roomEvents[i];
          const event2 = roomEvents[j];

          if (this.eventsOverlap(event1, event2)) {
            const event1CamperIds = eventCamperMap?.get(event1.id) || this.getEventCamperIds(event1);
            const event2CamperIds = eventCamperMap?.get(event2.id) || this.getEventCamperIds(event2);
            const totalCapacity = event1CamperIds.length + event2CamperIds.length;

            if (totalCapacity > room.capacity) {
              const eventDate = new Date(event1.startTime);
              const formattedDate = eventDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              });
              
              conflicts.push({
                type: 'room_overcapacity',
                message: `Room "${room.name}" has overlapping events exceeding capacity on ${formattedDate} (${totalCapacity}/${room.capacity})`,
                entityId: room.id,
                conflictingIds: [event1.id, event2.id],
              });
            }
          }
        }
      }
    });

    // Check for camper double-booking
    const camperSchedules = new Map<string, Event[]>();
    events.forEach(event => {
      const enrolledCamperIds = eventCamperMap?.get(event.id) || this.getEventCamperIds(event);
      enrolledCamperIds.forEach(camperId => {
        if (!camperSchedules.has(camperId)) {
          camperSchedules.set(camperId, []);
        }
        camperSchedules.get(camperId)!.push(event);
      });
    });

    camperSchedules.forEach((camperEvents, camperId) => {
      const camper = campers.find(c => c.id === camperId);
      if (!camper) return;

      for (let i = 0; i < camperEvents.length; i++) {
        for (let j = i + 1; j < camperEvents.length; j++) {
          if (this.eventsOverlap(camperEvents[i], camperEvents[j])) {
            const eventDate = new Date(camperEvents[i].startTime);
            const formattedDate = eventDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            });
            const event1Time = new Date(camperEvents[i].startTime).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit' 
            });
            const event2Time = new Date(camperEvents[j].startTime).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit' 
            });
            
            conflicts.push({
              type: 'camper_double_booked',
              message: `${camper.firstName} ${camper.lastName} is enrolled in overlapping events on ${formattedDate} ("${camperEvents[i].title}" at ${event1Time} and "${camperEvents[j].title}" at ${event2Time})`,
              entityId: camperId,
              conflictingIds: [camperEvents[i].id, camperEvents[j].id],
            });
          }
        }
      }
    });

    // Check for staff double-booking
    const staffSchedules = new Map<string, Event[]>();
    events.forEach(event => {
      const assignedStaffIds = eventStaffMap?.get(event.id) || this.getEventStaffIds(event);
      assignedStaffIds.forEach(staffId => {
        if (!staffSchedules.has(staffId)) {
          staffSchedules.set(staffId, []);
        }
        staffSchedules.get(staffId)!.push(event);
      });
    });

    staffSchedules.forEach((staffEvents, staffId) => {
      const staff = staffMembers.find(m => m.id === staffId);
      if (!staff) return;

      for (let i = 0; i < staffEvents.length; i++) {
        for (let j = i + 1; j < staffEvents.length; j++) {
          if (this.eventsOverlap(staffEvents[i], staffEvents[j])) {
            const eventDate = new Date(staffEvents[i].startTime);
            const formattedDate = eventDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            });
            const event1Time = new Date(staffEvents[i].startTime).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit' 
            });
            const event2Time = new Date(staffEvents[j].startTime).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit' 
            });
            
            conflicts.push({
              type: 'staff_double_booked',
              message: `${staff.firstName} ${staff.lastName} is assigned to overlapping events on ${formattedDate} ("${staffEvents[i].title}" at ${event1Time} and "${staffEvents[j].title}" at ${event2Time})`,
              entityId: staffId,
              conflictingIds: [staffEvents[i].id, staffEvents[j].id],
            });
          }
        }
      }
    });

    // Check for missing certifications
    events.forEach(event => {
      if (!event.requiredCertifications || event.requiredCertifications.length === 0) {
        return;
      }

      const assignedStaffIds = eventStaffMap?.get(event.id) || this.getEventStaffIds(event);
      const assignedStaff = staffMembers.filter(m => 
        assignedStaffIds.includes(m.id)
      );

      // Collect all certifications from assigned staff
      const allCertifications = new Set<string>();
      assignedStaff.forEach(staff => {
        if (staff.certificationIds && staff.certificationIds.length > 0) {
          staff.certificationIds.forEach(certId => {
            const cert = certifications.find(c => c.id === certId);
            if (cert) {
              allCertifications.add(cert.name);
            }
          });
        }
      });

      const missingCerts = event.requiredCertifications.filter(
        cert => !allCertifications.has(cert)
      );

      if (missingCerts.length > 0) {
        const eventDate = new Date(event.startTime);
        const formattedDate = eventDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
        
        const assignedStaffIds = eventStaffMap?.get(event.id) || this.getEventStaffIds(event);
        const missingCertNames = missingCerts.map(cert => certifications.find(c => c.id === cert)?.name || cert);
        conflicts.push({
          type: 'missing_certification',
          message: `Event "${event.title}" on ${formattedDate} requires certifications: ${missingCertNames.join(', ')}`,
          entityId: event.id,
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
    excludeEventId?: string
  ): { 
    canAssign: boolean; 
    reason?: string;
    conflictingEvent?: Event;
  } {
    // Get all events this staff member is assigned to
    const staffEvents = allEvents.filter(e => {
      if (e.id === excludeEventId) return false;
      const staffIds = eventStaffMap?.get(e.id) || this.getEventStaffIds(e);
      return staffIds.includes(staffId);
    });

    // Create a temporary event object to check overlaps
    const tempEvent = {
      startTime: typeof eventStartTime === 'string' ? eventStartTime : eventStartTime.toISOString(),
      endTime: typeof eventEndTime === 'string' ? eventEndTime : eventEndTime.toISOString(),
    } as Event;

    // Check for time conflicts
    for (const existingEvent of staffEvents) {
      if (this.eventsOverlap(tempEvent, existingEvent)) {
        const startTime = new Date(existingEvent.startTime).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit' 
        });
        return {
          canAssign: false,
          reason: `Already assigned to "${existingEvent.title}" at ${startTime}`,
          conflictingEvent: existingEvent,
        };
      }
    }

    return { canAssign: true };
  }

  private eventsOverlap(event1: Event, event2: Event): boolean {
    const start1 = new Date(event1.startTime).getTime();
    const end1 = new Date(event1.endTime).getTime();
    const start2 = new Date(event2.startTime).getTime();
    const end2 = new Date(event2.endTime).getTime();

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
    familyGroups: FamilyGroup[],
    excludeFamilyGroupId?: string
  ): FamilyGroup[] {
    // This method is deprecated - keeping for backward compatibility only
    return familyGroups.filter(group => {
      // Skip the group we're excluding (e.g., the one being edited)
      if (excludeFamilyGroupId && group.id === excludeFamilyGroupId) {
        return false;
      }

      // Only check groups in the same housing room
      if (group.housingRoomId !== housingRoomId) {
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
    familyGroups: FamilyGroup[],
    excludeFamilyGroupId?: string
  ): FamilyGroup[] {
    return familyGroups.filter(group => {
      // Skip the group we're excluding (e.g., the one being edited)
      if (excludeFamilyGroupId && group.id === excludeFamilyGroupId) {
        return false;
      }

      // Only check groups in the same housing room
      if (group.housingRoomId !== housingRoomId) {
        return false;
      }

      // Check if they have the same sessionId
      return group.sessionId === sessionId;
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
    familyGroups: FamilyGroup[],
    excludeFamilyGroupId?: string
  ): { canAssign: boolean; reason?: string; conflictingGroups?: FamilyGroup[] } {
    const conflictingGroups = this.getFamilyGroupConflictsInRoom(
      housingRoomId,
      startDate,
      endDate,
      familyGroups,
      excludeFamilyGroupId
    );

    if (conflictingGroups.length > 0) {
      return {
        canAssign: false,
        reason: `This room is already occupied by ${conflictingGroups.length === 1 ? 'another family group' : 'other family groups'} during these dates`,
        conflictingGroups
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
    familyGroups: FamilyGroup[],
    excludeFamilyGroupId?: string
  ): { canAssign: boolean; reason?: string; conflictingGroups?: FamilyGroup[] } {
    const conflictingGroups = this.getFamilyGroupConflictsInRoomBySession(
      housingRoomId,
      sessionId,
      familyGroups,
      excludeFamilyGroupId
    );

    if (conflictingGroups.length > 0) {
      return {
        canAssign: false,
        reason: `This room is already occupied by ${conflictingGroups.length === 1 ? 'another family group' : 'other family groups'} during this session`,
        conflictingGroups
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
    familyGroups: FamilyGroup[],
    excludeFamilyGroupId?: string
  ): HousingRoom[] {
    return allSleepingRooms.filter(room => {
      const validation = this.canAssignFamilyGroupToRoom(
        room.id,
        startDate,
        endDate,
        familyGroups,
        excludeFamilyGroupId
      );
      return validation.canAssign;
    });
  }
}

export const conflictDetector = new ConflictDetector();

