<template>
  <div class="empty-state">
    <slot name="icon">
      <component v-if="icon" :is="icon" :size="iconSize" :stroke-width="1.5" />
      <svg v-else-if="type === 'no-results'" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <svg v-else width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    </slot>
    
    <h3 v-if="title">{{ title }}</h3>
    <p v-if="message">{{ message }}</p>
    
    <slot name="action">
      <button 
        v-if="actionText" 
        :class="['btn', actionButtonClass]" 
        @click="$emit('action')"
      >
        {{ actionText }}
      </button>
    </slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

export default defineComponent({
  name: 'EmptyState',
  props: {
    type: {
      type: String as PropType<'empty' | 'no-results'>,
      default: 'empty',
    },
    icon: {
      type: Object,
      default: null,
    },
    iconSize: {
      type: Number,
      default: 64,
    },
    title: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    actionText: {
      type: String,
      default: '',
    },
    actionButtonClass: {
      type: String,
      default: 'btn-primary',
    },
  },
  emits: ['action'],
});
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-secondary);
  min-height: 300px;
}

.empty-state svg,
.empty-state :deep(svg) {
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  font-size: 0.9375rem;
  color: var(--text-secondary);
  max-width: 400px;
}

.empty-state button {
  margin-top: 0.5rem;
}
</style>

