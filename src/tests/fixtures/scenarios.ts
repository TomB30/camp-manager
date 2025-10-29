/**
 * Pre-configured test scenarios
 * These scenarios represent common or edge-case situations
 */

import type { Event, Group, HousingRoom } from "@/generated/api";
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
      meta: {
        id: "conflict-event-1",
        name: "First Event",
        createdAt: "2025-10-01T09:00:00.000Z",
        updatedAt: "2025-10-01T09:00:00.000Z",
      },
      spec: {
        // title: "First Event",
        locationId,
        startDate: baseDateTime,
        endDate,
      },
    }),
    buildEvent({
      meta: {
        id: "conflict-event-2",
        name: "Conflicting Event",
        createdAt: "2025-10-01T09:00:00.000Z",
        updatedAt: "2025-10-01T09:00:00.000Z",
      },
      spec: {
        // title: "Conflicting Event",
        locationId,
        startDate: baseDateTime,
        endDate,
      },
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
      meta: {
        id: "staff-conflict-1",
        name: "Event 1",
        createdAt: "2025-10-01T09:00:00.000Z",
        updatedAt: "2025-10-01T09:00:00.000Z",
      },
      spec: {
        // title: "Event 1",
        excludeStaffIds: [staffId],
        startDate: baseDateTime,
        endDate,
      },
    }),
    buildEvent({
      meta: {
        id: "staff-conflict-2",
        name: "Event 2",
        createdAt: "2025-10-01T09:00:00.000Z",
        updatedAt: "2025-10-01T09:00:00.000Z",
      },
      spec: {
        // title: "Event 2",
        excludeStaffIds: [staffId],
        startDate: baseDateTime,
        endDate,
      },
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
    meta: {
      id: "full-room",
      name: "Full Capacity Room",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 8,
    },
  });

  const group = buildGroup({
    meta: {
      id: "full-group",
      name: "Full Capacity Group",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      camperFilters: {
        ageMin: 12,
        ageMax: 18,
        gender: "male",
        sessionId: "session-1",
      },
      housingRoomId: room.meta.id,
    },
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
    meta: {
      id: "small-room",
      name: "Small Room",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 6,
    },
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
    meta: {
      id: "occupied-room",
      name: "Occupied Room",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 8,
    },
  });

  const existingGroup = buildGroup({
    meta: {
      id: "existing-group",
      name: "Existing Group",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      camperFilters: {
        ageMin: 12,
        ageMax: 18,
        gender: "male",
        sessionId: "session-1",
      },
      housingRoomId: room.meta.id,
    },
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
    meta: {
      id: "group-1",
      name: "Group 1",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      camperFilters: {
        ageMin: 12,
        ageMax: 18,
        gender: "male",
        sessionId: "session-1",
      },
      sessionId: "session-1",
      housingRoomId: roomId,
    },
  });

  const group2 = buildGroup({
    meta: {
      id: "group-2",
      name: "Group 2",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      camperFilters: {
        ageMin: 12,
        ageMax: 18,
        gender: "male",
        sessionId: "session-1",
      },
      sessionId: "session-1",
      housingRoomId: roomId,
    },
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
    meta: {
      id: "checkout-group",
      name: "Checking Out",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      camperFilters: {
        ageMin: 12,
        ageMax: 18,
        gender: "male",
        sessionId: "session-1",
      },
      sessionId: "session-1",
      housingRoomId: roomId,
    },
  });

  const group2 = buildGroup({
    meta: {
      id: "checkin-group",
      name: "Checking In",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      camperFilters: {
        ageMin: 12,
        ageMax: 18,
        gender: "male",
        sessionId: "session-1",
      },
      sessionId: "session-1",
      housingRoomId: roomId,
    },
  });

  return { group1, group2 };
};

/**
 * Scenario: Event at exact capacity
 */
export const eventAtCapacityScenario = (): Event => {
  return buildEvent({
    meta: {
      id: "capacity-event",
      name: "Full Event",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      // title: "Full Event",
      startDate: "2025-10-20T10:00:00.000Z",
      endDate: "2025-10-20T11:00:00.000Z",
      capacity: 10,
      groupIds: Array.from({ length: 10 }, (_, i) => `group-${i}`),
    },
  });
};

/**
 * Scenario: Staff member without required certification
 */
export const missingCertificationScenario = () => {
  const requiredCertId = "cert-lifeguard";

  return {
    event: buildEvent({
      meta: {
        id: "requires-cert",
        name: "Swimming Event",
        createdAt: "2025-10-01T09:00:00.000Z",
        updatedAt: "2025-10-01T09:00:00.000Z",
      },
      spec: {
        // title: "Swimming Event",
        activityId: "activity-swimming",
        startDate: "2025-10-20T10:00:00.000Z",
        endDate: "2025-10-20T11:00:00.000Z",
      },
    }),
    activity: {
      meta: {
        id: "activity-swimming",
        name: "Swimming Activity",
        createdAt: "2025-10-01T09:00:00.000Z",
        updatedAt: "2025-10-01T09:00:00.000Z",
      },
      spec: {
        requiredCertifications: [requiredCertId],
      },
    },
    staffMember: {
      meta: {
        id: "staff-no-cert",
        name: "Staff Member without Certification",
        createdAt: "2025-10-01T09:00:00.000Z",
        updatedAt: "2025-10-01T09:00:00.000Z",
      },
      spec: {
        certifications: [], // Missing required certification
      },
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
    meta: {
      id: "popular-room",
      name: "Popular Room",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 8,
    },
  });

  const groups = [
    buildGroup({
      meta: {
        id: "race-group-1",
        name: "Group 1",
        createdAt: "2025-10-01T09:00:00.000Z",
        updatedAt: "2025-10-01T09:00:00.000Z",
      },
      spec: {
        camperFilters: {
          ageMin: 12,
          ageMax: 18,
          gender: "male",
          sessionId: "session-1",
        },
        housingRoomId: room.meta.id,
      },
    }),
    buildGroup({
      meta: {
        id: "race-group-2",
        name: "Group 2",
        createdAt: "2025-10-01T09:00:00.000Z",
        updatedAt: "2025-10-01T09:00:00.000Z",
      },
      spec: {
        camperFilters: {
          ageMin: 12,
          ageMax: 18,
          gender: "male",
          sessionId: "session-1",
        },
        housingRoomId: room.meta.id,
      },
    }),
    buildGroup({
      meta: {
        id: "race-group-3",
        name: "Group 3",
        createdAt: "2025-10-01T09:00:00.000Z",
        updatedAt: "2025-10-01T09:00:00.000Z",
      },
      spec: {
        camperFilters: {
          ageMin: 12,
          ageMax: 18,
          gender: "male",
          sessionId: "session-1",
        },
        housingRoomId: room.meta.id,
      },
    }),
  ];

  return { room, groups };
};
