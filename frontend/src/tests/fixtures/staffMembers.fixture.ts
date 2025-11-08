import type { StaffMember } from "@/generated/api";
import { rolesFixture } from "./roles.fixture";
import { certificationsFixture } from "./certifications.fixture";

export const staffMembersFixture: StaffMember[] = [
  {
    meta: {
      id: "staff-1",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Sarah Johnson",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      phone: "555-1001",
      roleId: rolesFixture[0].meta.id, // Counselor
      birthday: "2000-01-01",
      gender: "female",
      certificationIds: [
        certificationsFixture[0].meta.id, // CPR
        certificationsFixture[1].meta.id, // First Aid
      ],
    },
  },
  {
    meta: {
      id: "staff-2",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Michael Chen",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      phone: "555-1002",
      roleId: rolesFixture[1].meta.id, // Activity Leader
      birthday: "2000-01-01",
      gender: "male",
      certificationIds: [
        certificationsFixture[0].meta.id, // CPR
        certificationsFixture[3].meta.id, // Archery
      ],
    },
  },
  {
    meta: {
      id: "staff-3",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Emily Rodriguez",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      phone: "555-1003",
      roleId: rolesFixture[2].meta.id, // Lifeguard
      birthday: "2000-01-01",
      gender: "female",
      certificationIds: [
        certificationsFixture[0].meta.id, // CPR
        certificationsFixture[1].meta.id, // First Aid
        certificationsFixture[2].meta.id, // Lifeguard
      ],
    },
  },
  {
    meta: {
      id: "staff-4",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "David Kim",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      phone: "555-1004",
      roleId: rolesFixture[0].meta.id,
      birthday: "2000-01-01",
      gender: "male",
      certificationIds: [
        certificationsFixture[0].meta.id, // CPR
      ],
    },
  },
  {
    meta: {
      id: "staff-5",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Jessica Lee",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      phone: "555-1005",
      roleId: rolesFixture[3].meta.id, // Nurse
      birthday: "2000-01-01",
      gender: "female",
      certificationIds: [
        certificationsFixture[0].meta.id, // CPR
        certificationsFixture[1].meta.id, // First Aid
      ],
    },
  },
  {
    meta: {
      id: "staff-6",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Robert Taylor",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      phone: "555-1006",
      roleId: rolesFixture[4].meta.id, // Camp Director
      birthday: "2000-01-01",
      gender: "male",
      certificationIds: [
        certificationsFixture[0].meta.id, // CPR
      ],
    },
  },
  {
    meta: {
      id: "staff-7",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Amanda White",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      phone: "555-1007",
      roleId: rolesFixture[1].meta.id,
      birthday: "2000-01-01",
      gender: "female",
      certificationIds: [
        certificationsFixture[0].meta.id, // CPR
        certificationsFixture[4].meta.id, // Climbing
      ],
    },
  },
  {
    meta: {
      id: "staff-8",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Christopher Martin",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      phone: "555-1008",
      roleId: rolesFixture[0].meta.id,
      birthday: "2000-01-01",
      gender: "male",
      certificationIds: [],
    },
  },
  {
    meta: {
      id: "staff-9",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Jennifer Thompson",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      phone: "555-1009",
      roleId: rolesFixture[1].meta.id,
      birthday: "2000-01-01",
      gender: "female",
      certificationIds: [
        certificationsFixture[0].meta.id, // CPR
        certificationsFixture[1].meta.id, // First Aid
        certificationsFixture[2].meta.id, // Lifeguard
      ],
    },
  },
  {
    meta: {
      id: "staff-10",
      tenantId: "00000000-0000-0000-0000-000000000001",
      campId: "00000000-0000-0000-0000-000000000002",
      name: "Daniel Garcia",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      phone: "555-1010",
      roleId: rolesFixture[2].meta.id,
      birthday: "2000-01-01",
      gender: "female",
      certificationIds: [
        certificationsFixture[2].meta.id, // Lifeguard
      ],
    },
  },
];
