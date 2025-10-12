<template>
  <div 
    class="card card-clickable"
    :style="{ borderLeft: `4px solid ${program.color || '#6366F1'}` }"
    @click="$emit('click', program)"
  >
    <div class="card-header">
      <h4>{{ program.name }}</h4>
      <div>
        <span class="badge badge-primary">{{ activitiesCount }} activities</span>
      </div>
    </div>
    
    <p v-if="program.description" class="card-description">{{ program.description }}</p>
    
    <div class="card-stats">
      <span class="card-stat-item">
        <Users :size="16" />
        {{ staffCount }} staff
      </span>
      <span class="card-stat-item">
        <Home :size="16" />
        {{ locationsCount }} locations
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { Program } from '@/types/api';
import { Users, Home } from 'lucide-vue-next';

export default defineComponent({
  name: 'ProgramCard',
  components: {
    Users,
    Home,
  },
  props: {
    program: {
      type: Object as PropType<Program>,
      required: true,
    },
    activitiesCount: {
      type: Number,
      default: 0,
    },
    staffCount: {
      type: Number,
      default: 0,
    },
    locationsCount: {
      type: Number,
      default: 0,
    },
  },
  emits: ['click'],
});
</script>

<style scoped>
@import './card-styles.css';
</style>

