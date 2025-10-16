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
    
    <div v-if="group.labelIds && group.labelIds.length > 0" class="card-labels">
      <span 
        v-for="labelId in group.labelIds" 
        :key="labelId"
        class="label-badge"
        :style="{ background: getLabelColor(labelId) }"
      >
        {{ getLabelName(labelId) }}
      </span>
    </div>
    
    <div class="group-filters">
      <slot name="filters" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { CamperGroup } from '@/types';
import { useCampStore } from '@/stores/campStore';

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
  computed: {
    store() {
      return useCampStore();
    }
  },
  methods: {
    getLabelName(labelId: string): string {
      const label = this.store.getLabelById(labelId);
      return label ? label.name : 'Unknown Label';
    },
    getLabelColor(labelId: string): string {
      const label = this.store.getLabelById(labelId);
      if (label?.colorId) {
        const color = this.store.getColorById(label.colorId);
        return color?.hexValue || '#6366F1';
      }
      return '#6366F1';
    }
  }
});
</script>

<style scoped>
@import './card-styles.css';

.card-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}

.label-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  border-radius: 9999px;
  white-space: nowrap;
}

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

