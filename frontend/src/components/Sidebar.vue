<template>
  <aside class="sidebar" :class="{ 'sidebar-mobile-open': isMobileOpen }">
    <div class="sidebar-content">
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
        <RouterLink to="/" class="nav-link" @click="handleNavClick">
          <Icon name="LayoutDashboard" :size="20" class="nav-icon" />
          <span class="nav-text">Dashboard</span>
        </RouterLink>
        <RouterLink to="/calendar" class="nav-link" @click="handleNavClick">
          <Icon name="Calendar" :size="20" class="nav-icon" />
          <span class="nav-text">Calendar</span>
        </RouterLink>
        <RouterLink to="/programs" class="nav-link" @click="handleNavClick">
          <Icon name="Boxes" :size="20" class="nav-icon" />
          <span class="nav-text">Programs</span>
        </RouterLink>
        <RouterLink to="/groups" class="nav-link" @click="handleNavClick">
          <Icon name="FolderOpen" :size="20" class="nav-icon" />
          <span class="nav-text">Groups</span>
        </RouterLink>
        <RouterLink to="/staff" class="nav-link" @click="handleNavClick">
          <Icon name="UsersRound" :size="20" class="nav-icon" />
          <span class="nav-text">Staff</span>
        </RouterLink>
        <RouterLink to="/campers" class="nav-link" @click="handleNavClick">
          <Icon name="Users" :size="20" class="nav-icon" />
          <span class="nav-text">Campers</span>
        </RouterLink>
      </nav>

      <!-- <div v-if="mainStore.conflicts.length > 0" class="conflicts-section">
        <div class="conflicts-badge">
          <span class="badge badge-error">
            <Icon name="AlertTriangle" :size="16" />
            {{ mainStore.conflicts.length }} Conflict{{
              mainStore.conflicts.length > 1 ? "s" : ""
            }}
          </span>
        </div>
      </div> -->
      <!-- Camp Settings (Bottom of Sidebar) -->
      <div class="settings-section">
        <RouterLink to="/settings" class="nav-link" @click="handleNavClick">
          <Icon name="Settings" :size="20" class="nav-icon" />
          <span class="nav-text">Camp Settings</span>
        </RouterLink>
      </div>

      <!-- Logout Button -->
      <div class="nav-link" @click="handleLogout">
        <Icon name="LogOut" :size="20" />
        <span>Logout</span>
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useMainStore, useAuthStore } from "@/stores";
import Icon from "./Icon.vue";

// Mock camp data - will be replaced with API call in the future
const MOCK_CAMPS = [
  { campId: "camp-1", campName: "Summer Camp 2024" },
  { campId: "camp-2", campName: "Adventure Camp 2024" },
  { campId: "camp-3", campName: "Sports Camp 2024" },
];

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

    const selectedCampId = ref(authStore.selectedCampId);

    // Sync with auth store when it changes
    watch(
      () => authStore.selectedCampId,
      (newValue) => {
        selectedCampId.value = newValue;
      },
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

    const handleLogout = () => {
      authStore.logout();
      router.push("/login");
    };

    return {
      selectedCampId,
      showCampSelector,
      accessibleCamps,
      getCampRole,
      getRoleLabel,
      handleCampChange,
      handleLogout,
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
  padding: 0 1rem;
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
