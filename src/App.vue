<template>
  <div id="app">
    <Header />
    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import Header from './components/Header.vue';
import { useCampStore } from './stores/campStore';
import { storageService } from './services/storage';
import { mockData } from './data/mockData';

const store = useCampStore();

onMounted(async () => {
  // Check if we have data, if not, seed with mock data
  const existingChildren = await storageService.getChildren();
  
  if (existingChildren.length === 0) {
    await storageService.seedData(mockData);
  }
  
  await store.loadAll();
});
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding: 2rem 0;
}
</style>

