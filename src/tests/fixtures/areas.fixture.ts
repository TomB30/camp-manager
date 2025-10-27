import type { Area } from "@/types";

export const areasFixture: Area[] = [
  {
    meta: {
      id: "area-1",
      name: "North Campus",
      description: "Main activity area with classrooms and sports facilities",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      type: "facility",
      capacity: 150,
      equipment: ["Tables", "Chairs", "Whiteboards", "Projectors"],
      notes: "Primary area for structured activities",
    },
  },
  {
    meta: {
      id: "area-2",
      name: "Lakefront",
      description: "Waterfront area for aquatic activities",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      type: "water",
      capacity: 60,
      equipment: ["Kayaks", "Life jackets", "Canoes", "Swimming platforms"],
      notes: "Requires lifeguard certification",
    },
  },
  {
    meta: {
      id: "area-3",
      name: "Forest Trail",
      description: "Outdoor adventure area with hiking trails",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      type: "outdoor",
      capacity: 80,
      equipment: ["Trail markers", "First aid stations", "Binoculars"],
      notes: "Great for nature exploration",
    },
  },
  {
    meta: {
      id: "area-4",
      name: "Central Commons",
      description: "Indoor gathering space and dining area",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      type: "indoor",
      capacity: 200,
      equipment: ["Tables", "Chairs", "Kitchen facilities", "Stage"],
      notes: "Main dining and assembly area",
    },
  },
  {
    meta: {
      id: "area-5",
      name: "Sports Complex",
      description: "Athletic fields and courts",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      type: "field",
      capacity: 100,
      equipment: ["Balls", "Goals", "Nets", "Cones"],
      notes: "Various sports activities",
    },
  },
];
