<template>
  <aside class="sidebar" :class="{ 'sidebar-mobile-open': isMobileOpen }">
    <div class="sidebar-content">
      <!-- Main Sidebar -->
      <template v-if="uiStore.sidebarMode === 'main'">
        <div class="logo">
          <Icon name="Sun" :size="20" class="logo-icon" />
          <h1>Summer Camp</h1>
        </div>

        <!-- Camp Selector (for users with multiple camp access) -->
        <div v-if="showCampSelector" class="camp-selector">
          <label for="camp-select" class="camp-selector-label">
            <Icon name="Building" :size="16" />
            <span>Active Camp</span>
          </label>
          <select
            id="camp-select"
            v-model="selectedCampId"
            @change="handleCampChange"
            class="camp-select"
          >
            <option
              v-for="camp in accessibleCamps"
              :key="camp.campId"
              :value="camp.campId"
            >
              {{ camp.campName }}
              <template v-if="getCampRole(camp.campId)">
                ({{ getRoleLabel(getCampRole(camp.campId)!) }})
              </template>
            </option>
          </select>
        </div>

        <nav class="nav">
          <RouterLink
            v-for="link in mainNavLinks"
            :key="link.path"
            :to="link.path"
            class="nav-link"
            @click="handleNavClick"
          >
            <Icon :name="link.icon" :size="20" class="nav-icon" />
            <span class="nav-text">{{ link.label }}</span>
          </RouterLink>
        </nav>

        <!-- Camp Settings (Bottom of Sidebar) -->
        <div class="settings-section">
          <div class="nav-link justify-between" @click="handleSettingsClick">
            <div class="row items-center gap-1">
              <Icon name="Settings" :size="20" class="nav-icon" />
              <span class="nav-text">Camp Settings</span>
            </div>
            <Icon name="ChevronRight" :size="20" class="nav-icon" />
          </div>
        </div>

        <!-- Logout Button -->
        <div class="nav-link" @click="handleLogout">
          <Icon name="LogOut" :size="20" />
          <span>Logout</span>
        </div>
      </template>

      <!-- Settings Sidebar -->
      <template v-else>
        <div class="q-px-md row items-center gap-1">
          <BaseButton
            round
            dense
            flat
            size="md"
            color="grey-8"
            @click="handleBackToMain"
          >
            <Icon name="ArrowLeft" :size="18" />
          </BaseButton>
          <h3>Camp Settings</h3>
        </div>

        <nav class="nav">
          <div
            v-for="category in settingsCategories"
            :key="category.label"
            class="settings-category"
          >
            <div
              class="category-label"
              :class="{ 'category-active': isCategoryActive(category) }"
              @click="toggleCategory(category.label)"
            >
              <Icon :name="category.icon" :size="16" />
              <span>{{ category.label }}</span>
              <Icon
                :name="
                  expandedCategories.has(category.label)
                    ? 'ChevronDown'
                    : 'ChevronRight'
                "
                :size="16"
                class="category-chevron"
              />
            </div>
            <Transition name="expand">
              <div
                v-show="expandedCategories.has(category.label)"
                class="category-links"
              >
                <RouterLink
                  v-for="link in category.links"
                  :key="link.path"
                  :to="link.path"
                  class="nav-link"
                  @click="handleNavClick"
                >
                  <Icon :name="link.icon" :size="20" class="nav-icon" />
                  <span class="nav-text">{{ link.label }}</span>
                </RouterLink>
              </div>
            </Transition>
          </div>
        </nav>
      </template>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useMainStore, useAuthStore, useUIStore } from "@/stores";
import Icon from "./Icon.vue";
import type { IconName } from "./Icon.vue";

// Mock camp data - will be replaced with API call in the future
const MOCK_CAMPS = [
  { campId: "camp-1", campName: "Summer Camp 2024" },
  { campId: "camp-2", campName: "Adventure Camp 2024" },
  { campId: "camp-3", campName: "Sports Camp 2024" },
];

interface NavLink {
  path: string;
  label: string;
  icon: IconName;
}

interface SettingsCategory {
  label: string;
  icon: IconName;
  links: NavLink[];
}

export default defineComponent({
  name: "Sidebar",
  components: {
    Icon,
  },
  props: {
    isMobileOpen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close"],
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const uiStore = useUIStore();

    const selectedCampId = ref(authStore.selectedCampId);
    const expandedCategories = ref<Set<string>>(new Set(["Date & Times"]));

    const mainNavLinks: NavLink[] = [
      { path: "/", label: "Dashboard", icon: "LayoutDashboard" },
      { path: "/calendar", label: "Calendar", icon: "Calendar" },
      { path: "/programs", label: "Programs", icon: "Boxes" },
      { path: "/groups", label: "Groups", icon: "FolderOpen" },
      { path: "/staff", label: "Staff", icon: "UsersRound" },
      { path: "/campers", label: "Campers", icon: "Users" },
    ];

    const settingsCategories: SettingsCategory[] = [
      {
        label: "Date & Times",
        icon: "Clock",
        links: [
          {
            path: "/settings/time-blocks",
            label: "Time Blocks",
            icon: "Clock",
          },
          {
            path: "/settings/sessions",
            label: "Sessions",
            icon: "CalendarDays",
          },
        ],
      },
      {
        label: "Areas & Locations",
        icon: "Map",
        links: [
          { path: "/settings/areas", label: "Areas", icon: "Map" },
          { path: "/settings/locations", label: "Locations", icon: "MapPin" },
          { path: "/settings/housing", label: "Housing", icon: "Bed" },
        ],
      },
      {
        label: "Roles & Certifications",
        icon: "Shield",
        links: [
          { path: "/settings/roles", label: "Roles", icon: "Shield" },
          {
            path: "/settings/certifications",
            label: "Certifications",
            icon: "Award",
          },
        ],
      },
      {
        label: "Appearance",
        icon: "Palette",
        links: [{ path: "/settings/colors", label: "Colors", icon: "Palette" }],
      },
    ];

    // Sync with auth store when it changes
    watch(
      () => authStore.selectedCampId,
      (newValue) => {
        selectedCampId.value = newValue;
      },
    );

    // Auto-expand category when navigating to a settings page
    watch(
      () => router.currentRoute.value.path,
      (newPath) => {
        if (newPath.startsWith("/settings")) {
          // Find which category contains this path
          const activeCategory = settingsCategories.find((category) =>
            category.links.some((link) => newPath.startsWith(link.path)),
          );
          if (
            activeCategory &&
            !expandedCategories.value.has(activeCategory.label)
          ) {
            expandedCategories.value.add(activeCategory.label);
            expandedCategories.value = new Set(expandedCategories.value);
          }
        }
      },
      { immediate: true },
    );

    const showCampSelector = computed(() => {
      const accessibleCampIds = authStore.getAccessibleCamps();
      // Show selector if user has specific camp access (not system/tenant admin)
      return accessibleCampIds.length > 0;
    });

    const accessibleCamps = computed(() => {
      const campIds = authStore.getAccessibleCamps();
      if (campIds.length === 0) {
        // System/Tenant admin - return all camps
        return MOCK_CAMPS;
      }
      // Return only accessible camps
      return MOCK_CAMPS.filter((camp) => campIds.includes(camp.campId));
    });

    const getCampRole = (campId: string): string | null => {
      return authStore.getRoleForCamp(campId);
    };

    const getRoleLabel = (roleId: string): string => {
      const roleLabels: Record<string, string> = {
        "role-system-admin": "System Admin",
        "role-tenant-admin": "Admin",
        "role-camp-admin": "Admin",
        "role-viewer": "Viewer",
      };
      return roleLabels[roleId] || roleId;
    };

    const handleCampChange = () => {
      if (selectedCampId.value) {
        authStore.setSelectedCamp(selectedCampId.value);
      }
    };

    const handleSettingsClick = () => {
      uiStore.toggleToSettings();
      router.push("/settings");
    };

    const handleBackToMain = () => {
      uiStore.toggleToMain();
      router.push("/");
    };

    const handleLogout = async () => {
      await authStore.logout();
      router.push("/login");
    };

    const toggleCategory = (categoryLabel: string) => {
      if (expandedCategories.value.has(categoryLabel)) {
        expandedCategories.value.delete(categoryLabel);
      } else {
        expandedCategories.value.add(categoryLabel);
      }
      // Force reactivity
      expandedCategories.value = new Set(expandedCategories.value);
    };

    const isCategoryActive = (category: SettingsCategory): boolean => {
      const currentPath = router.currentRoute.value.path;
      return category.links.some((link) => currentPath.startsWith(link.path));
    };

    return {
      uiStore,
      selectedCampId,
      showCampSelector,
      accessibleCamps,
      getCampRole,
      getRoleLabel,
      handleCampChange,
      handleSettingsClick,
      handleBackToMain,
      handleLogout,
      mainNavLinks,
      settingsCategories,
      expandedCategories,
      toggleCategory,
      isCategoryActive,
    };
  },
  computed: {
    mainStore() {
      return useMainStore();
    },
  },
  methods: {
    handleNavClick() {
      // Close mobile menu when a nav link is clicked (on mobile only)
      if (window.innerWidth <= 768) {
        this.$emit("close");
      }
    },
  },
});
</script>

<style scoped>
.sidebar {
  width: 220px;
  background: var(--surface);
  border-right: 1px solid var(--border-light);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  z-index: 100;
  box-shadow: var(--shadow);
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem 0;
}

.logo {
  padding: 0 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  color: var(--accent-color);
  flex-shrink: 0;
}

.logo h1 {
  font-size: 1.25rem;
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.camp-selector {
  padding: 0 1.5rem;
  margin-bottom: 1rem;
}

.camp-selector-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.camp-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: var(--surface-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.camp-select:hover {
  border-color: var(--accent-color);
}

.camp-select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.logout-btn {
  margin: 0.5rem 1rem 1rem;
  padding: 0.625rem 0.875rem;
  background: none;
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  transition: all 0.15s ease;
}

.logout-btn:hover {
  color: var(--error);
  border-color: var(--error);
  background: rgba(239, 68, 68, 0.05);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  padding: 0 0.5rem;
}

.nav-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
  padding: 0.75rem 0.875rem;
  border-radius: var(--radius);
  transition: all 0.15s ease;
}

.nav-icon {
  flex-shrink: 0;
}

.nav-text {
  flex: 1;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--surface-secondary);
}

.nav-link.router-link-active {
  color: var(--accent-color);
  background: #eff6ff;
}

.settings-section {
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  margin-top: auto;
}

.back-button-container {
  padding: 0 1rem;
  margin-bottom: 1.5rem;
}

.settings-header {
  padding: 0 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.settings-icon {
  color: var(--accent-color);
  flex-shrink: 0;
}

.settings-header h2 {
  font-size: 1.25rem;
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
}

.settings-category {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.category-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
  padding: 0.75rem 0.5rem;
  margin-top: 0.5rem;
  cursor: pointer;
  border-radius: var(--radius);
  transition: all 0.15s ease;
  user-select: none;
}

.category-label:hover {
  background: var(--surface-secondary);
  color: var(--text-primary);
}

.category-label.category-active {
  color: var(--accent-color);
}

.category-chevron {
  margin-left: auto;
  transition: transform 0.2s ease;
}

.category-links {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
}

/* Expand/Collapse Animation */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.conflicts-section {
  padding: 1rem 1.5rem;
}

.conflicts-badge {
  width: 100%;
}

.conflicts-badge .badge {
  width: 100%;
  justify-content: center;
  padding: 0.5rem;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: 280px;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 200;
    border-right: 1px solid var(--border-light);
    box-shadow: var(--shadow-lg);
  }

  .sidebar-mobile-open {
    transform: translateX(0);
  }

  .sidebar-content {
    padding: 1.5rem 0;
  }

  .logo {
    padding: 0 1.5rem;
    margin-bottom: 2rem;
  }

  .nav {
    padding: 0 1rem;
  }

  .settings-section {
    padding: 0.5rem 1rem;
    border-top: 1px solid var(--border-light);
    margin-top: auto;
  }

  .conflicts-section {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border-light);
  }
}
</style>
