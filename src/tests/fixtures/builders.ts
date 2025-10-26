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
  allergies: [],
  registrationDate: new Date().toISOString(),
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
  certificationIds: [],
  photoUrl: "https://example.com/photo.jpg",
  managerId: "manager-1",
  ...overrides,
});

export const buildActivity = (overrides: Partial<Activity> = {}): Activity => ({
  id: generateTestId("activity"),
  name: "Test Activity",
  description: "A test activity",
  programIds: ["program-1"],
  duration: 60,
  requiredCertificationIds: [],
  defaultCapacity: 20,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const buildEvent = (overrides: Partial<Event> = {}): Event => ({
  id: generateTestId("event"),
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
  ...overrides,
});

export const buildGroup = (overrides: Partial<Group> = {}): Group => ({
  id: generateTestId("group"),
  name: "Test Group",
  description: "A test group",
  sessionId: "session-2",
  housingRoomId: "room-1",
  camperFilters: {
    ageMin: 12,
    ageMax: 18,
    gender: "male",
    sessionId: "session-2",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
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
    certificationIds,
    ...overrides,
  });

/**
 * Build a recurring event
 */
export const buildRecurringEvent = (overrides: Partial<Event> = {}): Event =>
  buildEvent({
    recurrenceId: "recurrence-1",
    isRecurrenceParent: true,
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
    camperIds,
    housingRoomId: "room-1",
    ...overrides,
  });
};

/**
 * Reset the ID counter (useful between tests)
 */
export const resetTestIds = () => {
  idCounter = 0;
};
