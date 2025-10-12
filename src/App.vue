<template>
  <div id="app">
    <!-- Mobile Header with Hamburger -->
    <header class="mobile-header">
      <button class="hamburger-btn" @click="toggleMobileMenu" aria-label="Toggle menu">
        <Menu :size="24" />
      </button>
      <div class="mobile-logo">
        <Sun :size="20" />
        <h1>Summer Camp</h1>
      </div>
      <div class="mobile-spacer"></div>
    </header>

    <!-- Backdrop overlay for mobile -->
    <div v-if="isMobileMenuOpen" class="mobile-backdrop" @click="closeMobileMenu"></div>

    <Sidebar :is-mobile-open="isMobileMenuOpen" @close="closeMobileMenu" />
    <main class="main-content">
      <RouterView />
    </main>
    <Toast />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Sidebar from './components/Sidebar.vue';
import Toast from './components/Toast.vue';
import { useCampStore } from './stores/campStore';
import { storageService } from './services/storage';
import { mockData } from './data/mockData';
import { Menu, Sun } from 'lucide-vue-next';

export default defineComponent({
  name: 'App',
  components: {
    Sidebar,
    Toast,
    Menu,
    Sun
  },
  data() {
    return {
      isMobileMenuOpen: false
    };
  },
  methods: {
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
    }
  },
  async mounted(): Promise<void> {
    const store = useCampStore();
    
    // Check if we have data, if not, seed with mock data
    const existingCampers = await storageService.getCampers();
    
    if (existingCampers.length === 0) {
      await storageService.seedData(mockData);
    }
    
    await store.loadAll();
  }
});
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
}

.main-content {
  flex: 1;
  margin-left: 220px;
  padding: 1rem 2rem;
  min-height: 100vh;
}

/* Mobile Header - Hidden on Desktop */
.mobile-header {
  display: none;
}

/* Mobile Backdrop - Hidden on Desktop */
.mobile-backdrop {
  display: none;
}

@media (max-width: 768px) {
  #app {
    flex-direction: column;
  }

  /* Mobile Header */
  .mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: var(--surface);
    border-bottom: 1px solid var(--border-light);
    position: sticky;
    top: 0;
    z-index: 200;
    box-shadow: var(--shadow);
  }

  .hamburger-btn {
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius);
    transition: background 0.15s ease;
  }

  .hamburger-btn:hover {
    background: var(--surface-secondary);
  }

  .mobile-logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .mobile-logo h1 {
    font-size: 1.125rem;
    margin: 0;
    font-weight: 600;
  }

  .mobile-spacer {
    width: 40px; /* Match hamburger button width for centering */
  }

  /* Mobile Backdrop */
  .mobile-backdrop {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 150;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .main-content {
    margin-left: 0;
    padding: 1rem;
  }
}
</style>

