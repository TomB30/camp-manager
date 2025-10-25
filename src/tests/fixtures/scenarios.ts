/**
 * Pre-configured test scenarios
 * These scenarios represent common or edge-case situations
 */

import type { Event, Group, HousingRoom } from "@/types";
import { buildEvent, buildGroup, buildHousingRoom } from "./builders";

/**
 * Scenario: Conflicting events at the same location and time
 */
export const conflictingEventsScenario = (): Event[] => {
  const baseDateTime = "2025-10-20T10:00:00.000Z";
  const endDate = "2025-10-20T11:00:00.000Z";
  const locationId = "location-1";

  return [
    buildEvent({
      id: "conflict-event-1",
      title: "First Event",
      locationId,
      startDate: baseDateTime,
      endDate,
    }),
    buildEvent({
      id: "conflict-event-2",
      title: "Conflicting Event",
      locationId,
      startDate: baseDateTime,
      endDate,
    }),
  ];
};

/**
 * Scenario: Staff member scheduled for two events at the same time
 */
export const staffConflictScenario = (): Event[] => {
  const staffId = "staff-1";
  const baseDateTime = "2025-10-20T14:00:00.000Z";
  const endDate = "2025-10-20T15:00:00.000Z";

  return [
    buildEvent({
      id: "staff-conflict-1",
      title: "Event 1",
      excludeStaffIds: [staffId],
      startDate: baseDateTime,
      endDate,
    }),
    buildEvent({
      id: "staff-conflict-2",
      title: "Event 2",
      startDate: baseDateTime,
      endDate,
    }),
  ];
};

/**
 * Scenario: Housing room at full capacity
 */
export const fullCapacityRoomScenario = (): {
  room: HousingRoom;
  group: Group;
} => {
  const room = buildHousingRoom({
    id: "full-room",
    name: "Full Capacity Room",
    beds: 8,
  });

  const group = buildGroup({
    id: "full-group",
    name: "Full Capacity Group",
    camperFilters: {
      ageMin: 12,
      ageMax: 18,
      gender: "male",
      sessionId: "session-1",
    },
    housingRoomId: room.id,
  });

  return { room, group };
};

/**
 * Scenario: Housing room with insufficient capacity for group
 */
export const insufficientCapacityScenario = (): {
  room: HousingRoom;
  groupSize: number;
} => {
  const room = buildHousingRoom({
    id: "small-room",
    name: "Small Room",
    beds: 6,
  });

  return { room, groupSize: 8 }; // Group needs 8 beds but room only has 6
};

/**
 * Scenario: Housing room already occupied during requested dates
 */
export const roomOccupiedScenario = (): {
  room: HousingRoom;
  existingGroup: Group;
  newGroupDates: { startDate: string; endDate: string };
} => {
  const room = buildHousingRoom({
    id: "occupied-room",
    name: "Occupied Room",
    beds: 8,
  });

  const existingGroup = buildGroup({
    id: "existing-group",
    name: "Existing Group",
    camperFilters: {
      ageMin: 12,
      ageMax: 18,
      gender: "male",
      sessionId: "session-1",
    },
    housingRoomId: room.id,
  });

  // New group wants room during overlapping dates
  const newGroupDates = {
    startDate: "2025-10-22", // Overlaps with existing group
    endDate: "2025-10-27",
  };

  return { room, existingGroup, newGroupDates };
};

/**
 * Scenario: Partial date overlap
 */
export const partialDateOverlapScenario = (): {
  group1: Group;
  group2: Group;
} => {
  const roomId = "shared-room";

  const group1 = buildGroup({
    id: "group-1",
    name: "Group 1",
    camperFilters: {
      ageMin: 12,
      ageMax: 18,
      gender: "male",
      sessionId: "session-1",
    },
    sessionId: "session-1",
    housingRoomId: roomId,
  });

  const group2 = buildGroup({
    id: "group-2",
    name: "Group 2",
    camperFilters: {
      ageMin: 12,
      ageMax: 18,
      gender: "male",
      sessionId: "session-1",
    },
    sessionId: "session-1",
    housingRoomId: roomId,
  });

  return { group1, group2 };
};

/**
 * Scenario: Same-day checkout and check-in (should be allowed)
 */
export const sameDayCheckoutCheckinScenario = (): {
  group1: Group;
  group2: Group;
} => {
  const roomId = "turnover-room";

  const group1 = buildGroup({
    id: "checkout-group",
    name: "Checking Out",
    camperFilters: {
      ageMin: 12,
      ageMax: 18,
      gender: "male",
      sessionId: "session-1",
    },
    sessionId: "session-1",
    housingRoomId: roomId,
  });

  const group2 = buildGroup({
    id: "checkin-group",
    name: "Checking In",
    camperFilters: {
      ageMin: 12,
      ageMax: 18,
      gender: "male",
      sessionId: "session-1",
    },
    sessionId: "session-1",
    housingRoomId: roomId,
  });

  return { group1, group2 };
};

/**
 * Scenario: Event at exact capacity
 */
export const eventAtCapacityScenario = (): Event => {
  return buildEvent({
    id: "capacity-event",
    title: "Full Event",
    capacity: 10,
    groupIds: Array.from({ length: 10 }, (_, i) => `group-${i}`),
  });
};

/**
 * Scenario: Staff member without required certification
 */
export const missingCertificationScenario = () => {
  const requiredCertId = "cert-lifeguard";

  return {
    event: buildEvent({
      id: "requires-cert",
      title: "Swimming Event",
      activityId: "activity-swimming",
    }),
    activity: {
      id: "activity-swimming",
      requiredCertifications: [requiredCertId],
    },
    staffMember: {
      id: "staff-no-cert",
      certifications: [], // Missing required certification
    },
  };
};

/**
 * Scenario: Multiple groups trying to book same room
 */
export const roomBookingRaceConditionScenario = (): {
  room: HousingRoom;
  groups: Group[];
} => {
  const room = buildHousingRoom({
    id: "popular-room",
    name: "Popular Room",
    beds: 8,
  });

  const groups = [
    buildGroup({
      id: "race-group-1",
      name: "Group 1",
      camperFilters: {
        ageMin: 12,
        ageMax: 18,
        gender: "male",
        sessionId: "session-1",
      },
      housingRoomId: room.id,
    }),
    buildGroup({
      id: "race-group-2",
      name: "Group 2",
      camperFilters: {
        ageMin: 12,
        ageMax: 18,
        gender: "male",
        sessionId: "session-1",
      },
      housingRoomId: room.id,
    }),
    buildGroup({
      id: "race-group-3",
      name: "Group 3",
      camperFilters: {
        ageMin: 12,
        ageMax: 18,
        gender: "male",
        sessionId: "session-1",
      },
      housingRoomId: room.id,
    }),
  ];

  return { room, groups };
};

