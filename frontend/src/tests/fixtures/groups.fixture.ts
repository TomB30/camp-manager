import type { Group } from "@/generated/api";
import { campersFixture } from "./campers.fixture";
import { staffMembersFixture } from "./staffMembers.fixture";
import { sessionsFixture } from "./sessions.fixture";
import { housingRoomsFixture } from "./housingRooms.fixture";

export const groupsFixture: Group[] = [
  // Family groups
  {
    meta: {
      id: "group-1",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Johnson Family",
      description: "Family group for siblings",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      camperIds: [campersFixture[0].meta.id], // Emma
      staffIds: [],
      sessionId: sessionsFixture[1].meta.id,
      housingRoomId: housingRoomsFixture[0].meta.id, // Cabin A (8 beds)
    },
  },
  {
    meta: {
      id: "group-2",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Smith-Williams Family",
      description: "Mixed family group",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      camperIds: [campersFixture[1].meta.id, campersFixture[2].meta.id], // Liam, Olivia
      staffIds: [],
      sessionId: sessionsFixture[1].meta.id,
      housingRoomId: housingRoomsFixture[1].meta.id, // Cabin B (6 beds)
    },
  },
  // Activity-based groups
  {
    meta: {
      id: "group-3",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Water Sports Enthusiasts",
      description: "Group for water activities",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      camperIds: [
        campersFixture[0].meta.id,
        campersFixture[5].meta.id,
        campersFixture[9].meta.id,
      ],
      staffIds: [staffMembersFixture[2].meta.id],
      sessionId: sessionsFixture[1].meta.id,
    },
  },
  {
    meta: {
      id: "group-4",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Arts Group",
      description: "Creative arts activities",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      camperIds: [
        campersFixture[2].meta.id,
        campersFixture[6].meta.id,
        campersFixture[14].meta.id,
      ],
      staffIds: [staffMembersFixture[1].meta.id],
      sessionId: sessionsFixture[1].meta.id,
    },
  },
  // Session groups
  {
    meta: {
      id: "group-5",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Current Session - All Campers",
      description: "All campers in current session",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      camperIds: [
        campersFixture[0].meta.id,
        campersFixture[1].meta.id,
        campersFixture[2].meta.id,
        campersFixture[5].meta.id,
        campersFixture[6].meta.id,
        campersFixture[9].meta.id,
        campersFixture[11].meta.id,
        campersFixture[14].meta.id,
      ],
      staffIds: [],
      sessionId: sessionsFixture[1].meta.id,
    },
  },
  // Group with housing - large group
  {
    meta: {
      id: "group-6",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Adventure Squad",
      description: "Outdoor adventure group with housing",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      camperIds: [
        campersFixture[3].meta.id,
        campersFixture[4].meta.id,
        campersFixture[7].meta.id,
        campersFixture[10].meta.id,
        campersFixture[12].meta.id,
        campersFixture[13].meta.id,
      ],
      staffIds: [staffMembersFixture[0].meta.id],
      sessionId: sessionsFixture[2].meta.id,
      housingRoomId: housingRoomsFixture[2].meta.id, // Cabin C (10 beds)
    },
  },
  // Group at exact capacity
  {
    meta: {
      id: "group-7",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Small Suite Group",
      description: "Group exactly at suite capacity",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      camperIds: [
        campersFixture[0].meta.id,
        campersFixture[1].meta.id,
        campersFixture[6].meta.id,
        campersFixture[8].meta.id,
      ],
      staffIds: [],
      sessionId: sessionsFixture[1].meta.id,
      housingRoomId: housingRoomsFixture[6].meta.id, // Suite A (4 beds)
    },
  },
  // Group with overlapping dates for conflict testing
  {
    meta: {
      id: "group-8",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Overlapping Dates Group",
      description: "Group with dates that will conflict",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      camperIds: [campersFixture[3].meta.id, campersFixture[7].meta.id],
      staffIds: [],
      sessionId: sessionsFixture[2].meta.id,
      housingRoomId: housingRoomsFixture[0].meta.id, // Same cabin as group-1 but different dates
    },
  },
];
