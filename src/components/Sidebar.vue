<template>
  <aside class="sidebar" :class="{ 'sidebar-mobile-open': isMobileOpen }">
    <div class="sidebar-content">
      <div class="logo">
        <Icon name="Sun" :size="20" class="logo-icon" />
        <h1>Summer Camp</h1>
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
        <RouterLink to="/staff" class="nav-link" @click="handleNavClick">
          <Icon name="UsersRound" :size="20" class="nav-icon" />
          <span class="nav-text">Staff</span>
        </RouterLink>

        <!-- Collapsible Campers Section -->
        <div class="nav-section">
          <button
            class="nav-section-header"
            :class="{ 'has-active-route': isCampersRouteActiveWhileCollapsed }"
            @click="toggleCampersSection"
            type="button"
          >
            <Icon name="Users" :size="20" class="nav-icon" />
            <span class="nav-text">Campers</span>
            <span
              v-if="isCampersRouteActiveWhileCollapsed"
              class="active-indicator"
            ></span>
            <Icon
              name="ChevronRight"
              :size="16"
              class="nav-chevron"
              :class="{ 'nav-chevron-expanded': isCampersSectionExpanded }"
            />
          </button>
          <Transition name="expand">
            <div v-if="isCampersSectionExpanded" class="nav-subsection">
              <RouterLink
                to="/groups"
                class="nav-link nav-sublink"
                @click="handleNavClick"
              >
                <Icon name="FolderOpen" :size="18" class="nav-icon" />
                <span class="nav-text">Groups</span>
              </RouterLink>
              <RouterLink
                to="/campers"
                class="nav-link nav-sublink"
                @click="handleNavClick"
              >
                <Icon name="Users" :size="18" class="nav-icon" />
                <span class="nav-text">All Campers</span>
              </RouterLink>
            </div>
          </Transition>
        </div>
      </nav>

      <!-- Camp Settings (Bottom of Sidebar) -->
      <div class="settings-section">
        <RouterLink to="/settings" class="nav-link" @click="handleNavClick">
          <Icon name="Settings" :size="20" class="nav-icon" />
          <span class="nav-text">Camp Settings</span>
        </RouterLink>
      </div>

      <div v-if="mainStore.conflicts.length > 0" class="conflicts-section">
        <div class="conflicts-badge">
          <span class="badge badge-error">
            <Icon name="AlertTriangle" :size="16" />
            {{ mainStore.conflicts.length }} Conflict{{
              mainStore.conflicts.length > 1 ? "s" : ""
            }}
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useMainStore } from "@/stores";
import Icon from "./Icon.vue";

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
  data() {
    return {
      isCampersSectionExpanded: false,
    };
  },
  computed: {
    mainStore() {
      return useMainStore();
    },
    isCampersRouteActiveWhileCollapsed() {
      const campersRoutes = ["/campers", "/groups", "/family-groups"];
      return (
        !this.isCampersSectionExpanded &&
        campersRoutes.includes(this.$route.path)
      );
    },
  },
  watch: {
    "$route.path": {
      immediate: true,
      handler(path: string) {
        this.updateExpandedSections(path);
      },
    },
  },
  methods: {
    updateExpandedSections(path: string) {
      // Define routes for each section
      const campersRoutes = ["/campers", "/groups", "/family-groups"];

      // Set expanded state based on current route
      this.isCampersSectionExpanded = campersRoutes.includes(path);
    },
    toggleCampersSection() {
      this.isCampersSectionExpanded = !this.isCampersSectionExpanded;
    },
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

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  padding: 0 1rem;
}

.nav-link {
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

/* Collapsible Section Styles */
.nav-section {
  display: flex;
  flex-direction: column;
}

.nav-section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text-secondary);
  font-family: inherit;
  font-weight: 500;
  font-size: 0.875rem;
  padding: 0.75rem 0.875rem;
  border-radius: var(--radius);
  transition: all 0.15s ease;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.nav-section-header:hover {
  color: var(--text-primary);
  background: var(--surface-secondary);
}

.nav-section-header.has-active-route {
  color: var(--accent-color);
  background: #eff6ff;
}

.active-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-color);
  margin-left: auto;
  margin-right: 0.25rem;
  flex-shrink: 0;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.nav-chevron {
  margin-left: auto;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.nav-chevron-expanded {
  transform: rotate(90deg);
}

.nav-subsection {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.25rem;
  margin-left: 0.5rem;
  padding-left: 0.75rem;
  border-left: 2px solid var(--border-light);
}

.nav-sublink {
  font-size: 0.8125rem;
  padding: 0.625rem 0.875rem;
}

.nav-sublink .nav-icon {
  opacity: 0.7;
}

/* Expand/Collapse Animation */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
  margin-top: 0.25rem;
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
