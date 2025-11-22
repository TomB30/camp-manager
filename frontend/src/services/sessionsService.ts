/**
 * Unified Sessions Service
 * Routes to either backend API or local storage based on configuration
 */
import { isBackendEnabled } from '@/config/dataSource';
import { sessionsStorage } from './sessionsStorage';
import { sessionsApi } from './api/sessionsApi';
import type {
  Session,
  SessionCreationRequest,
  SessionUpdateRequest,
} from '@/generated/api';

const impl = () => isBackendEnabled() ? sessionsApi : sessionsStorage;

export const sessionsService = {
  listSessions: (): Promise<Session[]> => impl().listSessions(),
  createSession: (data: SessionCreationRequest): Promise<Session> => impl().createSession(data),
  updateSession: (id: string, data: SessionUpdateRequest): Promise<Session> => impl().updateSession(id, data),
  deleteSession: (id: string): Promise<void> => impl().deleteSession(id),
  getSessionById: (id: string): Promise<Session | null> => impl().getSessionById(id),
};

