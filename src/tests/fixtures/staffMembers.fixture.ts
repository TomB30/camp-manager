import type { StaffMember } from "@/types";
import { rolesFixture } from "./roles.fixture";
import { certificationsFixture } from "./certifications.fixture";

export const staffMembersFixture: StaffMember[] = [
  {
    meta: {
      id: "staff-1",
      name: "Sarah Johnson",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      // firstName: "Sarah",
      // lastName: "Johnson",
      email: "sarah.johnson@camp.com",
      phone: "555-1001",
      roleId: rolesFixture[0].meta.id, // Counselor
      certificationIds: [
        certificationsFixture[0].meta.id, // CPR
        certificationsFixture[1].meta.id, // First Aid
      ],
    },
  },
  {
    meta: {
      id: "staff-2",
      name: "Michael Chen",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      // firstName: "Michael",
      // lastName: "Chen",
      email: "michael.chen@camp.com",
      phone: "555-1002",
      roleId: rolesFixture[1].meta.id, // Activity Leader
      certificationIds: [
        certificationsFixture[0].meta.id, // CPR
        certificationsFixture[3].meta.id, // Archery
      ],
    },
  },
  {
    meta: {
      id: "staff-3",
      name: "Emily Rodriguez",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      // firstName: "Emily",
      // lastName: "Rodriguez",
      email: "emily.rodriguez@camp.com",
      phone: "555-1003",
      roleId: rolesFixture[2].meta.id, // Lifeguard
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
      name: "David Kim",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      // firstName: "David",
      // lastName: "Kim",
      email: "david.kim@camp.com",
      phone: "555-1004",
      roleId: rolesFixture[0].meta.id,
      certificationIds: [
        certificationsFixture[0].meta.id, // CPR
      ],
    },
  },
  {
    meta: {
      id: "staff-5",
      name: "Jessica Lee",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      // firstName: "Jessica",
      // lastName: "Lee",
      email: "jessica.lee@camp.com",
      phone: "555-1005",
      roleId: rolesFixture[3].meta.id, // Nurse
      certificationIds: [
        certificationsFixture[0].meta.id, // CPR
        certificationsFixture[1].meta.id, // First Aid
      ],
    },
  },
  {
    meta: {
      id: "staff-6",
      name: "Robert Taylor",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      // firstName: "Robert",
      // lastName: "Taylor",
      email: "robert.taylor@camp.com",
      phone: "555-1006",
      roleId: rolesFixture[4].meta.id, // Camp Director
      certificationIds: [
        certificationsFixture[0].meta.id, // CPR
      ],
    },
  },
  {
    meta: {
      id: "staff-7",
      name: "Amanda White",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      // firstName: "Amanda",
      // lastName: "White",
      email: "amanda.white@camp.com",
      phone: "555-1007",
      roleId: rolesFixture[1].meta.id,
      certificationIds: [
        certificationsFixture[0].meta.id, // CPR
        certificationsFixture[4].meta.id, // Climbing
      ],
    },
  },
  {
    meta: {
      id: "staff-8",
      name: "Christopher Martin",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      // firstName: "Christopher",
      // lastName: "Martin",
      email: "christopher.martin@camp.com",
      phone: "555-1008",
      roleId: rolesFixture[0].meta.id,
      certificationIds: [],
    },
  },
  {
    meta: {
      id: "staff-9",
      name: "Jennifer Thompson",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      // firstName: "Jennifer",
      // lastName: "Thompson",
      email: "jennifer.thompson@camp.com",
      phone: "555-1009",
      roleId: rolesFixture[1].meta.id,
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
      name: "Daniel Garcia",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      // firstName: "Daniel",
      // lastName: "Garcia",
      email: "daniel.garcia@camp.com",
      phone: "555-1010",
      roleId: rolesFixture[2].meta.id,
      certificationIds: [
        certificationsFixture[2].meta.id, // Lifeguard
      ],
    },
  },
];
