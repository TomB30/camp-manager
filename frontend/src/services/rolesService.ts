/**
 * Unified Roles Service
 * Routes to either backend API or local storage based on configuration
 */
import { isBackendEnabled } from "@/config/dataSource";
import { rolesStorage } from "./rolesStorage";
import { rolesApi } from "./api/rolesApi";
import type {
  Role,
  RoleCreationRequest,
  RoleUpdateRequest,
} from "@/generated/api";

const impl = () => (isBackendEnabled() ? rolesApi : rolesStorage);

export const rolesService = {
  listRoles: (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    filterBy?: string[];
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<
    | {
        items: Role[];
        total: number;
        limit: number;
        offset: number;
        next: number | null;
      }
    | Role[]
  > => impl().listRoles(params as any),
  createRole: (data: RoleCreationRequest): Promise<Role> =>
    impl().createRole(data),
  updateRole: (id: string, data: RoleUpdateRequest): Promise<Role> =>
    impl().updateRole(id, data),
  deleteRole: (id: string): Promise<void> => impl().deleteRole(id),
  getRoleById: (id: string): Promise<Role | null> => impl().getRoleById(id),
};
