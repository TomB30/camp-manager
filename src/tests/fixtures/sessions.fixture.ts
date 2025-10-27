import type { Session } from "@/types";

export const sessionsFixture: Session[] = [
  {
    meta: {
      id: "session-1",
      name: "Past Session",
      description: "A past session for testing",
      createdAt: "2025-09-01T09:00:00.000Z",
      updatedAt: "2025-09-01T09:00:00.000Z",
    },
    spec: {
      startDate: "2025-09-01",
      endDate: "2025-09-05",
    },
  },
  {
    meta: {
      id: "session-2",
      name: "Current Session",
      description: "The current active session",
      createdAt: "2025-09-01T09:00:00.000Z",
      updatedAt: "2025-09-01T09:00:00.000Z",
    },
    spec: {
      startDate: "2025-09-01",
      endDate: "2025-09-05",
    },
  },
  {
    meta: {
      id: "session-3",
      name: "Future Session",
      description: "An upcoming session",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {
      startDate: "2025-11-01",
      endDate: "2025-11-05",
    },
  },
];
