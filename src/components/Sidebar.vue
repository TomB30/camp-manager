<template>
  <aside class="sidebar">
    <div class="sidebar-content">
      <div class="logo">
        <Sun :size="20" class="logo-icon" />
        <h1>Summer Camp</h1>
      </div>
      
      <nav class="nav">
        <RouterLink to="/" class="nav-link">
          <LayoutDashboard :size="20" class="nav-icon" />
          <span class="nav-text">Dashboard</span>
        </RouterLink>
        <RouterLink to="/calendar" class="nav-link">
          <Calendar :size="20" class="nav-icon" />
          <span class="nav-text">Calendar</span>
        </RouterLink>
        <RouterLink to="/campers" class="nav-link">
          <Users :size="20" class="nav-icon" />
          <span class="nav-text">Campers</span>
        </RouterLink>
        <RouterLink to="/team" class="nav-link">
          <UsersRound :size="20" class="nav-icon" />
          <span class="nav-text">Team</span>
        </RouterLink>
        <RouterLink to="/rooms" class="nav-link">
          <Home :size="20" class="nav-icon" />
          <span class="nav-text">Activity Rooms</span>
        </RouterLink>
        <RouterLink to="/sleeping-rooms" class="nav-link">
          <Bed :size="20" class="nav-icon" />
          <span class="nav-text">Cabins</span>
        </RouterLink>
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
  AlertTriangle 
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
    AlertTriangle
  },
  computed: {
    store() {
      return useCampStore();
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
    width: 100%;
    height: auto;
    position: relative;
    border-right: none;
    border-bottom: 1px solid var(--border-light);
  }

  .sidebar-content {
    padding: 1rem 0;
  }

  .logo {
    padding: 0 1rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .nav {
    flex-direction: row;
    overflow-x: auto;
    padding: 0 1rem;
  }

  .nav-link {
    flex-direction: column;
    gap: 0.25rem;
    min-width: 80px;
    text-align: center;
    padding: 0.5rem;
  }

  .nav-text {
    font-size: 0.75rem;
  }

  .conflicts-section {
    padding: 1rem;
    margin-top: 0;
    border-top: none;
  }
}
</style>

