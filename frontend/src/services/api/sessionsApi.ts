/**
 * Backend API implementation for Sessions
 */
import * as sdk from "@/generated/api/sdk.gen";
import type {
  Session,
  SessionCreationRequest,
  SessionUpdateRequest,
} from "@/generated/api";
import { apiClient } from "@/config/api";
import { getApiCampId } from "@/utils/tenantContext";

export const sessionsApi = {
  listSessions,
  createSession,
  updateSession,
  deleteSession,
  getSessionById,
};

async function listSessions(): Promise<Session[]> {
  const response = await sdk.listSessions({
    client: apiClient,
    path: { camp_id: getApiCampId() },
  });

  if (response.error) {
    throw new Error("Failed to fetch sessions");
  }

  return response.data?.items || [];
}

async function createSession(
  session: SessionCreationRequest,
): Promise<Session> {
  const response = await sdk.createSession({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    body: session,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to create session");
  }

  return response.data;
}

async function updateSession(
  id: string,
  session: SessionUpdateRequest,
): Promise<Session> {
  const response = await sdk.updateSessionById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
    body: session,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to update session");
  }

  return response.data;
}

async function deleteSession(id: string): Promise<void> {
  const response = await sdk.deleteSessionById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    throw new Error("Failed to delete session");
  }
}

async function getSessionById(id: string): Promise<Session | null> {
  const response = await sdk.getSessionById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    return null;
  }

  return response.data || null;
}
