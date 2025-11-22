/**
 * Unified Programs Service
 * Routes to either backend API or local storage based on configuration
 */
import { isBackendEnabled } from '@/config/dataSource';
import { programsStorage } from './programsStorage';
import { programsApi } from './api/programsApi';
import type {
  Program,
  ProgramCreationRequest,
  ProgramUpdateRequest,
} from '@/generated/api';

const impl = () => isBackendEnabled() ? programsApi : programsStorage;

export const programsService = {
  listPrograms: (): Promise<Program[]> => impl().listPrograms(),
  createProgram: (data: ProgramCreationRequest): Promise<Program> => impl().createProgram(data),
  updateProgram: (id: string, data: ProgramUpdateRequest): Promise<Program> => impl().updateProgram(id, data),
  deleteProgram: (id: string): Promise<void> => impl().deleteProgram(id),
  getProgramById: (id: string): Promise<Program | null> => impl().getProgramById(id),
};

