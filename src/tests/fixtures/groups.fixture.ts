import type { Group } from "@/types";
import { campersFixture } from "./campers.fixture";
import { staffMembersFixture } from "./staffMembers.fixture";
import { sessionsFixture } from "./sessions.fixture";
import { housingRoomsFixture } from "./housingRooms.fixture";

export const groupsFixture: Group[] = [
  // Family groups
  {
    id: "group-1",
    name: "Johnson Family",
    description: "Family group for siblings",
    camperIds: [campersFixture[0].id], // Emma
    staffIds: [],
    sessionId: sessionsFixture[1].id,
    housingRoomId: housingRoomsFixture[0].id, // Cabin A (8 beds)
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "group-2",
    name: "Smith-Williams Family",
    description: "Mixed family group",
    camperIds: [campersFixture[1].id, campersFixture[2].id], // Liam, Olivia
    staffIds: [],
    sessionId: sessionsFixture[1].id,
    housingRoomId: housingRoomsFixture[1].id, // Cabin B (6 beds)
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  // Activity-based groups
  {
    id: "group-3",
    name: "Water Sports Enthusiasts",
    description: "Group for water activities",
    camperIds: [
      campersFixture[0].id,
      campersFixture[5].id,
      campersFixture[9].id,
    ],
    staffIds: [staffMembersFixture[2].id],
    sessionId: sessionsFixture[1].id,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "group-4",
    name: "Arts Group",
    description: "Creative arts activities",
    camperIds: [
      campersFixture[2].id,
      campersFixture[6].id,
      campersFixture[14].id,
    ],
    staffIds: [staffMembersFixture[1].id],
    sessionId: sessionsFixture[1].id,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  // Session groups
  {
    id: "group-5",
    name: "Current Session - All Campers",
    description: "All campers in current session",
    camperIds: [
      campersFixture[0].id,
      campersFixture[1].id,
      campersFixture[2].id,
      campersFixture[5].id,
      campersFixture[6].id,
      campersFixture[9].id,
      campersFixture[11].id,
      campersFixture[14].id,
    ],
    staffIds: [],
    sessionId: sessionsFixture[1].id,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  // Group with housing - large group
  {
    id: "group-6",
    name: "Adventure Squad",
    description: "Outdoor adventure group with housing",
    camperIds: [
      campersFixture[3].id,
      campersFixture[4].id,
      campersFixture[7].id,
      campersFixture[10].id,
      campersFixture[12].id,
      campersFixture[13].id,
    ],
    staffIds: [staffMembersFixture[0].id],
    sessionId: sessionsFixture[2].id,
    housingRoomId: housingRoomsFixture[2].id, // Cabin C (10 beds)
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  // Group at exact capacity
  {
    id: "group-7",
    name: "Small Suite Group",
    description: "Group exactly at suite capacity",
    camperIds: [
      campersFixture[0].id,
      campersFixture[1].id,
      campersFixture[6].id,
      campersFixture[8].id,
    ],
    staffIds: [],
    sessionId: sessionsFixture[1].id,
    housingRoomId: housingRoomsFixture[6].id, // Suite A (4 beds)
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  // Group with overlapping dates for conflict testing
  {
    id: "group-8",
    name: "Overlapping Dates Group",
    description: "Group with dates that will conflict",
    camperIds: [campersFixture[3].id, campersFixture[7].id],
    staffIds: [],
    sessionId: sessionsFixture[2].id,
    housingRoomId: housingRoomsFixture[0].id, // Same cabin as group-1 but different dates
    createdAt: "2025-10-01T09:00:00.000Z",
  },
];

