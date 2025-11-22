/**
 * Unified Campers Service
 * Routes to either backend API or local storage based on configuration
 */
import { isBackendEnabled } from '@/config/dataSource';
import { campersStorage } from './campersStorage';
import { campersApi } from './api/campersApi';
import type {
  Camper,
  CamperCreationRequest,
  CamperUpdateRequest,
} from '@/generated/api';

const impl = () => isBackendEnabled() ? campersApi : campersStorage;

export const campersService = {
  listCampers: (): Promise<Camper[]> => impl().listCampers(),
  createCamper: (data: CamperCreationRequest): Promise<Camper> => impl().createCamper(data),
  updateCamper: (id: string, data: CamperUpdateRequest): Promise<Camper> => impl().updateCamper(id, data),
  deleteCamper: (id: string): Promise<void> => impl().deleteCamper(id),
  getCamperById: (id: string): Promise<Camper | null> => impl().getCamperById(id),
  getCampersByFamilyGroup: (housingGroupId: string): Promise<Camper[]> => impl().getCampersByFamilyGroup(housingGroupId),
  getCampersBySession: (sessionId: string): Promise<Camper[]> => impl().getCampersBySession(sessionId),
};

