<template>
  <div
    class="duration-preset-card"
    @click="$emit('click', durationPreset.meta.id)"
  >
    <div class="preset-header">
      <div class="preset-icon">
        <Icon name="Timer" :size="24" />
      </div>
      <div class="preset-title-section">
        <div class="preset-name-row">
          <h3 class="preset-name">{{ durationPreset.meta.name }}</h3>
          <span v-if="durationPreset.spec.default" class="default-badge">
            Default
          </span>
        </div>
        <p v-if="durationPreset.meta.description" class="preset-description">
          {{ durationPreset.meta.description }}
        </p>
      </div>
    </div>

    <div class="preset-details">
      <div class="preset-detail">
        <Icon name="Clock" :size="16" class="detail-icon" />
        <span class="detail-label">Duration:</span>
        <span class="detail-value">{{ formatDuration }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { DurationPreset } from "@/generated/api";
import Icon from "../Icon.vue";

export default defineComponent({
  name: "DurationPresetCard",
  components: {
    Icon,
  },
  props: {
    durationPreset: {
      type: Object as PropType<DurationPreset>,
      required: true,
    },
  },
  emits: ["click"],
  computed: {
    formatDuration(): string {
      const minutes = this.durationPreset.spec.durationMinutes;
      if (minutes < 60) {
        return `${minutes} min`;
      }
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} ${hours === 1 ? "hour" : "hours"}`;
      }
      return `${hours}h ${remainingMinutes}m`;
    },
  },
});
</script>

<style scoped>
.duration-preset-card {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: all 0.2s ease;
  box-shadow: var(--shadow);
  cursor: pointer;
}

.duration-preset-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}

.preset-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.preset-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius);
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.preset-title-section {
  flex: 1;
  min-width: 0;
}

.preset-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.25rem;
}

.preset-name {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.default-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  background: var(--accent-color);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.preset-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.preset-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.preset-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.detail-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.detail-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-value {
  color: var(--text-primary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .preset-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
