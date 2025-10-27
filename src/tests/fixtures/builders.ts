/**
 * Factory functions for creating test entities
 * These builders allow for flexible test data creation
 */

import type {
  Camper,
  StaffMember,
  Event,
  Group,
  HousingRoom,
  Activity,
  Location,
} from "@/types";

let idCounter = 0;
const generateTestId = (prefix: string): string => {
  idCounter++;
  return `${prefix}-test-${idCounter}`;
};

export const buildCamper = (overrides: Partial<Camper> = {}): Camper => ({
  meta: {
    id: generateTestId("camper"),
    name: "Test Camper",
    description: "A test camper",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  spec: {
    firstName: "Test",
    lastName: "Camper",
    age: 12,
    gender: "male",
    sessionId: "session-2",
    registrationDate: new Date().toISOString(),
  },
  ...overrides,
});

export const buildStaffMember = (
  overrides: Partial<StaffMember> = {},
): StaffMember => ({
  meta: {
    id: generateTestId("staff"),
    name: "Test Staff",
    description: "A test staff member",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  spec: {
    firstName: "Test",
    lastName: "Staff",
    email: "test.staff@camp.com",
    phone: "555-0000",
    roleId: "role-1",
    certificationIds: [],
    photoUrl: "https://example.com/photo.jpg",
    managerId: "manager-1",
  },
  ...overrides,
});

export const buildActivity = (overrides: Partial<Activity> = {}): Activity => ({
  meta: {
    id: generateTestId("activity"),
    name: "Test Activity",
    description: "A test activity",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  spec: {
    programIds: ["program-1"],
    duration: 60,
    requiredCertificationIds: [],
    defaultCapacity: 20,
  },
  ...overrides,
});

export const buildEvent = (overrides: Partial<Event> = {}): Event => ({
  meta: {
    id: generateTestId("event"),
    name: "Test Event",
    description: "A test event",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  spec: {
    title: "Test Event",
    activityId: "activity-1",
    locationId: "location-1",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 3600000).toISOString(),
    capacity: 20,
    groupIds: [],
    excludeCamperIds: [],
    excludeStaffIds: [],
    programId: "program-1",
    isRecurrenceParent: false,
  },
  ...overrides,
});

export const buildGroup = (overrides: Partial<Group> = {}): Group => ({
  meta: {
    id: generateTestId("group"),
    name: "Test Group",
    description: "A test group",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  spec: {
    sessionId: "session-2",
    housingRoomId: "room-1",
    camperFilters: {
      ageMin: 12,
      ageMax: 18,
      gender: "male",
      sessionId: "session-2",
    },
  },
  ...overrides,
});

export const buildHousingRoom = (
  overrides: Partial<HousingRoom> = {},
): HousingRoom => ({
  meta: {
    id: generateTestId("room"),
    name: "Test Room",
    description: "A test room",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  spec: {
    beds: 8,
    areaId: "area-1",
  },
  ...overrides,
});

export const buildLocation = (overrides: Partial<Location> = {}): Location => ({
  meta: {
    id: generateTestId("location"),
    name: "Test Location",
    description: "A test location",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  spec: {
    capacity: 25,
    type: "classroom",
    areaId: "area-1",
    equipment: [],
  },
  ...overrides,
});

/**
 * Build a staff member with specific certifications
 */
export const buildStaffWithCertifications = (
  certificationIds: string[],
  overrides: Partial<StaffMember> = {},
): StaffMember =>
  buildStaffMember({
    meta: {
      id: generateTestId("staff"),
      name: "Test Staff",
      description: "A test staff member",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      firstName: "Test",
      lastName: "Staff",
      roleId: "role-1",
      email: "test.staff@camp.com",
      phone: "555-0000",
      certificationIds,
    },
    ...overrides,
  });

/**
 * Build a recurring event
 */
export const buildRecurringEvent = (overrides: Partial<Event> = {}): Event =>
  buildEvent({
    meta: {
      id: generateTestId("event"),
      name: "Test Event",
      description: "A test event",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      title: "Test Event",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3600000).toISOString(),
      locationId: "location-1",
      groupIds: [],
      excludeCamperIds: [],
      excludeStaffIds: [],
      programId: "program-1",
      isRecurrenceParent: true,
      recurrenceId: "recurrence-1",
    },
    ...overrides,
  });

/**
 * Build a group with housing
 */
export const buildGroupWithHousing = (
  camperCount: number,
  overrides: Partial<Group> = {},
): Group => {
  const camperIds = Array.from({ length: camperCount }, (_, i) =>
    generateTestId(`camper-${i}`),
  );

  return buildGroup({
    meta: {
      id: generateTestId("group"),
      name: "Test Group",
      description: "A test group",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {
      camperIds,
      housingRoomId: "room-1",
    },
    ...overrides,
  });
};

/**
 * Reset the ID counter (useful between tests)
 */
export const resetTestIds = () => {
  idCounter = 0;
};
