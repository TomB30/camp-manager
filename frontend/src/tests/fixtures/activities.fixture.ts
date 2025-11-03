import type { Activity } from "@/generated/api";
import { programsFixture } from "./programs.fixture";
import { certificationsFixture } from "./certifications.fixture";

export const activitiesFixture: Activity[] = [
  {
    meta: {
      id: "activity-1",
      name: "Painting Workshop",
      description: "Learn watercolor techniques",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      programIds: [programsFixture[0].meta.id], // Arts & Crafts
      duration: 90,
      requiredCertificationIds: [],
      minStaff: 5,
      defaultCapacity: 15,
    },
  },
  {
    meta: {
      id: "activity-2",
      name: "Pottery Class",
      description: "Create ceramic pieces",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      programIds: [programsFixture[0].meta.id],
      duration: 120,
      requiredCertificationIds: [],
      minStaff: 4,
      defaultCapacity: 12,
    },
  },
  {
    meta: {
      id: "activity-3",
      name: "Swimming Lessons",
      description: "Basic swimming instruction",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      programIds: [programsFixture[1].meta.id], // Water Sports
      duration: 60,
      requiredCertificationIds: [certificationsFixture[2].meta.id], // Lifeguard
      minStaff: 6,
      defaultCapacity: 20,
    },
  },
  {
    meta: {
      id: "activity-4",
      name: "Kayaking",
      description: "Kayaking on the lake",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      programIds: [programsFixture[1].meta.id],
      duration: 90,
      requiredCertificationIds: [certificationsFixture[2].meta.id],
      minStaff: 4,
      defaultCapacity: 12,
    },
  },
  {
    meta: {
      id: "activity-5",
      name: "Nature Hike",
      description: "Guided trail hike",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      programIds: [programsFixture[2].meta.id], // Outdoor Adventure
      duration: 120,
      requiredCertificationIds: [certificationsFixture[1].meta.id], // First Aid
      minStaff: 8,
      defaultCapacity: 25,
    },
  },
  {
    meta: {
      id: "activity-6",
      name: "Rock Climbing",
      description: "Indoor climbing wall",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      programIds: [programsFixture[2].meta.id],
      duration: 75,
      requiredCertificationIds: [certificationsFixture[4].meta.id], // Climbing Instructor
      minStaff: 4,
      defaultCapacity: 10,
    },
  },
  {
    meta: {
      id: "activity-7",
      name: "Archery",
      description: "Target practice with bows",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      programIds: [programsFixture[2].meta.id],
      duration: 60,
      requiredCertificationIds: [certificationsFixture[3].meta.id], // Archery Instructor
      minStaff: 5,
      defaultCapacity: 15,
    },
  },
  {
    meta: {
      id: "activity-8",
      name: "Crafts & Jewelry",
      description: "Make friendship bracelets and jewelry",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      programIds: [programsFixture[0].meta.id],
      duration: 60,
      requiredCertificationIds: [],
      minStaff: 6,
      defaultCapacity: 20,
    },
  },
  {
    meta: {
      id: "activity-9",
      name: "Canoeing",
      description: "Canoe expedition",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      programIds: [programsFixture[1].meta.id],
      duration: 120,
      requiredCertificationIds: [certificationsFixture[2].meta.id],
      minStaff: 6,
      defaultCapacity: 16,
    },
  },
  {
    meta: {
      id: "activity-10",
      name: "Wilderness Survival",
      description: "Learn basic survival skills",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      programIds: [programsFixture[2].meta.id],
      duration: 180,
      requiredCertificationIds: [certificationsFixture[1].meta.id],
      minStaff: 8,
      defaultCapacity: 20,
    },
  },
];
