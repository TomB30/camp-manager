<template>
  <div id="app">
    <Sidebar />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import Sidebar from './components/Sidebar.vue';
import { useCampStore } from './stores/campStore';
import { storageService } from './services/storage';
import { mockData } from './data/mockData';

const store = useCampStore();

onMounted(async () => {
  // Check if we have data, if not, seed with mock data
  const existingCampers = await storageService.getCampers();
  
  if (existingCampers.length === 0) {
    await storageService.seedData(mockData);
  }
  
  await store.loadAll();
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
  padding: 2rem;
  min-height: 100vh;
}

@media (max-width: 768px) {
  #app {
    flex-direction: column;
  }

  .main-content {
    margin-left: 0;
    padding: 1rem;
  }
}
</style>

