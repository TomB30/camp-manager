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
  id: generateTestId("camper"),
  firstName: "Test",
  lastName: "Camper",
  age: 12,
  gender: "male",
  sessionId: "session-2",
  parentContact: "555-0000",
  allergies: [],
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const buildStaffMember = (
  overrides: Partial<StaffMember> = {},
): StaffMember => ({
  id: generateTestId("staff"),
  firstName: "Test",
  lastName: "Staff",
  email: "test.staff@camp.com",
  phone: "555-0000",
  roleId: "role-1",
  certifications: [],
  availability: [],
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const buildActivity = (overrides: Partial<Activity> = {}): Activity => ({
  id: generateTestId("activity"),
  name: "Test Activity",
  description: "A test activity",
  programIds: ["program-1"],
  defaultDuration: 60,
  requiredCertifications: [],
  minParticipants: 5,
  maxParticipants: 20,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const buildEvent = (overrides: Partial<Event> = {}): Event => ({
  id: generateTestId("event"),
  title: "Test Event",
  activityId: "activity-1",
  locationId: "location-1",
  startDateTime: new Date().toISOString(),
  endDateTime: new Date(Date.now() + 3600000).toISOString(),
  assignedStaffIds: [],
  assignedGroupIds: [],
  capacity: 20,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const buildGroup = (overrides: Partial<Group> = {}): Group => ({
  id: generateTestId("group"),
  name: "Test Group",
  type: "activity",
  description: "A test group",
  memberIds: [],
  staffIds: [],
  sessionId: "session-2",
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const buildHousingRoom = (
  overrides: Partial<HousingRoom> = {},
): HousingRoom => ({
  id: generateTestId("room"),
  name: "Test Room",
  beds: 8,
  areaId: "area-1",
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const buildLocation = (overrides: Partial<Location> = {}): Location => ({
  id: generateTestId("location"),
  name: "Test Location",
  capacity: 25,
  type: "classroom",
  areaId: "area-1",
  equipment: [],
  ...overrides,
});

/**
 * Build a camper with allergies
 */
export const buildCamperWithAllergies = (
  allergies: string[],
  overrides: Partial<Camper> = {},
): Camper =>
  buildCamper({
    allergies,
    medicalNotes: `Allergic to: ${allergies.join(", ")}`,
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
    certifications: certificationIds.map((certificationId) => ({
      certificationId,
      obtainedDate: "2024-01-01",
      expirationDate: "2026-01-01",
    })),
    ...overrides,
  });

/**
 * Build a recurring event
 */
export const buildRecurringEvent = (
  frequency: "daily" | "weekly" | "monthly",
  overrides: Partial<Event> = {},
): Event =>
  buildEvent({
    recurrence: {
      frequency,
      interval: 1,
      endDate: "2025-12-31",
    },
    ...overrides,
  });

/**
 * Build a group with housing
 */
export const buildGroupWithHousing = (
  memberCount: number,
  overrides: Partial<Group> = {},
): Group => {
  const memberIds = Array.from({ length: memberCount }, (_, i) =>
    generateTestId(`camper-${i}`),
  );

  return buildGroup({
    memberIds,
    housingRoomId: "room-1",
    startDate: "2025-10-20",
    endDate: "2025-10-25",
    ...overrides,
  });
};

/**
 * Reset the ID counter (useful between tests)
 */
export const resetTestIds = () => {
  idCounter = 0;
};

