<template>
  <aside class="sidebar" :class="{ 'sidebar-mobile-open': isMobileOpen }">
    <div class="sidebar-content">
      <div class="logo">
        <Sun :size="20" class="logo-icon" />
        <h1>Summer Camp</h1>
      </div>
      
      <nav class="nav">
        <RouterLink to="/" class="nav-link" @click="handleNavClick">
          <LayoutDashboard :size="20" class="nav-icon" />
          <span class="nav-text">Dashboard</span>
        </RouterLink>
        <RouterLink to="/calendar" class="nav-link" @click="handleNavClick">
          <Calendar :size="20" class="nav-icon" />
          <span class="nav-text">Calendar</span>
        </RouterLink>
        <RouterLink to="/programs" class="nav-link" @click="handleNavClick">
          <Boxes :size="20" class="nav-icon" />
          <span class="nav-text">Programs</span>
        </RouterLink>
        <RouterLink to="/staff" class="nav-link" @click="handleNavClick">
          <UsersRound :size="20" class="nav-icon" />
          <span class="nav-text">Staff</span>
        </RouterLink>
        
        <!-- Collapsible Campers Section -->
        <div class="nav-section">
          <button 
            class="nav-section-header" 
            @click="toggleCampersSection"
            type="button"
          >
            <Users :size="20" class="nav-icon" />
            <span class="nav-text">Campers</span>
            <ChevronRight 
              :size="16" 
              class="nav-chevron"
              :class="{ 'nav-chevron-expanded': isCampersSectionExpanded }"
            />
          </button>
          <div v-if="isCampersSectionExpanded" class="nav-subsection">
            <RouterLink to="/campers" class="nav-link nav-sublink" @click="handleNavClick">
              <Users :size="18" class="nav-icon" />
              <span class="nav-text">All Campers</span>
            </RouterLink>
            <RouterLink to="/groups" class="nav-link nav-sublink" @click="handleNavClick">
              <FolderOpen :size="18" class="nav-icon" />
              <span class="nav-text">Camper Groups</span>
            </RouterLink>
            <RouterLink to="/family-groups" class="nav-link nav-sublink" @click="handleNavClick">
              <UsersRound :size="18" class="nav-icon" />
              <span class="nav-text">Family Groups</span>
            </RouterLink>
          </div>
        </div>
        

        
        <!-- Collapsible Camp Info Section -->
        <div class="nav-section">
          <button 
            class="nav-section-header" 
            @click="toggleCampInfoSection"
            type="button"
          >
            <Settings :size="20" class="nav-icon" />
            <span class="nav-text">Camp Info</span>
            <ChevronRight 
              :size="16" 
              class="nav-chevron"
              :class="{ 'nav-chevron-expanded': isCampInfoSectionExpanded }"
            />
          </button>
          <div v-if="isCampInfoSectionExpanded" class="nav-subsection">
            <RouterLink to="/locations" class="nav-link nav-sublink" @click="handleNavClick">
              <MapPin :size="18" class="nav-icon" />
              <span class="nav-text">Locations</span>
            </RouterLink>
            <RouterLink to="/rooms" class="nav-link nav-sublink" @click="handleNavClick">
              <Home :size="18" class="nav-icon" />
              <span class="nav-text">Activity Rooms</span>
            </RouterLink>
            <RouterLink to="/sleeping-rooms" class="nav-link nav-sublink" @click="handleNavClick">
              <Bed :size="18" class="nav-icon" />
              <span class="nav-text">Cabins</span>
            </RouterLink>
            <RouterLink to="/certifications" class="nav-link nav-sublink" @click="handleNavClick">
              <Award :size="18" class="nav-icon" />
              <span class="nav-text">Certifications</span>
            </RouterLink>
          </div>
        </div>
      </nav>

      <div v-if="store.conflicts.length > 0" class="conflicts-section">
        <div class="conflicts-badge">
          <span class="badge badge-error">
            <AlertTriangle :size="16" />
            {{ store.conflicts.length }} Conflict{{ store.conflicts.length > 1 ? 's' : '' }}
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useCampStore } from '@/stores/campStore';
import { 
  Sun, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UsersRound, 
  Home, 
  Bed, 
  FolderOpen,
  ChevronRight,
  AlertTriangle,
  Boxes,
  Settings,
  MapPin,
  Award
} from 'lucide-vue-next';

export default defineComponent({
  name: 'Sidebar',
  components: {
    Sun,
    LayoutDashboard,
    Calendar,
    Users,
    UsersRound,
    Home,
    Bed,
    FolderOpen,
    ChevronRight,
    AlertTriangle,
    Boxes,
    Settings,
    MapPin,
    Award
  },
  props: {
    isMobileOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  data() {
    return {
      isCampersSectionExpanded: false,
      isCampInfoSectionExpanded: false
    };
  },
  computed: {
    store() {
      return useCampStore();
    }
  },
  methods: {
    toggleCampersSection() {
      this.isCampersSectionExpanded = !this.isCampersSectionExpanded;
    },
    toggleCampInfoSection() {
      this.isCampInfoSectionExpanded = !this.isCampInfoSectionExpanded;
    },
    handleNavClick() {
      // Close mobile menu when a nav link is clicked (on mobile only)
      if (window.innerWidth <= 768) {
        this.$emit('close');
      }
    }
  }
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
  background: #EFF6FF;
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

.conflicts-section {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-light);
  margin-top: auto;
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

  .nav-link {
    /* Keep desktop styles for mobile sidebar */
  }

  .nav-section {
    /* Keep desktop styles */
  }

  .nav-section-header {
    /* Keep desktop styles */
  }

  .nav-subsection {
    /* Keep desktop styles */
  }

  .nav-sublink {
    /* Keep desktop styles */
  }

  .conflicts-section {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--border-light);
    margin-top: auto;
  }
}
</style>

