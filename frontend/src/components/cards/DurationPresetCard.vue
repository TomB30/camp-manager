<template>
  <div class="duration-preset-card card clickable">
    <div class="card-header">
      <div class="preset-icon card-icon">
        <Icon name="Timer" :size="24" />
      </div>
      <div>
        <h4>{{ durationPreset.meta.name }}</h4>
        <p v-if="durationPreset.meta.description" class="card-description">
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
import BaseCard from "./BaseCard.vue";

export default defineComponent({
  name: "DurationPresetCard",
  components: {
    Icon,
    BaseCard,
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
.preset-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
</style>
