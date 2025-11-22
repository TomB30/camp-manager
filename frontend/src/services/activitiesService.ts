/**
 * Unified Activities Service
 * Routes to either backend API or local storage based on configuration
 */
import { isBackendEnabled } from "@/config/dataSource";
import { activitiesStorage } from "./activitiesStorage";
import { activitiesApi } from "./api/activitiesApi";
import type {
  Activity,
  ActivityCreationRequest,
  ActivityUpdateRequest,
} from "@/generated/api";

const impl = () => (isBackendEnabled() ? activitiesApi : activitiesStorage);

export const activitiesService = {
  listActivities: (): Promise<Activity[]> => impl().listActivities(),
  createActivity: (data: ActivityCreationRequest): Promise<Activity> =>
    impl().createActivity(data),
  updateActivity: (
    id: string,
    data: ActivityUpdateRequest,
  ): Promise<Activity> => impl().updateActivity(id, data),
  deleteActivity: (id: string): Promise<void> => impl().deleteActivity(id),
  getActivityById: (id: string): Promise<Activity | null> =>
    impl().getActivityById(id),
};
