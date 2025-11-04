import type { Role } from "@/generated/api";

export const rolesFixture: Role[] = [
  {
    meta: {
      id: "role-1",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Counselor",
      description: "General camp counselor",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {},
  },
  {
    meta: {
      id: "role-2",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Activity Leader",
      description: "Leads specific activities",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {},
  },
  {
    meta: {
      id: "role-3",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Lifeguard",
      description: "Water safety supervisor",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {},
  },
  {
    meta: {
      id: "role-4",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Nurse",
      description: "Health and medical care",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {},
  },
  {
    meta: {
      id: "role-5",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Camp Director",
      description: "Overall camp management",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {},
  },
];
