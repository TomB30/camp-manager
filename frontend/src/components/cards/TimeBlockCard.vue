<template>
  <div class="card clickable time-block-card" @click="$emit('click')">
    <section class="card-header">
      <div class="card-icon" :style="{ background: '#8b5cf6' }">
        <slot name="icon">
          <Icon name="Clock" :size="28" :stroke-width="2" />
        </slot>
      </div>
      <div class="title-and-description-wrapper">
        <h4>{{ timeBlock.meta.name }}</h4>
        <p v-if="timeBlock.meta.description" class="card-description">
          {{ timeBlock.meta.description }}
        </p>
      </div>
    </section>

    <div class="row items-center gap-2">
      <span class="row items-center q-gutter-x-xs">
        <Icon name="Clock" :size="14" />
        <span>{{ formatTime(timeBlock.spec.startTime) }}</span>
      </span>
      <span class="text-secondary">-</span>
      <span class="row items-center q-gutter-x-xs">
        <Icon name="Clock" :size="14" />
        <span>{{ formatTime(timeBlock.spec.endTime) }}</span>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { TimeBlock } from "@/generated/api";
import Icon from "../Icon.vue";

export default defineComponent({
  name: "TimeBlockCard",
  components: {
    Icon,
  },
  props: {
    timeBlock: {
      type: Object as PropType<TimeBlock>,
      required: true,
    },
  },
  emits: ["click"],
  computed: {
    duration(): string {
      const start = this.parseTime(this.timeBlock.spec.startTime);
      const end = this.parseTime(this.timeBlock.spec.endTime);
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;

      if (hours === 0) {
        return `${mins}m`;
      } else if (mins === 0) {
        return `${hours}h`;
      }
      return `${hours}h ${mins}m`;
    },
  },
  methods: {
    formatTime(timeString: string): string {
      // Parse time string (format: HH:MM or HH:MM:SS)
      const date = this.parseTime(timeString);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    },
    parseTime(timeString: string): Date {
      // Create a date object with today's date and the given time
      const [hours, minutes] = timeString.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    },
  },
});
</script>

<style scoped>
.time-block-card {
  min-height: 120px;
}

.badge .inline {
  vertical-align: middle;
  margin-right: 2px;
  margin-top: -2px;
}
</style>
