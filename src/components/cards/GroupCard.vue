<template>
  <div 
    class="card card-clickable"
    :style="{ borderLeft: `4px solid ${group.color || '#6366F1'}` }"
    @click="$emit('click', group)"
  >
    <div class="card-header">
      <h4>{{ group.name }}</h4>
      <span class="badge badge-primary">{{ campersCount }} campers</span>
    </div>
    
    <p v-if="group.description" class="card-description">{{ group.description }}</p>
    
    <div class="group-filters">
      <slot name="filters" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { CamperGroup } from '@/types/api';

export default defineComponent({
  name: 'GroupCard',
  props: {
    group: {
      type: Object as PropType<CamperGroup>,
      required: true,
    },
    campersCount: {
      type: Number,
      default: 0,
    },
  },
  emits: ['click'],
});
</script>

<style scoped>
@import './card-styles.css';

.group-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.group-filters :deep(.filter-tag) {
  font-size: 0.75rem;
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  background: var(--surface-secondary);
  border-radius: var(--radius-sm);
}

.group-filters :deep(.filter-tag strong) {
  color: var(--text-primary);
}
</style>

