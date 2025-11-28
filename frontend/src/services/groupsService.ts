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
  listGroups: (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    filterBy?: string[];
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<
    | { items: Group[]; total: number; limit: number; offset: number; next: number | null }
    | Group[]
  > => impl().listGroups(params as any),
  createGroup: (data: GroupCreationRequest): Promise<Group> =>
    impl().createGroup(data),
  updateGroup: (id: string, data: GroupUpdateRequest): Promise<Group> =>
    impl().updateGroup(id, data),
  deleteGroup: (id: string): Promise<void> => impl().deleteGroup(id),
  getGroupById: (id: string): Promise<Group | null> => impl().getGroupById(id),
};
