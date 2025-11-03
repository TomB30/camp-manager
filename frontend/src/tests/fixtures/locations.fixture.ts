import type { Location } from "@/generated/api";
import { areasFixture } from "./areas.fixture";

export const locationsFixture: Location[] = [
  // North Campus locations
  {
    meta: {
      id: "location-1",
      name: "Classroom A",
      description: "Main classroom",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      capacity: 25,
      areaId: areasFixture[0].meta.id,
      equipment: ["Projector", "Whiteboard"],
      notes: "Main classroom",
    },
  },
  {
    meta: {
      id: "location-2",
      name: "Classroom B",
      description: "Science lab",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      capacity: 25,
      areaId: areasFixture[0].meta.id,
      equipment: ["Projector", "Whiteboard"],
      notes: "Science lab",
    },
  },
  {
    meta: {
      id: "location-3",
      name: "Art Studio",
      description: "Creative space",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      capacity: 20,
      areaId: areasFixture[0].meta.id,
      equipment: ["Easels", "Paint supplies", "Clay"],
      notes: "Creative space",
    },
  },
  // Lakefront locations
  {
    meta: {
      id: "location-4",
      name: "Swimming Area",
      description: "Supervised swimming",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      capacity: 30,
      areaId: areasFixture[1].meta.id,
      equipment: ["Life jackets", "Floats"],
      notes: "Supervised swimming",
    },
  },
  {
    meta: {
      id: "location-5",
      name: "Boating Dock",
      description: "Water activities",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      capacity: 20,
      areaId: areasFixture[1].meta.id,
      equipment: ["Kayaks", "Canoes", "Paddles"],
      notes: "Water activities",
    },
  },
  // Forest Trail locations
  {
    meta: {
      id: "location-6",
      name: "North Trail Head",
      description: "Hiking start point",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      capacity: 25,
      areaId: areasFixture[2].meta.id,
      equipment: ["Trail maps", "First aid kit"],
      notes: "Hiking start point",
    },
  },
  {
    meta: {
      id: "location-7",
      name: "Nature Center",
      description: "Educational center",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      capacity: 30,
      areaId: areasFixture[2].meta.id,
      equipment: ["Microscopes", "Field guides", "Specimens"],
      notes: "Educational center",
    },
  },
  // Central Commons locations
  {
    meta: {
      id: "location-8",
      name: "Main Dining Hall",
      description: "Main meals",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      capacity: 150,
      areaId: areasFixture[3].meta.id,
      equipment: ["Tables", "Chairs", "Kitchen"],
      notes: "Main meals",
    },
  },
  {
    meta: {
      id: "location-9",
      name: "Assembly Hall",
      description: "Large gatherings",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      capacity: 200,
      areaId: areasFixture[3].meta.id,
      equipment: ["Stage", "Sound system", "Lights"],
      notes: "Large gatherings",
    },
  },
  // Sports Complex locations
  {
    meta: {
      id: "location-10",
      name: "Soccer Field",
      description: "Outdoor field",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      capacity: 40,
      areaId: areasFixture[4].meta.id,
      equipment: ["Soccer balls", "Goals", "Cones"],
      notes: "Outdoor field",
    },
  },
];
