import { defineStore } from "pinia";
import type {
  Session,
  SessionCreationRequest,
  SessionUpdateRequest,
} from "@/generated/api";
import { sessionsService } from "@/services";

export const useSessionsStore = defineStore("sessions", {
  state: () => ({
    sessions: [] as Session[],
    loading: false,
  }),

  getters: {
    getSessionById(state): (id: string) => Session | undefined {
      return (id: string): Session | undefined => {
        return state.sessions.find((s) => s.meta.id === id);
      };
    },

    activeSessions(state): Session[] {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return state.sessions.filter((s) => new Date(s.spec.endDate) >= today);
    },

    pastSessions(state): Session[] {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return state.sessions.filter((s) => new Date(s.spec.endDate) < today);
    },
  },

  actions: {
    async loadSessions(): Promise<void> {
      this.loading = true;
      try {
        this.sessions = await sessionsService.listSessions();
      } finally {
        this.loading = false;
      }
    },

    async createSession(
      sessionRequest: SessionCreationRequest,
    ): Promise<Session> {
      const session = await sessionsService.createSession(sessionRequest);
      this.sessions.push(session);
      return session;
    },

    async updateSession(
      sessionId: string,
      sessionUpdate: SessionUpdateRequest,
    ): Promise<void> {
      const session = await sessionsService.updateSession(
        sessionId,
        sessionUpdate,
      );
      const index = this.sessions.findIndex((s) => s.meta.id === sessionId);
      if (index >= 0) {
        this.sessions[index] = session;
      }
    },

    async deleteSession(sessionId: string): Promise<void> {
      await sessionsService.deleteSession(sessionId);
      this.sessions = this.sessions.filter((s) => s.meta.id !== sessionId);
    },
  },
});
