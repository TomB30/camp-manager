import { useAuthStore } from "@/stores/authStore";
import type { ScopeType } from "@/generated/api";

/**
 * Composable for checking user permissions
 * This is a stub implementation that will be enhanced in the future
 */
export function usePermissions() {
  const authStore = useAuthStore();

  const hasPermission = (
    action: "create" | "read" | "update" | "delete",
    scopeType: ScopeType,
    scopeId?: string
  ): boolean => {
    return authStore.hasPermission(action, scopeType, scopeId);
  };

  const canCreate = (entity: string, scopeId?: string): boolean => {
    // For now, determine scope type from entity
    // In the future, this could be more sophisticated
    const scopeType: ScopeType = "CAMP"; // Most entities are camp-scoped
    return hasPermission("create", scopeType, scopeId);
  };

  const canEdit = (entity: string, id: string): boolean => {
    const scopeType: ScopeType = "CAMP";
    return hasPermission("update", scopeType, id);
  };

  const canDelete = (entity: string, id: string): boolean => {
    const scopeType: ScopeType = "CAMP";
    return hasPermission("delete", scopeType, id);
  };

  const canView = (entity: string, id?: string): boolean => {
    const scopeType: ScopeType = "CAMP";
    return hasPermission("read", scopeType, id);
  };

  return {
    hasPermission,
    canCreate,
    canEdit,
    canDelete,
    canView,
  };
}

