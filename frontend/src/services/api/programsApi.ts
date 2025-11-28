/**
 * Backend API implementation for Programs
 */
import * as sdk from "@/generated/api/sdk.gen";
import type {
  Program,
  ProgramCreationRequest,
  ProgramUpdateRequest,
} from "@/generated/api";
import { apiClient } from "@/config/api";
import { getApiCampId } from "@/utils/tenantContext";

export const programsApi = {
  listPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramById,
};

async function listPrograms(params?: {
  limit?: number;
  offset?: number;
  search?: string;
  filterBy?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{
  items: Program[];
  total: number;
  limit: number;
  offset: number;
  next: number | null;
}> {
  const response = await sdk.listPrograms({
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
    throw new Error("Failed to fetch programs");
  }

  return {
    items: response.data?.items || [],
    total: response.data?.total || 0,
    limit: response.data?.limit || 50,
    offset: response.data?.offset || 0,
    next: response.data?.next ?? null,
  };
}

async function createProgram(
  program: ProgramCreationRequest,
): Promise<Program> {
  const response = await sdk.createProgram({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    body: program,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to create program");
  }

  return response.data;
}

async function updateProgram(
  id: string,
  program: ProgramUpdateRequest,
): Promise<Program> {
  const response = await sdk.updateProgramById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
    body: program,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to update program");
  }

  return response.data;
}

async function deleteProgram(id: string): Promise<void> {
  const response = await sdk.deleteProgramById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    throw new Error("Failed to delete program");
  }
}

async function getProgramById(id: string): Promise<Program | null> {
  const response = await sdk.getProgramById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    return null;
  }

  return response.data || null;
}
