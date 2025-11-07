import { defineStore } from "pinia";
import type { User } from "@/generated/api";

const AUTH_STORAGE_KEY = "camp_manager_auth";
const SELECTED_CAMP_KEY = "camp_manager_selected_camp";

// Mock users for development
const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: "user-system",
    email: "system@admin.com",
    password: "password",
    tenantId: "tenant-1",
    accessRules: [
      {
        role: "admin",
        scopeType: "system",
        scopeId: null,
      },
    ],
  },
  {
    id: "user-tenant-admin",
    email: "tenant@admin.com",
    password: "password",
    tenantId: "tenant-1",
    accessRules: [
      {
        role: "admin",
        scopeType: "tenant",
        scopeId: "tenant-1",
      },
    ],
  },
  {
    id: "user-camp-admin",
    email: "camp@admin.com",
    password: "password",
    tenantId: "tenant-1",
    accessRules: [
      {
        role: "admin",
        scopeType: "camp",
        scopeId: "camp-1",
      },
    ],
  },
  {
    id: "user-mixed",
    email: "mixed@user.com",
    password: "password",
    tenantId: "tenant-1",
    accessRules: [
      {
        role: "admin",
        scopeType: "camp",
        scopeId: "camp-1",
      },
      {
        role: "viewer",
        scopeType: "camp",
        scopeId: "camp-2",
      },
    ],
  },
  {
    id: "user-viewer",
    email: "viewer@camp.com",
    password: "password",
    tenantId: "tenant-1",
    accessRules: [
      {
        role: "viewer",
        scopeType: "camp",
        scopeId: "camp-1",
      },
    ],
  },
];

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
      // Mock login - validate against mock users
      const user = MOCK_USERS.find(
        (u) => u.email === email && u.password === password,
      );

      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Remove password from stored user
      const { password: _, ...userWithoutPassword } = user;
      this.currentUser = userWithoutPassword;

      // Save to localStorage
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));

      // Set initial selected camp if user has camp access
      const campIds = this.accessibleCampIds;
      if (campIds.length > 0) {
        this.setSelectedCamp(campIds[0]);
      }
    },

    async signup(
      email: string,
      _: string, // password is not used for now
      tenantId: string,
    ): Promise<void> {
      // Mock signup - in real implementation this would call the API
      const existingUser = MOCK_USERS.find((u) => u.email === email);

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Create new user with viewer access
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        tenantId,
        accessRules: [
          {
            role: "viewer",
            scopeType: "tenant",
            scopeId: tenantId,
          },
        ],
      };

      this.currentUser = newUser;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    },

    logout(): void {
      this.currentUser = null;
      this.selectedCampId = null;
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(SELECTED_CAMP_KEY);
    },

    checkAuth(): boolean {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored);

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
          this.logout();
          return false;
        }
      }
      return false;
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
