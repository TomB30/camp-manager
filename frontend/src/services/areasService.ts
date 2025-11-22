/**
 * Unified Areas Service
 * Routes to either backend API or local storage based on configuration
 */
import { isBackendEnabled } from '@/config/dataSource';
import { areasStorage } from './areasStorage';
import { areasApi } from './api/areasApi';
import type {
  Area,
  AreaCreationRequest,
  AreaUpdateRequest,
} from '@/generated/api';

const impl = () => isBackendEnabled() ? areasApi : areasStorage;

export const areasService = {
  listAreas: (): Promise<Area[]> => impl().listAreas(),
  createArea: (data: AreaCreationRequest): Promise<Area> => impl().createArea(data),
  updateArea: (id: string, data: AreaUpdateRequest): Promise<Area> => impl().updateArea(id, data),
  deleteArea: (id: string): Promise<void> => impl().deleteArea(id),
  getAreaById: (id: string): Promise<Area | null> => impl().getAreaById(id),
};

