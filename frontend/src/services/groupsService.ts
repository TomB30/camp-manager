/**
 * Unified Groups Service
 * Routes to either backend API or local storage based on configuration
 */
import { isBackendEnabled } from "@/config/dataSource";
import { groupsStorage } from "./groupsStorage";
import { groupsApi } from "./api/groupsApi";
import type {
  Group,
  GroupCreationRequest,
  GroupUpdateRequest,
} from "@/generated/api";

const impl = () => (isBackendEnabled() ? groupsApi : groupsStorage);

export const groupsService = {
  listGroups: (): Promise<Group[]> => impl().listGroups(),
  createGroup: (data: GroupCreationRequest): Promise<Group> =>
    impl().createGroup(data),
  updateGroup: (id: string, data: GroupUpdateRequest): Promise<Group> =>
    impl().updateGroup(id, data),
  deleteGroup: (id: string): Promise<void> => impl().deleteGroup(id),
  getGroupById: (id: string): Promise<Group | null> => impl().getGroupById(id),
};
