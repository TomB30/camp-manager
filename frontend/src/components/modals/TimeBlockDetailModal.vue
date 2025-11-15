<template>
  <BaseModal :title="timeBlock?.meta.name || ''" @close="$emit('close')">
    <template #body>
      <div v-if="timeBlock">
        <div v-if="timeBlock.meta.description" class="detail-section">
          <div class="detail-label">Description</div>
          <div>{{ timeBlock.meta.description }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Start Time</div>
          <div class="time-display">
            <Icon name="Clock" :size="16" />
            <span>{{ formatTime(timeBlock.spec.startTime) }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-label">End Time</div>
          <div class="time-display">
            <Icon name="Clock" :size="16" />
            <span>{{ formatTime(timeBlock.spec.endTime) }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Duration</div>
          <div>{{ duration }}</div>
        </div>

        <div v-if="timeBlock.meta.createdAt" class="detail-section">
          <div class="detail-label">Created</div>
          <div>{{ formatDate(timeBlock.meta.createdAt) }}</div>
        </div>

        <div v-if="timeBlock.meta.updatedAt" class="detail-section">
          <div class="detail-label">Last Updated</div>
          <div>{{ formatDate(timeBlock.meta.updatedAt) }}</div>
        </div>
      </div>
    </template>

    <template #footer>
      <BaseButton
        outline
        color="negative"
        @click="$emit('delete', timeBlock?.meta.id)"
        label="Delete"
      />
      <BaseButton
        outline
        color="grey-8"
        @click="$emit('edit', timeBlock)"
        label="Edit"
      />
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import Icon from "@/components/Icon.vue";
import type { TimeBlock } from "@/generated/api";

export default defineComponent({
  name: "TimeBlockDetailModal",
  components: {
    BaseModal,
    Icon,
  },
  props: {
    timeBlock: {
      type: Object as PropType<TimeBlock | null>,
      default: null,
    },
  },
  emits: ["close", "edit", "delete"],
  computed: {
    duration(): string {
      if (!this.timeBlock) return "";

      const start = this.parseTime(this.timeBlock.spec.startTime);
      const end = this.parseTime(this.timeBlock.spec.endTime);
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;

      if (hours === 0) {
        return `${mins} minutes`;
      } else if (mins === 0) {
        return `${hours} hour${hours > 1 ? "s" : ""}`;
      }
      return `${hours} hour${hours > 1 ? "s" : ""} ${mins} minutes`;
    },
  },
  methods: {
    formatDate(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    formatTime(timeString: string): string {
      const date = this.parseTime(timeString);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    },
    parseTime(timeString: string): Date {
      const [hours, minutes] = timeString.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
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

.time-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
