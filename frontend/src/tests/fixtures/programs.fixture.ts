import type { Program } from "@/generated/api";
import { colorsFixture } from "./colors.fixture";

export const programsFixture: Program[] = [
  {
    meta: {
      id: "program-1",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Arts & Crafts",
      description: "Creative arts program",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      colorId: colorsFixture[0].meta.id,
      activityIds: [],
      staffGroupIds: [],
      locationIds: [],
    },
  },
  {
    meta: {
      id: "program-2",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Water Sports",
      description: "Swimming and boating activities",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      colorId: colorsFixture[1].meta.id,
      activityIds: [],
      staffGroupIds: [],
      locationIds: [],
    },
  },
  {
    meta: {
      id: "program-3",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Outdoor Adventure",
      description: "Hiking, camping, and nature exploration",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      colorId: colorsFixture[2].meta.id,
      activityIds: [],
      staffGroupIds: [],
      locationIds: [],
    },
  },
];
