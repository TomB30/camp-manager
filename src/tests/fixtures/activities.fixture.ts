import type { Activity } from "@/types";
import { programsFixture } from "./programs.fixture";
import { certificationsFixture } from "./certifications.fixture";

export const activitiesFixture: Activity[] = [
  {
    id: "activity-1",
    name: "Painting Workshop",
    description: "Learn watercolor techniques",
    programIds: [programsFixture[0].id], // Arts & Crafts
    duration: 90,
    requiredCertificationIds: [],
    minStaff: 5,
    defaultCapacity: 15,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "activity-2",
    name: "Pottery Class",
    description: "Create ceramic pieces",
    programIds: [programsFixture[0].id],
    duration: 120,
    requiredCertificationIds: [],
    minStaff: 4,
    defaultCapacity: 12,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "activity-3",
    name: "Swimming Lessons",
    description: "Basic swimming instruction",
    programIds: [programsFixture[1].id], // Water Sports
    duration: 60,
    requiredCertificationIds: [certificationsFixture[2].id], // Lifeguard
    minStaff: 6,
    defaultCapacity: 20,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "activity-4",
    name: "Kayaking",
    description: "Kayaking on the lake",
    programIds: [programsFixture[1].id],
    duration: 90,
    requiredCertificationIds: [certificationsFixture[2].id],
    minStaff: 4,
    defaultCapacity: 12,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "activity-5",
    name: "Nature Hike",
    description: "Guided trail hike",
    programIds: [programsFixture[2].id], // Outdoor Adventure
    duration: 120,
    requiredCertificationIds: [certificationsFixture[1].id], // First Aid
    minStaff: 8,
    defaultCapacity: 25,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "activity-6",
    name: "Rock Climbing",
    description: "Indoor climbing wall",
    programIds: [programsFixture[2].id],
    duration: 75,
    requiredCertificationIds: [certificationsFixture[4].id], // Climbing Instructor
    minStaff: 4,
    defaultCapacity: 10,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "activity-7",
    name: "Archery",
    description: "Target practice with bows",
    programIds: [programsFixture[2].id],
    duration: 60,
    requiredCertificationIds: [certificationsFixture[3].id], // Archery Instructor
    minStaff: 5,
    defaultCapacity: 15,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "activity-8",
    name: "Crafts & Jewelry",
    description: "Make friendship bracelets and jewelry",
    programIds: [programsFixture[0].id],
    duration: 60,
    requiredCertificationIds: [],
    minStaff: 6,
    defaultCapacity: 20,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "activity-9",
    name: "Canoeing",
    description: "Canoe expedition",
    programIds: [programsFixture[1].id],
    duration: 120,
    requiredCertificationIds: [certificationsFixture[2].id],
    minStaff: 6,
    defaultCapacity: 16,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "activity-10",
    name: "Wilderness Survival",
    description: "Learn basic survival skills",
    programIds: [programsFixture[2].id],
    duration: 180,
    requiredCertificationIds: [certificationsFixture[1].id],
    minStaff: 8,
    defaultCapacity: 20,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
];
