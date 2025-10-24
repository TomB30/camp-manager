import type { Event } from "@/types";
import { activitiesFixture } from "./activities.fixture";
import { locationsFixture } from "./locations.fixture";
import { staffMembersFixture } from "./staffMembers.fixture";

export const eventsFixture: Event[] = [
  // Single events
  {
    id: "event-1",
    title: "Morning Painting",
    activityId: activitiesFixture[0].id,
    locationId: locationsFixture[2].id, // Art Studio
    startDateTime: "2025-10-20T09:00:00.000Z",
    endDateTime: "2025-10-20T10:30:00.000Z",
    assignedStaffIds: [staffMembersFixture[1].id],
    assignedGroupIds: [],
    capacity: 15,
    notes: "Bring smocks",
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "event-2",
    title: "Swimming Lessons - Beginners",
    activityId: activitiesFixture[2].id,
    locationId: locationsFixture[3].id, // Swimming Area
    startDateTime: "2025-10-20T10:00:00.000Z",
    endDateTime: "2025-10-20T11:00:00.000Z",
    assignedStaffIds: [staffMembersFixture[2].id], // Lifeguard
    assignedGroupIds: [],
    capacity: 20,
    notes: "Ages 6-10",
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "event-3",
    title: "Nature Hike",
    activityId: activitiesFixture[4].id,
    locationId: locationsFixture[5].id, // North Trail Head
    startDateTime: "2025-10-20T14:00:00.000Z",
    endDateTime: "2025-10-20T16:00:00.000Z",
    assignedStaffIds: [staffMembersFixture[0].id],
    assignedGroupIds: [],
    capacity: 25,
    notes: "Wear hiking boots",
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  // Recurring events
  {
    id: "event-4",
    title: "Daily Archery",
    activityId: activitiesFixture[6].id,
    locationId: locationsFixture[9].id,
    startDateTime: "2025-10-20T15:00:00.000Z",
    endDateTime: "2025-10-20T16:00:00.000Z",
    assignedStaffIds: [staffMembersFixture[1].id],
    assignedGroupIds: [],
    capacity: 15,
    recurrence: {
      frequency: "daily",
      interval: 1,
      endDate: "2025-10-25",
    },
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "event-5",
    title: "Monday/Wednesday Pottery",
    activityId: activitiesFixture[1].id,
    locationId: locationsFixture[2].id,
    startDateTime: "2025-10-20T13:00:00.000Z",
    endDateTime: "2025-10-20T15:00:00.000Z",
    assignedStaffIds: [staffMembersFixture[6].id],
    assignedGroupIds: [],
    capacity: 12,
    recurrence: {
      frequency: "weekly",
      interval: 1,
      daysOfWeek: [1, 3], // Monday, Wednesday
      endDate: "2025-10-31",
    },
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "event-6",
    title: "Afternoon Kayaking",
    activityId: activitiesFixture[3].id,
    locationId: locationsFixture[4].id, // Boating Dock
    startDateTime: "2025-10-21T14:00:00.000Z",
    endDateTime: "2025-10-21T15:30:00.000Z",
    assignedStaffIds: [staffMembersFixture[2].id, staffMembersFixture[9].id],
    assignedGroupIds: [],
    capacity: 12,
    notes: "Life jackets required",
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "event-7",
    title: "Rock Climbing Session",
    activityId: activitiesFixture[5].id,
    locationId: locationsFixture[0].id,
    startDateTime: "2025-10-21T10:00:00.000Z",
    endDateTime: "2025-10-21T11:15:00.000Z",
    assignedStaffIds: [staffMembersFixture[6].id],
    assignedGroupIds: [],
    capacity: 10,
    notes: "Closed-toe shoes required",
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "event-8",
    title: "Crafts Time",
    activityId: activitiesFixture[7].id,
    locationId: locationsFixture[2].id,
    startDateTime: "2025-10-22T09:00:00.000Z",
    endDateTime: "2025-10-22T10:00:00.000Z",
    assignedStaffIds: [staffMembersFixture[8].id],
    assignedGroupIds: [],
    capacity: 20,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "event-9",
    title: "Morning Canoeing",
    activityId: activitiesFixture[8].id,
    locationId: locationsFixture[4].id,
    startDateTime: "2025-10-22T08:00:00.000Z",
    endDateTime: "2025-10-22T10:00:00.000Z",
    assignedStaffIds: [staffMembersFixture[9].id],
    assignedGroupIds: [],
    capacity: 16,
    notes: "Weather permitting",
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "event-10",
    title: "Survival Skills Workshop",
    activityId: activitiesFixture[9].id,
    locationId: locationsFixture[6].id, // Nature Center
    startDateTime: "2025-10-22T13:00:00.000Z",
    endDateTime: "2025-10-22T16:00:00.000Z",
    assignedStaffIds: [staffMembersFixture[0].id, staffMembersFixture[3].id],
    assignedGroupIds: [],
    capacity: 20,
    notes: "Ages 12+",
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  // Conflicting event (same time/location as event-1)
  {
    id: "event-11",
    title: "Conflicting Painting Session",
    activityId: activitiesFixture[0].id,
    locationId: locationsFixture[2].id, // Same as event-1
    startDateTime: "2025-10-20T09:30:00.000Z", // Overlaps with event-1
    endDateTime: "2025-10-20T11:00:00.000Z",
    assignedStaffIds: [staffMembersFixture[8].id],
    assignedGroupIds: [],
    capacity: 15,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  // Staff conflict (same staff as event-2)
  {
    id: "event-12",
    title: "Staff Conflict Swimming",
    activityId: activitiesFixture[2].id,
    locationId: locationsFixture[3].id,
    startDateTime: "2025-10-20T10:30:00.000Z", // Overlaps with event-2
    endDateTime: "2025-10-20T11:30:00.000Z",
    assignedStaffIds: [staffMembersFixture[2].id], // Same staff as event-2
    assignedGroupIds: [],
    capacity: 20,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
];

