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
    async loadRoles(): Promise<void> {
      this.loading = true;
      try {
        this.roles = await rolesService.listRoles();
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
