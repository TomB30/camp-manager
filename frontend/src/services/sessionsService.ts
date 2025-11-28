/**
 * Unified Sessions Service
 * Routes to either backend API or local storage based on configuration
 */
import { isBackendEnabled } from "@/config/dataSource";
import { sessionsStorage } from "./sessionsStorage";
import { sessionsApi } from "./api/sessionsApi";
import type {
  Session,
  SessionCreationRequest,
  SessionUpdateRequest,
} from "@/generated/api";

const impl = () => (isBackendEnabled() ? sessionsApi : sessionsStorage);

export const sessionsService = {
  listSessions: (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    filterBy?: string[];
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<
    | { items: Session[]; total: number; limit: number; offset: number; next: number | null }
    | Session[]
  > => impl().listSessions(params as any),
  createSession: (data: SessionCreationRequest): Promise<Session> =>
    impl().createSession(data),
  updateSession: (id: string, data: SessionUpdateRequest): Promise<Session> =>
    impl().updateSession(id, data),
  deleteSession: (id: string): Promise<void> => impl().deleteSession(id),
  getSessionById: (id: string): Promise<Session | null> =>
    impl().getSessionById(id),
};
