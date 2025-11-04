import type { HousingRoom } from "@/generated/api";

export const housingRoomsFixture: HousingRoom[] = [
  {
    meta: {
      id: "room-1",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Cabin A",
      description: "A cabin for 8 people",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 8,
      areaId: "area-1",
      bathroom: "shared",
    },
  },
  {
    meta: {
      id: "room-2",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Cabin B",
      description: "A cabin for 6 people",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 6,
      areaId: "area-1",
      bathroom: "shared",
    },
  },
  {
    meta: {
      id: "room-3",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Cabin C",
      description: "A cabin for 10 people",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 10,
      areaId: "area-2",
      bathroom: "shared",
    },
  },
  {
    meta: {
      id: "room-4",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
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
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Dorm 1",
      description: "A dorm for 12 people",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 12,
      areaId: "area-3",
      bathroom: "shared",
    },
  },
  {
    meta: {
      id: "room-6",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Dorm 2",
      description: "A dorm for 12 people",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 12,
      areaId: "area-3",
      bathroom: "shared",
    },
  },
  {
    meta: {
      id: "room-7",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Suite A",
      description: "A suite for 4 people",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 4,
      areaId: "area-4",
      bathroom: "private",
    },
  },
  {
    meta: {
      id: "room-8",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Suite B",
      description: "A suite for 4 people",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      beds: 4,
      areaId: "area-4",
      bathroom: "private",
    },
  },
];
