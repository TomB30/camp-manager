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
    certificationIds: [
      certificationsFixture[0].id, // CPR
      certificationsFixture[1].id, // First Aid
    ],
  },
  {
    id: "staff-2",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@camp.com",
    phone: "555-1002",
    roleId: rolesFixture[1].id, // Activity Leader
    certificationIds: [
      certificationsFixture[0].id, // CPR
      certificationsFixture[3].id, // Archery
    ],
  },
  {
    id: "staff-3",
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@camp.com",
    phone: "555-1003",
    roleId: rolesFixture[2].id, // Lifeguard
    certificationIds: [
      certificationsFixture[0].id, // CPR
      certificationsFixture[1].id, // First Aid
      certificationsFixture[2].id, // Lifeguard
    ],
  },
  {
    id: "staff-4",
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@camp.com",
    phone: "555-1004",
    roleId: rolesFixture[0].id,
    certificationIds: [
      certificationsFixture[0].id, // CPR
    ],
  },
  {
    id: "staff-5",
    firstName: "Jessica",
    lastName: "Lee",
    email: "jessica.lee@camp.com",
    phone: "555-1005",
    roleId: rolesFixture[3].id, // Nurse
    certificationIds: [
      certificationsFixture[0].id, // CPR
      certificationsFixture[1].id, // First Aid
    ],
  },
  {
    id: "staff-6",
    firstName: "Robert",
    lastName: "Taylor",
    email: "robert.taylor@camp.com",
    phone: "555-1006",
    roleId: rolesFixture[4].id, // Camp Director
    certificationIds: [
      certificationsFixture[0].id, // CPR
    ],    
  },
  {
    id: "staff-7",
    firstName: "Amanda",
    lastName: "White",
    email: "amanda.white@camp.com",
    phone: "555-1007",
    roleId: rolesFixture[1].id,
    certificationIds: [
      certificationsFixture[0].id, // CPR
      certificationsFixture[4].id, // Climbing
    ],
  },
  {
    id: "staff-8",
    firstName: "Christopher",
    lastName: "Martin",
    email: "christopher.martin@camp.com",
    phone: "555-1008",
    roleId: rolesFixture[0].id,
    certificationIds: [],
  },
  {
    id: "staff-9",
    firstName: "Jennifer",
    lastName: "Thompson",
    email: "jennifer.thompson@camp.com",
    phone: "555-1009",
    roleId: rolesFixture[1].id,
    certificationIds: [
      certificationsFixture[0].id, // CPR
      certificationsFixture[1].id, // First Aid
      certificationsFixture[2].id, // Lifeguard
    ],
  },
  {
    id: "staff-10",
    firstName: "Daniel",
    lastName: "Garcia",
    email: "daniel.garcia@camp.com",
    phone: "555-1010",
    roleId: rolesFixture[2].id,
    certificationIds: [
      certificationsFixture[2].id, // Lifeguard
    ],
  },
];

