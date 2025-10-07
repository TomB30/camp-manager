<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <h1>☀️ Summer Camp Manager</h1>
        </div>
        <nav class="nav">
          <RouterLink to="/" class="nav-link">Dashboard</RouterLink>
          <RouterLink to="/calendar" class="nav-link">Calendar</RouterLink>
          <RouterLink to="/children" class="nav-link">Children</RouterLink>
          <RouterLink to="/team" class="nav-link">Team</RouterLink>
          <RouterLink to="/rooms" class="nav-link">Activity Rooms</RouterLink>
          <RouterLink to="/sleeping-rooms" class="nav-link">Cabins</RouterLink>
        </nav>
        <div v-if="store.conflicts.length > 0" class="conflicts-badge">
          <span class="badge badge-error">
            {{ store.conflicts.length }} Conflict{{ store.conflicts.length > 1 ? 's' : '' }}
          </span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useCampStore } from '@/stores/campStore';

const store = useCampStore();
</script>

<style scoped>
.header {
  background: var(--surface);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.95);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  gap: 2rem;
}

.logo h1 {
  font-size: 1.25rem;
  margin: 0;
  color: var(--text-primary);
  white-space: nowrap;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.nav {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius);
  transition: all 0.15s ease;
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--surface-secondary);
}

.nav-link.router-link-active {
  color: var(--accent-color);
  background: #EFF6FF;
}

.conflicts-badge {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .nav {
    flex-wrap: wrap;
    justify-content: center;
  }

  .logo h1 {
    font-size: 1.25rem;
  }
}
</style>

