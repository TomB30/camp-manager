import { defineStore } from "pinia";
import type {
  Role,
  RoleCreationRequest,
  RoleUpdateRequest,
} from "@/generated/api";
import { rolesService } from "@/services/rolesService";

export const useRolesStore = defineStore("roles", {
  state: () => ({
    roles: [] as Role[],
    loading: false,
  }),
  getters: {
    getRoleById(state): (id: string) => Role | undefined {
      return (id: string): Role | undefined => {
        return state.roles.find((r) => r.meta.id === id);
      };
    },
  },
  actions: {
    async loadRoles(params?: {
      limit?: number;
      offset?: number;
      search?: string;
      filterBy?: string[];
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }): Promise<
      | Role[]
      | {
          items: Role[];
          total: number;
          limit: number;
          offset: number;
          next: number | null;
        }
    > {
      this.loading = true;
      try {
        const response = await rolesService.listRoles(params);
        this.roles = Array.isArray(response) ? response : response.items;
        return response;
      } finally {
        this.loading = false;
      }
    },

    async loadRolesPaginated(params?: {
      limit?: number;
      offset?: number;
      search?: string;
      filterBy?: string[];
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }): Promise<{
      items: Role[];
      total: number;
      limit: number;
      offset: number;
      next: number | null;
    }> {
      this.loading = true;
      try {
        const response = await rolesService.listRoles(params);
        if (Array.isArray(response)) {
          return {
            items: response,
            total: response.length,
            limit: params?.limit || response.length,
            offset: params?.offset || 0,
            next: null,
          };
        }
        this.roles = response.items;
        return response;
      } finally {
        this.loading = false;
      }
    },

    async createRole(roleRequest: RoleCreationRequest): Promise<Role> {
      const role: Role = await rolesService.createRole(roleRequest);
      this.roles.push(role);
      return role;
    },

    async updateRole(id: string, roleUpdate: RoleUpdateRequest): Promise<void> {
      const role: Role = await rolesService.updateRole(id, roleUpdate);
      const index = this.roles.findIndex((r) => r.meta.id === id);
      if (index >= 0) {
        this.roles[index] = role;
      }
    },

    async deleteRole(id: string): Promise<void> {
      await rolesService.deleteRole(id);
      this.roles = this.roles.filter((r) => r.meta.id !== id);
    },
  },
});
