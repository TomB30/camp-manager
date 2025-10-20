import { defineStore } from "pinia";
import type { Role } from "@/types";
import { rolesService } from "@/services/rolesService";

export const useRolesStore = defineStore("roles", {
  state: () => ({
    roles: [] as Role[],
  }),
  getters: {
    getRoleById(state): (id: string) => Role | undefined {
      return (id: string): Role | undefined => {
        return state.roles.find((r) => r.id === id);
      };
    },
  },
  actions: {
    async loadRoles(): Promise<void> {
      this.roles = await rolesService.getRoles();
    },
  },
});
