/**
 * Sessions Service
 * Handles all camp session-related operations
 */

import type { Session } from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

class SessionsService {
  /**
   * Get all sessions
   */
  async getSessions(): Promise<Session[]> {
    return storageService.getAll<Session>(STORAGE_KEYS.SESSIONS);
  }

  /**
   * Get a session by ID
   */
  async getSession(id: string): Promise<Session | null> {
    return storageService.getById<Session>(STORAGE_KEYS.SESSIONS, id);
  }

  /**
   * Save a session (create or update)
   */
  async saveSession(session: Session): Promise<Session> {
    const updatedSession = { ...session, updatedAt: new Date().toISOString() };
    return storageService.save<Session>(STORAGE_KEYS.SESSIONS, updatedSession);
  }

  /**
   * Delete a session
   */
  async deleteSession(id: string): Promise<void> {
    return storageService.delete(STORAGE_KEYS.SESSIONS, id);
  }

  /**
   * Get active sessions (current or future)
   */
  async getActiveSessions(): Promise<Session[]> {
    const sessions = await this.getSessions();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return sessions.filter((s) => new Date(s.endDate) >= today);
  }

  /**
   * Get past sessions
   */
  async getPastSessions(): Promise<Session[]> {
    const sessions = await this.getSessions();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return sessions.filter((s) => new Date(s.endDate) < today);
  }

  /**
   * Get sessions within a date range
   */
  async getSessionsInRange(startDate: Date, endDate: Date): Promise<Session[]> {
    const sessions = await this.getSessions();
    return sessions.filter((s) => {
      const sessionStart = new Date(s.startDate);
      const sessionEnd = new Date(s.endDate);
      return sessionStart <= endDate && sessionEnd >= startDate;
    });
  }
}

export const sessionsService = new SessionsService();
