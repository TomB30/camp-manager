<template>
  <div class="view-header">
    <div v-if="hasTitle" class="view-title">
      <h2>{{ title }}</h2>
      <InfoTooltip v-if="tooltip">
        {{ tooltip }}
      </InfoTooltip>
    </div>
    <h2 v-else>{{ title }}</h2>
    <div v-if="hasActions" class="header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import InfoTooltip from '@/components/InfoTooltip.vue';

export default defineComponent({
  name: 'ViewHeader',
  components: {
    InfoTooltip,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    tooltip: {
      type: String,
      default: '',
    },
  },
  computed: {
    hasTitle() {
      return !!this.tooltip;
    },
    hasActions() {
      return !!this.$slots.actions;
    },
  },
});
</script>

<style scoped>
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.view-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-header h2 {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: stretch;
  }

  .header-actions > :deep(*) {
    flex: 1;
  }
}
</style>

