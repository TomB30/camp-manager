/**
 * Sessions Service
 * Handles all camp session-related operations
 */

import type { CampSession } from '@/types';
import { storageService } from './storage';
import { STORAGE_KEYS } from './storageKeys';

class SessionsService {
  /**
   * Get all sessions
   */
  async getSessions(): Promise<CampSession[]> {
    return storageService.getAll<CampSession>(STORAGE_KEYS.SESSIONS);
  }

  /**
   * Get a session by ID
   */
  async getSession(id: string): Promise<CampSession | null> {
    return storageService.getById<CampSession>(STORAGE_KEYS.SESSIONS, id);
  }

  /**
   * Save a session (create or update)
   */
  async saveSession(session: CampSession): Promise<CampSession> {
    const updatedSession = { ...session, updatedAt: new Date().toISOString() };
    return storageService.save<CampSession>(STORAGE_KEYS.SESSIONS, updatedSession);
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
  async getActiveSessions(): Promise<CampSession[]> {
    const sessions = await this.getSessions();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return sessions.filter(s => new Date(s.endDate) >= today);
  }

  /**
   * Get past sessions
   */
  async getPastSessions(): Promise<CampSession[]> {
    const sessions = await this.getSessions();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return sessions.filter(s => new Date(s.endDate) < today);
  }

  /**
   * Get sessions within a date range
   */
  async getSessionsInRange(startDate: Date, endDate: Date): Promise<CampSession[]> {
    const sessions = await this.getSessions();
    return sessions.filter(s => {
      const sessionStart = new Date(s.startDate);
      const sessionEnd = new Date(s.endDate);
      return sessionStart <= endDate && sessionEnd >= startDate;
    });
  }
}

export const sessionsService = new SessionsService();

