import type { StaffMember } from "@/types";
import { rolesFixture } from "./roles.fixture";
import { certificationsFixture } from "./certifications.fixture";

export const staffMembersFixture: StaffMember[] = [
  {
    id: "staff-1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@camp.com",
    phone: "555-1001",
    roleId: rolesFixture[0].id, // Counselor
    certifications: [
      {
        certificationId: certificationsFixture[0].id, // CPR
        obtainedDate: "2024-01-15",
        expirationDate: "2026-01-15",
      },
      {
        certificationId: certificationsFixture[1].id, // First Aid
        obtainedDate: "2024-01-15",
        expirationDate: "2025-01-15",
      },
    ],
    availability: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" },
    ],
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "staff-2",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@camp.com",
    phone: "555-1002",
    roleId: rolesFixture[1].id, // Activity Leader
    certifications: [
      {
        certificationId: certificationsFixture[0].id,
        obtainedDate: "2024-03-20",
        expirationDate: "2026-03-20",
      },
      {
        certificationId: certificationsFixture[3].id, // Archery
        obtainedDate: "2023-05-10",
      },
    ],
    availability: [
      { dayOfWeek: 1, startTime: "08:00", endTime: "16:00" },
      { dayOfWeek: 3, startTime: "08:00", endTime: "16:00" },
      { dayOfWeek: 5, startTime: "08:00", endTime: "16:00" },
    ],
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "staff-3",
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@camp.com",
    phone: "555-1003",
    roleId: rolesFixture[2].id, // Lifeguard
    certifications: [
      {
        certificationId: certificationsFixture[0].id,
        obtainedDate: "2024-02-01",
        expirationDate: "2026-02-01",
      },
      {
        certificationId: certificationsFixture[1].id,
        obtainedDate: "2024-02-01",
        expirationDate: "2025-02-01",
      },
      {
        certificationId: certificationsFixture[2].id, // Lifeguard
        obtainedDate: "2024-06-01",
        expirationDate: "2025-06-01",
      },
    ],
    availability: [
      { dayOfWeek: 1, startTime: "10:00", endTime: "18:00" },
      { dayOfWeek: 2, startTime: "10:00", endTime: "18:00" },
      { dayOfWeek: 3, startTime: "10:00", endTime: "18:00" },
      { dayOfWeek: 4, startTime: "10:00", endTime: "18:00" },
    ],
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "staff-4",
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@camp.com",
    phone: "555-1004",
    roleId: rolesFixture[0].id,
    certifications: [
      {
        certificationId: certificationsFixture[0].id,
        obtainedDate: "2024-04-10",
        expirationDate: "2026-04-10",
      },
    ],
    availability: [
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 6, startTime: "09:00", endTime: "17:00" },
    ],
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "staff-5",
    firstName: "Jessica",
    lastName: "Lee",
    email: "jessica.lee@camp.com",
    phone: "555-1005",
    roleId: rolesFixture[3].id, // Nurse
    certifications: [
      {
        certificationId: certificationsFixture[0].id,
        obtainedDate: "2023-12-01",
        expirationDate: "2025-12-01",
      },
      {
        certificationId: certificationsFixture[1].id,
        obtainedDate: "2023-12-01",
        expirationDate: "2024-12-01",
      },
    ],
    availability: [
      { dayOfWeek: 1, startTime: "07:00", endTime: "19:00" },
      { dayOfWeek: 2, startTime: "07:00", endTime: "19:00" },
      { dayOfWeek: 3, startTime: "07:00", endTime: "19:00" },
      { dayOfWeek: 4, startTime: "07:00", endTime: "19:00" },
      { dayOfWeek: 5, startTime: "07:00", endTime: "19:00" },
      { dayOfWeek: 6, startTime: "07:00", endTime: "19:00" },
      { dayOfWeek: 0, startTime: "07:00", endTime: "19:00" },
    ],
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "staff-6",
    firstName: "Robert",
    lastName: "Taylor",
    email: "robert.taylor@camp.com",
    phone: "555-1006",
    roleId: rolesFixture[4].id, // Camp Director
    certifications: [
      {
        certificationId: certificationsFixture[0].id,
        obtainedDate: "2022-01-01",
        expirationDate: "2024-01-01",
      },
    ],
    availability: [
      { dayOfWeek: 1, startTime: "08:00", endTime: "18:00" },
      { dayOfWeek: 2, startTime: "08:00", endTime: "18:00" },
      { dayOfWeek: 3, startTime: "08:00", endTime: "18:00" },
      { dayOfWeek: 4, startTime: "08:00", endTime: "18:00" },
      { dayOfWeek: 5, startTime: "08:00", endTime: "18:00" },
    ],
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "staff-7",
    firstName: "Amanda",
    lastName: "White",
    email: "amanda.white@camp.com",
    phone: "555-1007",
    roleId: rolesFixture[1].id,
    certifications: [
      {
        certificationId: certificationsFixture[0].id,
        obtainedDate: "2024-05-15",
        expirationDate: "2026-05-15",
      },
      {
        certificationId: certificationsFixture[4].id, // Climbing
        obtainedDate: "2023-08-20",
        expirationDate: "2026-08-20",
      },
    ],
    availability: [
      { dayOfWeek: 1, startTime: "10:00", endTime: "18:00" },
      { dayOfWeek: 3, startTime: "10:00", endTime: "18:00" },
      { dayOfWeek: 5, startTime: "10:00", endTime: "18:00" },
    ],
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "staff-8",
    firstName: "Christopher",
    lastName: "Martin",
    email: "christopher.martin@camp.com",
    phone: "555-1008",
    roleId: rolesFixture[0].id,
    certifications: [],
    availability: [
      { dayOfWeek: 0, startTime: "09:00", endTime: "17:00" },
      { dayOfWeek: 6, startTime: "09:00", endTime: "17:00" },
    ],
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "staff-9",
    firstName: "Jennifer",
    lastName: "Thompson",
    email: "jennifer.thompson@camp.com",
    phone: "555-1009",
    roleId: rolesFixture[1].id,
    certifications: [
      {
        certificationId: certificationsFixture[0].id,
        obtainedDate: "2024-07-01",
        expirationDate: "2026-07-01",
      },
      {
        certificationId: certificationsFixture[1].id,
        obtainedDate: "2024-07-01",
        expirationDate: "2025-07-01",
      },
    ],
    availability: [
      { dayOfWeek: 2, startTime: "08:00", endTime: "16:00" },
      { dayOfWeek: 4, startTime: "08:00", endTime: "16:00" },
      { dayOfWeek: 6, startTime: "08:00", endTime: "16:00" },
    ],
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "staff-10",
    firstName: "Daniel",
    lastName: "Garcia",
    email: "daniel.garcia@camp.com",
    phone: "555-1010",
    roleId: rolesFixture[2].id,
    certifications: [
      {
        certificationId: certificationsFixture[2].id,
        obtainedDate: "2024-05-01",
        expirationDate: "2025-05-01",
      },
    ],
    availability: [
      { dayOfWeek: 1, startTime: "11:00", endTime: "19:00" },
      { dayOfWeek: 3, startTime: "11:00", endTime: "19:00" },
      { dayOfWeek: 5, startTime: "11:00", endTime: "19:00" },
      { dayOfWeek: 0, startTime: "11:00", endTime: "19:00" },
    ],
    createdAt: "2025-10-01T09:00:00.000Z",
  },
];

