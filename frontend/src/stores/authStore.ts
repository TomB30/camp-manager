import { defineStore } from "pinia";
import type { User } from "@/generated/api";
import { authService } from "@/services";

const SELECTED_CAMP_KEY = "camp_manager_selected_camp";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    currentUser: null as User | null,
    selectedCampId: null as string | null,
  }),

  getters: {
    isAuthenticated(state): boolean {
      return state.currentUser !== null;
    },

    accessibleCampIds(state): string[] {
      if (!state.currentUser) return [];

      const campIds = new Set<string>();

      for (const rule of state.currentUser.accessRules) {
        if (rule.scopeType === "camp" && rule.scopeId) {
          campIds.add(rule.scopeId);
        } else if (rule.scopeType === "tenant" || rule.scopeType === "system") {
          // Tenant and system admins have access to all camps
          // We'll need to get this from the camps store in the future
          // For now, return empty to indicate "all camps"
          return [];
        }
      }

      return Array.from(campIds);
    },

    currentCampRole(state): string | null {
      if (!state.currentUser || !state.selectedCampId) return null;

      // Check for direct camp access
      const campRule = state.currentUser.accessRules.find(
        (rule) =>
          rule.scopeType === "camp" && rule.scopeId === state.selectedCampId,
      );

      if (campRule) {
        return campRule.role;
      }

      // Check for tenant-level access
      const tenantRule = state.currentUser.accessRules.find(
        (rule) => rule.scopeType === "tenant",
      );

      if (tenantRule) {
        return tenantRule.role;
      }

      // Check for system-level access
      const systemRule = state.currentUser.accessRules.find(
        (rule) => rule.scopeType === "system",
      );

      if (systemRule) {
        return systemRule.role;
      }

      return null;
    },

    hasSystemAccess(state): boolean {
      if (!state.currentUser) return false;
      return state.currentUser.accessRules.some(
        (rule) => rule.scopeType === "system",
      );
    },

    hasTenantAccess(state): boolean {
      if (!state.currentUser) return false;
      return state.currentUser.accessRules.some(
        (rule) => rule.scopeType === "tenant" || rule.scopeType === "system",
      );
    },
  },

  actions: {
    async login(email: string, password: string): Promise<void> {
      // Use authService which routes to backend API or localStorage based on mode
      const response = await authService.login({
        email,
        password,
      });

      // Set current user from response
      this.currentUser = response.user;

      // Set initial selected camp if user has camp access
      const campIds = this.accessibleCampIds;
      if (campIds.length > 0) {
        this.setSelectedCamp(campIds[0]);
      }
    },

    async signup(
      email: string,
      password: string,
      tenantId: string,
    ): Promise<void> {
      // Use authService which routes to backend API or localStorage based on mode
      const response = await authService.signup({
        email,
        password,
        tenantId,
      });

      // Set current user from response
      this.currentUser = response.user;
    },

    async logout(): Promise<void> {
      // Use authService which routes to backend API or localStorage based on mode
      await authService.logout();

      // Clear local state
      this.currentUser = null;
      this.selectedCampId = null;
      localStorage.removeItem(SELECTED_CAMP_KEY);
    },

    async checkAuth(): Promise<boolean> {
      // Check if user is authenticated using authService
      if (!authService.isAuthenticated()) {
        return false;
      }

      try {
        // Get current user from service
        this.currentUser = await authService.getCurrentUser();

        // Restore selected camp
        const selectedCamp = localStorage.getItem(SELECTED_CAMP_KEY);
        if (selectedCamp) {
          this.selectedCampId = selectedCamp;
        } else {
          // Set initial selected camp if user has camp access
          const campIds = this.accessibleCampIds;
          if (campIds.length > 0) {
            this.setSelectedCamp(campIds[0]);
          }
        }

        return true;
      } catch (e) {
        // Invalid stored data, clear it
        await this.logout();
        return false;
      }
    },

    setSelectedCamp(campId: string): void {
      this.selectedCampId = campId;
      localStorage.setItem(SELECTED_CAMP_KEY, campId);
    },

    getAccessibleCamps(): string[] {
      return this.accessibleCampIds;
    },

    hasPermission(
      action: "create" | "read" | "update" | "delete",
      scopeType: "system" | "tenant" | "camp",
      scopeId?: string,
    ): boolean {
      // Stub for future implementation
      if (!this.currentUser) return false;

      // System admins have all permissions
      if (this.hasSystemAccess) return true;

      // Tenant admins have all permissions within their tenant
      if (
        this.hasTenantAccess &&
        (scopeType === "tenant" || scopeType === "camp")
      ) {
        return true;
      }

      // Check specific camp access
      if (scopeType === "camp" && scopeId) {
        const campRule = this.currentUser.accessRules.find(
          (rule) => rule.scopeType === "camp" && rule.scopeId === scopeId,
        );

        if (campRule) {
          // Viewers can only read
          if (campRule.role === "viewer") {
            return action === "read";
          }
          // Camp admins have all permissions for their camp
          return true;
        }
      }

      return false;
    },

    getRoleForCamp(campId: string): string | null {
      if (!this.currentUser) return null;

      // Check for system access
      if (this.hasSystemAccess) return "admin";

      // Check for tenant access
      if (this.hasTenantAccess) return "admin";

      // Check for specific camp access
      const campRule = this.currentUser.accessRules.find(
        (rule) => rule.scopeType === "camp" && rule.scopeId === campId,
      );

      return campRule ? campRule.role : null;
    },
  },
});
