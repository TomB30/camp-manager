<template>
  <div class="tab-header">
    <div class="tab-header-content">
      <div>
        <h2>{{ title }}</h2>
        <p class="tab-description">{{ description }}</p>
      </div>
      <div v-if="actionText || $slots.actions" class="tab-header-actions">
        <slot name="actions"></slot>
        <button v-if="actionText" class="btn btn-primary" @click="$emit('action')">
          <slot name="action-icon"></slot>
          {{ actionText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TabHeader',
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    actionText: {
      type: String,
      default: '',
    },
  },
  emits: ['action'],
});
</script>

<style scoped>
.tab-header {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow);
}


.tab-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.tab-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.tab-description {
  margin: 0.5rem 0 0 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}

.tab-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .tab-header-content {
    flex-direction: column;
  }
  
  .tab-header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

