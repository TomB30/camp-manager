/**
 * Backend API implementation for Programs
 */
import * as sdk from '@/generated/api/sdk.gen';
import type {
  Program,
  ProgramCreationRequest,
  ProgramUpdateRequest,
} from '@/generated/api';
import { apiClient } from '@/config/api';

export const programsApi = {
  listPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramById,
};

async function listPrograms(): Promise<Program[]> {
  const response = await sdk.listPrograms({ client: apiClient });
  
  if (response.error) {
    throw new Error('Failed to fetch programs');
  }
  
  return response.data?.items || [];
}

async function createProgram(
  program: ProgramCreationRequest,
): Promise<Program> {
  const response = await sdk.createProgram({
    client: apiClient,
    body: program,
  });
  
  if (response.error || !response.data) {
    throw new Error('Failed to create program');
  }
  
  return response.data;
}

async function updateProgram(
  id: string,
  program: ProgramUpdateRequest,
): Promise<Program> {
  const response = await sdk.updateProgramById({
    client: apiClient,
    path: { id },
    body: program,
  });
  
  if (response.error || !response.data) {
    throw new Error('Failed to update program');
  }
  
  return response.data;
}

async function deleteProgram(id: string): Promise<void> {
  const response = await sdk.deleteProgramById({
    client: apiClient,
    path: { id },
  });
  
  if (response.error) {
    throw new Error('Failed to delete program');
  }
}

async function getProgramById(id: string): Promise<Program | null> {
  const response = await sdk.getProgramById({
    client: apiClient,
    path: { id },
  });
  
  if (response.error) {
    return null;
  }
  
  return response.data || null;
}

