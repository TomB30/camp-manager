import type { Program } from "@/types";
import { colorsFixture } from "./colors.fixture";

export const programsFixture: Program[] = [
  {
    meta: {
      id: "program-1",
      name: "Arts & Crafts",
      description: "Creative arts program",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      colorId: colorsFixture[0].meta.id,
      activityIds: [],
      staffMemberIds: [],
      locationIds: [],
    },
  },
  {
    meta: {
      id: "program-2",
      name: "Water Sports",
      description: "Swimming and boating activities",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      colorId: colorsFixture[1].meta.id,
      activityIds: [],
      staffMemberIds: [],
      locationIds: [],
    },
  },
  {
    meta: {
      id: "program-3",
      name: "Outdoor Adventure",
      description: "Hiking, camping, and nature exploration",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      colorId: colorsFixture[2].meta.id,
      activityIds: [],
      staffMemberIds: [],
      locationIds: [],
    },
  },
];
