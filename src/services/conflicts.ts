import type { Conflict, Event, Child, TeamMember, Room } from '@/types/api';

export class ConflictDetector {
  detectConflicts(
    events: Event[],
    children: Child[],
    teamMembers: TeamMember[],
    rooms: Room[]
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    // Check for event capacity conflicts
    events.forEach(event => {
      const enrolledCount = event.enrolledChildrenIds?.length || 0;
      if (enrolledCount > event.capacity) {
        conflicts.push({
          type: 'event_overcapacity',
          message: `Event "${event.title}" has ${enrolledCount} children enrolled but capacity is ${event.capacity}`,
          entityId: event.id,
          conflictingIds: event.enrolledChildrenIds || [],
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
              (event1.enrolledChildrenIds?.length || 0) + 
              (event2.enrolledChildrenIds?.length || 0);

            if (totalCapacity > room.capacity) {
              conflicts.push({
                type: 'room_overcapacity',
                message: `Room "${room.name}" has overlapping events exceeding capacity (${totalCapacity}/${room.capacity})`,
                entityId: room.id,
                conflictingIds: [event1.id, event2.id],
              });
            }
          }
        }
      }
    });

    // Check for child double-booking
    const childSchedules = new Map<string, Event[]>();
    events.forEach(event => {
      event.enrolledChildrenIds?.forEach(childId => {
        if (!childSchedules.has(childId)) {
          childSchedules.set(childId, []);
        }
        childSchedules.get(childId)!.push(event);
      });
    });

    childSchedules.forEach((childEvents, childId) => {
      const child = children.find(c => c.id === childId);
      if (!child) return;

      for (let i = 0; i < childEvents.length; i++) {
        for (let j = i + 1; j < childEvents.length; j++) {
          if (this.eventsOverlap(childEvents[i], childEvents[j])) {
            conflicts.push({
              type: 'child_double_booked',
              message: `${child.firstName} ${child.lastName} is enrolled in overlapping events`,
              entityId: childId,
              conflictingIds: [childEvents[i].id, childEvents[j].id],
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
      const staff = teamMembers.find(m => m.id === staffId);
      if (!staff) return;

      for (let i = 0; i < staffEvents.length; i++) {
        for (let j = i + 1; j < staffEvents.length; j++) {
          if (this.eventsOverlap(staffEvents[i], staffEvents[j])) {
            conflicts.push({
              type: 'staff_double_booked',
              message: `${staff.firstName} ${staff.lastName} is assigned to overlapping events`,
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

      const assignedStaff = teamMembers.filter(m => 
        event.assignedStaffIds?.includes(m.id)
      );

      const allCertifications = new Set(
        assignedStaff.flatMap(s => s.certifications || [])
      );

      const missingCerts = event.requiredCertifications.filter(
        cert => !allCertifications.has(cert)
      );

      if (missingCerts.length > 0) {
        conflicts.push({
          type: 'missing_certification',
          message: `Event "${event.title}" requires certifications: ${missingCerts.join(', ')}`,
          entityId: event.id,
          conflictingIds: event.assignedStaffIds || [],
        });
      }
    });

    return conflicts;
  }

  canEnrollChild(event: Event, childId: string, allEvents: Event[]): { 
    canEnroll: boolean; 
    reason?: string 
  } {
    // Check capacity
    const enrolledCount = event.enrolledChildrenIds?.length || 0;
    if (enrolledCount >= event.capacity) {
      return { 
        canEnroll: false, 
        reason: 'Event is at full capacity' 
      };
    }

    // Check for time conflicts
    const childEvents = allEvents.filter(e => 
      e.enrolledChildrenIds?.includes(childId) && e.id !== event.id
    );

    for (const existingEvent of childEvents) {
      if (this.eventsOverlap(event, existingEvent)) {
        return {
          canEnroll: false,
          reason: `Child is already enrolled in "${existingEvent.title}" at this time`,
        };
      }
    }

    return { canEnroll: true };
  }

  private eventsOverlap(event1: Event, event2: Event): boolean {
    const start1 = new Date(event1.startTime).getTime();
    const end1 = new Date(event1.endTime).getTime();
    const start2 = new Date(event2.startTime).getTime();
    const end2 = new Date(event2.endTime).getTime();

    return start1 < end2 && start2 < end1;
  }
}

export const conflictDetector = new ConflictDetector();

