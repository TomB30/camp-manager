import type { Program } from "@/types";
import { colorsFixture } from "./colors.fixture";

export const programsFixture: Program[] = [
  {
    id: "program-1",
    name: "Arts & Crafts",
    description: "Creative arts program",
    colorId: colorsFixture[0].id,
    active: true,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "program-2",
    name: "Water Sports",
    description: "Swimming and boating activities",
    colorId: colorsFixture[1].id,
    active: true,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "program-3",
    name: "Outdoor Adventure",
    description: "Hiking, camping, and nature exploration",
    colorId: colorsFixture[2].id,
    active: true,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
];

