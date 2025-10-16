import { defineStore } from 'pinia';
import type { CampSession } from '@/types';
import { sessionsService } from '@/services';

export const useSessionsStore = defineStore('sessions', {
  state: () => ({
    sessions: [] as CampSession[],
    loading: false,
  }),

  getters: {
    getSessionById(state): (id: string) => CampSession | undefined {
      return (id: string): CampSession | undefined => {
        return state.sessions.find(s => s.id === id);
      };
    },

    activeSessions(state): CampSession[] {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return state.sessions.filter(s => new Date(s.endDate) >= today);
    },

    pastSessions(state): CampSession[] {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return state.sessions.filter(s => new Date(s.endDate) < today);
    },
  },

  actions: {
    async loadSessions(): Promise<void> {
      this.loading = true;
      try {
        this.sessions = await sessionsService.getSessions();
      } finally {
        this.loading = false;
      }
    },

    async addSession(session: CampSession): Promise<void> {
      await sessionsService.saveSession(session);
      this.sessions.push(session);
    },

    async updateSession(session: CampSession): Promise<void> {
      await sessionsService.saveSession(session);
      const index = this.sessions.findIndex(s => s.id === session.id);
      if (index >= 0) {
        this.sessions[index] = session;
      }
    },

    async deleteSession(id: string): Promise<void> {
      await sessionsService.deleteSession(id);
      this.sessions = this.sessions.filter(s => s.id !== id);
    },
  }
});

