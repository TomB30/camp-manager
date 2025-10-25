import type {
  Session,
  SessionCreationRequest,
  SessionUpdateRequest,
} from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export const sessionsService = {
  listSessions,
  createSession,
  updateSession,
  deleteSession,
  getSessionById,
  getActiveSessions,
  getPastSessions,
  getSessionsInRange,
};

async function listSessions(): Promise<Session[]> {
  return storageService.getAll<Session>(STORAGE_KEYS.SESSIONS);
}

async function createSession(
  session: SessionCreationRequest,
): Promise<Session> {
  const newSession = {
    ...session,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return storageService.save<Session>(STORAGE_KEYS.SESSIONS, newSession);
}

async function updateSession(
  id: string,
  session: SessionUpdateRequest,
): Promise<Session> {
  const existingSession = await storageService.getById<Session>(
    STORAGE_KEYS.SESSIONS,
    id,
  );
  if (!existingSession) {
    throw new Error(`Session with id ${id} not found`);
  }
  const updatedSession = {
    ...existingSession,
    ...session,
    updatedAt: new Date().toISOString(),
  };
  return storageService.save<Session>(STORAGE_KEYS.SESSIONS, updatedSession);
}

async function deleteSession(id: string): Promise<void> {
  return storageService.delete(STORAGE_KEYS.SESSIONS, id);
}

async function getSessionById(id: string): Promise<Session | null> {
  return storageService.getById<Session>(STORAGE_KEYS.SESSIONS, id);
}

async function getActiveSessions(): Promise<Session[]> {
  const sessions = await listSessions();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return sessions.filter((s) => new Date(s.endDate) >= today);
}

async function getPastSessions(): Promise<Session[]> {
  const sessions = await listSessions();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return sessions.filter((s) => new Date(s.endDate) < today);
}

async function getSessionsInRange(
  startDate: Date,
  endDate: Date,
): Promise<Session[]> {
  const sessions = await listSessions();
  return sessions.filter((s) => {
    const sessionStart = new Date(s.startDate);
    const sessionEnd = new Date(s.endDate);
    return sessionStart <= endDate && sessionEnd >= startDate;
  });
}
