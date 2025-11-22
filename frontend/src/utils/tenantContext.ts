/**
 * Tenant Context Utility
 * Provides access to current tenant and camp IDs for entity creation/updates
 */

import { useCampStore } from "@/stores/campStore";
import { useAuthStore } from "@/stores/authStore";
import { mockData } from "@/data/mockData";

/**
 * Get the current tenant ID
 * In a real application, this would come from authentication/session
 */
export function getCurrentTenantId(): string {
  const campStore = useCampStore();

  // Try to get from camp store first
  if (campStore.camp?.meta.tenantId) {
    return campStore.camp.meta.tenantId;
  }

  // Fallback to mock data tenant ID
  return mockData.camp.meta.tenantId;
}

/**
 * Get the current camp ID
 * In a real application, this might come from route params or user selection
 */
export function getCurrentCampId(): string {
  const campStore = useCampStore();

  // Try to get from camp store first
  if (campStore.camp?.meta.id) {
    return campStore.camp.meta.id;
  }

  // Fallback to mock data camp ID
  return mockData.camp.meta.id;
}

/**
 * Get both tenant and camp IDs as an object
 */
export function getTenantContext(): { tenantId: string; campId: string } {
  return {
    tenantId: getCurrentTenantId(),
    campId: getCurrentCampId(),
  };
}

/**
 * Get the current camp ID for API calls
 * Tries to get from authStore's selectedCampId first, then falls back to campStore
 */
export function getApiCampId(): string {
  const authStore = useAuthStore();

  // Try to get from auth store's selected camp
  if (authStore.selectedCampId) {
    return authStore.selectedCampId;
  }

  // Fall back to getCurrentCampId logic
  return getCurrentCampId();
}
