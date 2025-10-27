<template>
  <BaseModal
    show
    :title="durationPreset?.name || ''"
    @close="$emit('close')"
  >
    <template #body>
      <div>
        <div v-if="durationPreset.default" class="detail-section">
          <div class="default-badge-large">
            <Icon name="Star" :size="16" />
            <span>Default Duration Preset</span>
          </div>
        </div>

        <div v-if="durationPreset.description" class="detail-section">
          <div class="detail-label">Description</div>
          <div>{{ durationPreset.description }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Duration</div>
          <div class="duration-display">{{ formatDuration }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Created</div>
          <div>{{ formatDateTime(durationPreset.createdAt || '') }}</div>
        </div>

        <div v-if="durationPreset.updatedAt" class="detail-section">
          <div class="detail-label">Last Updated</div>
          <div>{{ formatDateTime(durationPreset.updatedAt) }}</div>
        </div>
      </div>
    </template>

    <template #footer>
      <BaseButton
        outline
        color="negative"
        @click="$emit('delete', durationPreset?.id)"
        label="Delete"
      />
      <BaseButton
        outline
        color="grey-8"
        @click="$emit('edit', durationPreset)"
        label="Edit"
      />
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import Icon from "@/components/Icon.vue";
import type { DurationPreset } from "@/types";

export default defineComponent({
  name: "DurationPresetDetailModal",
  components: {
    BaseModal,
    Icon,
  },
  props: {
    durationPreset: {
      type: Object as PropType<DurationPreset>,
      required: true,
    },
  },
  emits: ["close", "edit", "delete"],
  computed: {
    formatDuration(): string {
      const minutes = this.durationPreset.durationMinutes;
      if (minutes < 60) {
        return `${minutes} minutes`;
      }
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} ${hours === 1 ? "hour" : "hours"}`;
      }
      return `${hours} ${hours === 1 ? "hour" : "hours"} ${remainingMinutes} minutes`;
    },
  },
  methods: {
    formatDateTime(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
});
</script>

<style scoped>
.detail-section {
  margin-bottom: 1.5rem;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.default-badge-large {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 600;
}

.duration-display {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}
</style>

