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

async function listSessions(params?: {
  limit?: number;
  offset?: number;
  search?: string;
  filterBy?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{
  items: Session[];
  total: number;
  limit: number;
  offset: number;
  next: number | null;
}> {
  const response = await sdk.listSessions({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    query: params
      ? {
          limit: params.limit,
          offset: params.offset,
          search: params.search,
          filterBy: params.filterBy,
          sortBy: params.sortBy as any,
          sortOrder: params.sortOrder,
        }
      : undefined,
  });

  if (response.error) {
    throw new Error("Failed to fetch sessions");
  }

  return {
    items: response.data?.items || [],
    total: response.data?.total || 0,
    limit: response.data?.limit || 50,
    offset: response.data?.offset || 0,
    next: response.data?.next ?? null,
  };
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
