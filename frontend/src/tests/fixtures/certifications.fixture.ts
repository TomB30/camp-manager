import type { Certification } from "@/generated/api";

export const certificationsFixture: Certification[] = [
  {
    meta: {
      id: "cert-1",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "CPR Certified",
      description: "Cardiopulmonary resuscitation certification",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {},
  },
  {
    meta: {
      id: "cert-2",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "First Aid",
      description: "Basic first aid training",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {},
  },
  {
    meta: {
      id: "cert-3",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Lifeguard",
      description: "Water safety and rescue certification",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {},
  },
  {
    meta: {
      id: "cert-4",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Archery Instructor",
      description: "Qualified to teach archery",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {},
  },
  {
    meta: {
      id: "cert-5",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Climbing Instructor",
      description: "Rock climbing and ropes course certification",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {},
  },
];
