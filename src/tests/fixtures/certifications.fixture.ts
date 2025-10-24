import type { Certification } from "@/types";

export const certificationsFixture: Certification[] = [
  {
    id: "cert-1",
    name: "CPR Certified",
    description: "Cardiopulmonary resuscitation certification",
    expirationRequired: true,
    validityPeriodMonths: 24,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "cert-2",
    name: "First Aid",
    description: "Basic first aid training",
    expirationRequired: true,
    validityPeriodMonths: 12,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "cert-3",
    name: "Lifeguard",
    description: "Water safety and rescue certification",
    expirationRequired: true,
    validityPeriodMonths: 12,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "cert-4",
    name: "Archery Instructor",
    description: "Qualified to teach archery",
    expirationRequired: false,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "cert-5",
    name: "Climbing Instructor",
    description: "Rock climbing and ropes course certification",
    expirationRequired: true,
    validityPeriodMonths: 36,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
];

