import type {
  Session,
  SessionCreationRequest,
  SessionUpdateRequest,
} from "@/generated/api";
import { storageService } from "./storage";
import { getCurrentTenantId, getCurrentCampId } from "@/utils/tenantContext";
import { STORAGE_KEYS } from "./storageKeys";

export const sessionsStorage = {
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
    meta: {
      id: crypto.randomUUID(),
      tenantId: getCurrentTenantId(),
      campId: getCurrentCampId(),
      name: session.meta.name,
      description: session.meta.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
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
    meta: {
      id: existingSession.meta.id,
      tenantId: existingSession.meta.tenantId,
      campId: existingSession.meta.campId,
      name: session.meta.name,
      description: session.meta.description,
      createdAt: existingSession.meta.createdAt,
      updatedAt: new Date().toISOString(),
    },
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

  return sessions.filter((s) => new Date(s.spec.endDate) >= today);
}

async function getPastSessions(): Promise<Session[]> {
  const sessions = await listSessions();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return sessions.filter((s) => new Date(s.spec.endDate) < today);
}

async function getSessionsInRange(
  startDate: Date,
  endDate: Date,
): Promise<Session[]> {
  const sessions = await listSessions();
  return sessions.filter((s) => {
    const sessionStart = new Date(s.spec.startDate);
    const sessionEnd = new Date(s.spec.endDate);
    return sessionStart <= endDate && sessionEnd >= startDate;
  });
}
