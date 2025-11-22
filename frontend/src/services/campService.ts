/**
 * Unified Camp Service
 * Routes to either backend API or local storage based on configuration
 */
import { isBackendEnabled } from '@/config/dataSource';
import { campStorage } from './campStorage';
import { campApi } from './api/campApi';
import type { Camp, CampUpdateRequest } from '@/generated/api';

const impl = () => isBackendEnabled() ? campApi : campStorage;

export const campService = {
  getCamp: (): Promise<Camp> => impl().getCamp(),
  updateCamp: (data: CampUpdateRequest): Promise<Camp> => impl().updateCamp(data),
  getCampsApi: (): Promise<Camp[]> => impl().getCampsApi(),
  // Keep initializeDefaultCamp only for localStorage mode
  initializeDefaultCamp: (): Promise<Camp> => {
    if (isBackendEnabled()) {
      throw new Error('initializeDefaultCamp is only available in localStorage mode');
    }
    return campStorage.initializeDefaultCamp();
  },
};

