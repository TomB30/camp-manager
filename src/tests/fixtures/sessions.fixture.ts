import type { Session } from "@/types";

export const sessionsFixture: Session[] = [
  {
    id: "session-1",
    name: "Past Session",
    startDate: "2025-09-01",
    endDate: "2025-09-05",
    description: "A past session for testing",
    maxCampers: 40,
    createdAt: "2025-09-01T09:00:00.000Z",
  },
  {
    id: "session-2",
    name: "Current Session",
    startDate: "2025-10-20",
    endDate: "2025-10-25",
    description: "The current active session",
    maxCampers: 45,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
  {
    id: "session-3",
    name: "Future Session",
    startDate: "2025-11-01",
    endDate: "2025-11-05",
    description: "An upcoming session",
    maxCampers: 50,
    createdAt: "2025-10-01T09:00:00.000Z",
  },
];

