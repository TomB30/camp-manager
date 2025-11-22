/**
 * Backend API implementation for Sessions
 */
import * as sdk from '@/generated/api/sdk.gen';
import type {
  Session,
  SessionCreationRequest,
  SessionUpdateRequest,
} from '@/generated/api';
import { apiClient } from '@/config/api';

export const sessionsApi = {
  listSessions,
  createSession,
  updateSession,
  deleteSession,
  getSessionById,
};

async function listSessions(): Promise<Session[]> {
  const response = await sdk.listSessions({ client: apiClient });
  
  if (response.error) {
    throw new Error('Failed to fetch sessions');
  }
  
  return response.data?.items || [];
}

async function createSession(
  session: SessionCreationRequest,
): Promise<Session> {
  const response = await sdk.createSession({
    client: apiClient,
    body: session,
  });
  
  if (response.error || !response.data) {
    throw new Error('Failed to create session');
  }
  
  return response.data;
}

async function updateSession(
  id: string,
  session: SessionUpdateRequest,
): Promise<Session> {
  const response = await sdk.updateSessionById({
    client: apiClient,
    path: { id },
    body: session,
  });
  
  if (response.error || !response.data) {
    throw new Error('Failed to update session');
  }
  
  return response.data;
}

async function deleteSession(id: string): Promise<void> {
  const response = await sdk.deleteSessionById({
    client: apiClient,
    path: { id },
  });
  
  if (response.error) {
    throw new Error('Failed to delete session');
  }
}

async function getSessionById(id: string): Promise<Session | null> {
  const response = await sdk.getSessionById({
    client: apiClient,
    path: { id },
  });
  
  if (response.error) {
    return null;
  }
  
  return response.data || null;
}

