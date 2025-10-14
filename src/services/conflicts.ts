import type { Conflict, Event, Camper, StaffMember, Room, FamilyGroup, SleepingRoom, Certification } from '@/types/api';

export class ConflictDetector {
  detectConflicts(
    events: Event[],
    campers: Camper[],
    staffMembers: StaffMember[],
    rooms: Room[],
    certifications: Certification[] = []
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    // Check for event capacity conflicts
    events.forEach(event => {
      const enrolledCount = event.enrolledCamperIds?.length || 0;
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
          conflictingIds: event.enrolledCamperIds || [],
        });
      }
    });

    // Check for room capacity conflicts (multiple events in same room at same time)
    const roomUsage = new Map<string, Event[]>();
    events.forEach(event => {
      if (!roomUsage.has(event.roomId)) {
        roomUsage.set(event.roomId, []);
      }
      roomUsage.get(event.roomId)!.push(event);
    });

    roomUsage.forEach((roomEvents, roomId) => {
      const room = rooms.find(r => r.id === roomId);
      if (!room) return;

      // Check for overlapping events in the same room
      for (let i = 0; i < roomEvents.length; i++) {
        for (let j = i + 1; j < roomEvents.length; j++) {
          const event1 = roomEvents[i];
          const event2 = roomEvents[j];

          if (this.eventsOverlap(event1, event2)) {
            const totalCapacity = 
              (event1.enrolledCamperIds?.length || 0) + 
              (event2.enrolledCamperIds?.length || 0);

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
      event.enrolledCamperIds?.forEach(camperId => {
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
      event.assignedStaffIds?.forEach(staffId => {
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

      const assignedStaff = staffMembers.filter(m => 
        event.assignedStaffIds?.includes(m.id)
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
        
        conflicts.push({
          type: 'missing_certification',
          message: `Event "${event.title}" on ${formattedDate} requires certifications: ${missingCerts.join(', ')}`,
          entityId: event.id,
          conflictingIds: event.assignedStaffIds || [],
        });
      }
    });

    return conflicts;
  }

  canEnrollCamper(event: Event, camperId: string, allEvents: Event[]): { 
    canEnroll: boolean; 
    reason?: string 
  } {
    // Check capacity
    const enrolledCount = event.enrolledCamperIds?.length || 0;
    if (enrolledCount >= event.capacity) {
      return { 
        canEnroll: false, 
        reason: 'Event is at full capacity' 
      };
    }

    // Check for time conflicts
    const camperEvents = allEvents.filter(e => 
      e.enrolledCamperIds?.includes(camperId) && e.id !== event.id
    );

    for (const existingEvent of camperEvents) {
      if (this.eventsOverlap(event, existingEvent)) {
        return {
          canEnroll: false,
          reason: `Camper is already enrolled in "${existingEvent.title}" at this time`,
        };
      }
    }

    return { canEnroll: true };
  }

  /**
   * Check if a staff member is available for a specific event time
   */
  canAssignStaff(
    eventStartTime: string | Date, 
    eventEndTime: string | Date, 
    staffId: string, 
    allEvents: Event[],
    excludeEventId?: string
  ): { 
    canAssign: boolean; 
    reason?: string;
    conflictingEvent?: Event;
  } {
    // Get all events this staff member is assigned to
    const staffEvents = allEvents.filter(e => 
      e.assignedStaffIds?.includes(staffId) && e.id !== excludeEventId
    );

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
   * Get all family groups that conflict with a given date range in a specific sleeping room
   * @deprecated Use canAssignFamilyGroupToRoomBySession instead
   */
  getFamilyGroupConflictsInRoom(
    sleepingRoomId: string,
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

      // Only check groups in the same sleeping room
      if (group.sleepingRoomId !== sleepingRoomId) {
        return false;
      }

      // Since we now use sessions, always return false
      return false;
    });
  }
  
  /**
   * Get all family groups that conflict with a given session in a specific sleeping room
   */
  getFamilyGroupConflictsInRoomBySession(
    sleepingRoomId: string,
    sessionId: string,
    familyGroups: FamilyGroup[],
    excludeFamilyGroupId?: string
  ): FamilyGroup[] {
    return familyGroups.filter(group => {
      // Skip the group we're excluding (e.g., the one being edited)
      if (excludeFamilyGroupId && group.id === excludeFamilyGroupId) {
        return false;
      }

      // Only check groups in the same sleeping room
      if (group.sleepingRoomId !== sleepingRoomId) {
        return false;
      }

      // Check if they have the same sessionId
      return group.sessionId === sessionId;
    });
  }

  /**
   * Check if a family group can be assigned to a sleeping room (for date-based, deprecated)
   * @deprecated Use canAssignFamilyGroupToRoomBySession instead
   */
  canAssignFamilyGroupToRoom(
    sleepingRoomId: string,
    startDate: string,
    endDate: string,
    familyGroups: FamilyGroup[],
    excludeFamilyGroupId?: string
  ): { canAssign: boolean; reason?: string; conflictingGroups?: FamilyGroup[] } {
    const conflictingGroups = this.getFamilyGroupConflictsInRoom(
      sleepingRoomId,
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
   * Check if a family group can be assigned to a sleeping room for a specific session
   */
  canAssignFamilyGroupToRoomBySession(
    sleepingRoomId: string,
    sessionId: string,
    familyGroups: FamilyGroup[],
    excludeFamilyGroupId?: string
  ): { canAssign: boolean; reason?: string; conflictingGroups?: FamilyGroup[] } {
    const conflictingGroups = this.getFamilyGroupConflictsInRoomBySession(
      sleepingRoomId,
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
   * Get available sleeping rooms for a given date range
   */
  getAvailableSleepingRooms(
    startDate: string,
    endDate: string,
    allSleepingRooms: SleepingRoom[],
    familyGroups: FamilyGroup[],
    excludeFamilyGroupId?: string
  ): SleepingRoom[] {
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

