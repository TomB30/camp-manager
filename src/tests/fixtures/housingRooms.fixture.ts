import type { HousingRoom } from "@/generated/api";

export const housingRoomsFixture: HousingRoom[] = [
  {
    meta: {
      id: "room-1",
      name: "Cabin A",
      description: "A cabin for 8 people",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 8,
      areaId: "area-1",
    },
  },
  {
    meta: {
      id: "room-2",
      name: "Cabin B",
      description: "A cabin for 6 people",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 6,
      areaId: "area-1",
    },
  },
  {
    meta: {
      id: "room-3",
      name: "Cabin C",
      description: "A cabin for 10 people",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 10,
      areaId: "area-2",
    },
  },
  {
    meta: {
      id: "room-4",
      name: "Cabin D",
      description: "A cabin for 8 people",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 8,
      areaId: "area-2",
    },
  },
  {
    meta: {
      id: "room-5",
      name: "Dorm 1",
      description: "A dorm for 12 people",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 12,
      areaId: "area-3",
    },
  },
  {
    meta: {
      id: "room-6",
      name: "Dorm 2",
      description: "A dorm for 12 people",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 12,
      areaId: "area-3",
    },
  },
  {
    meta: {
      id: "room-7",
      name: "Suite A",
      description: "A suite for 4 people",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 4,
      areaId: "area-4",
    },
  },
  {
    meta: {
      id: "room-8",
      name: "Suite B",
      description: "A suite for 4 people",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 4,
      areaId: "area-4",
    },
  },
];
