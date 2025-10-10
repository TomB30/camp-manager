<template>
  <div class="view-toggle">
    <button 
      class="btn btn-sm" 
      :class="{ 'btn-primary': modelValue === 'grid', 'btn-secondary': modelValue !== 'grid' }"
      @click="$emit('update:modelValue', 'grid')"
      title="Grid View"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    </button>
    <button 
      class="btn btn-sm" 
      :class="{ 'btn-primary': modelValue === 'table', 'btn-secondary': modelValue !== 'table' }"
      @click="$emit('update:modelValue', 'table')"
      title="Table View"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ViewToggle',
  props: {
    modelValue: {
      type: String as () => 'grid' | 'table',
      default: 'grid'
    }
  },
  emits: ['update:modelValue']
});
</script>

<style scoped>
.view-toggle {
  display: flex;
  gap: 0.25rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 2px;
  background: var(--background);
}

.view-toggle .btn {
  padding: 0.5rem;
  border-radius: calc(var(--radius) - 2px);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

