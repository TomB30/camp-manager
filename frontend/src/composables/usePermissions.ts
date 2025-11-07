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
    scopeId?: string,
  ): boolean => {
    return authStore.hasPermission(action, scopeType, scopeId);
  };

  const canCreate = (_: string, scopeId?: string): boolean => {
    // For now, determine scope type from entity
    // In the future, this could be more sophisticated
    const scopeType: ScopeType = "camp"; // Most entities are camp-scoped
    return hasPermission("create", scopeType, scopeId);
  };

  const canEdit = (_: string, id: string): boolean => {
    const scopeType: ScopeType = "camp";
    return hasPermission("update", scopeType, id);
  };

  const canDelete = (_: string, id: string): boolean => {
    const scopeType: ScopeType = "camp";
    return hasPermission("delete", scopeType, id);
  };

  const canView = (_: string, id?: string): boolean => {
    const scopeType: ScopeType = "camp";
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
