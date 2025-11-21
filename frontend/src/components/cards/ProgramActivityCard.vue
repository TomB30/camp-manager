<template>
  <section class="program-activity-card card clickable row justify-between">
    <div class="column">
      <div class="activity-info">
        <h4>{{ activity.meta.name }}</h4>
        <p v-if="activity.meta.description" class="text-caption">
          {{ activity.meta.description }}
        </p>
      </div>

      <div class="activity-meta">
        <span class="meta-item">
          <Icon name="Clock" :size="14" />
          <template v-if="activity.spec.fixedTime">
            {{ formatTime(activity.spec.fixedTime.startTime) }} -
            {{ formatTime(activity.spec.fixedTime.endTime) }}

            <span class="q-ml-sm" v-if="activity.spec.fixedTime.dayOffset && activity.spec.fixedTime.dayOffset > 0">
              +{{ activity.spec.fixedTime.dayOffset }} day{{ activity.spec.fixedTime.dayOffset !== 1 ? 's' : '' }}
            </span>
          </template>
          <template v-else>
            <DurationDisplay :minutes="activity.spec.duration || 0" />
          </template>
        </span>

        <span v-if="activity.spec.defaultLocationId" class="meta-item">
          <Icon name="Home" :size="14" />
          {{ getLocationName(activity.spec.defaultLocationId) }}
        </span>

        <span
          v-if="
            activity.spec.requiredStaff &&
            activity.spec.requiredStaff.length > 0
          "
          class="meta-item"
        >
          <Icon name="Users" :size="14" />
          {{ activity.spec.requiredStaff.length }} staff position{{
            activity.spec.requiredStaff.length !== 1 ? "s" : ""
          }}
        </span>
      </div>
    </div>

    <div class="activity-actions">
      <BaseButton
        color="negative"
        outline
        size="xs"
        icon="close"
        round
        @click="$emit('remove', activity.meta.id)"
      />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
// Types
import type { Activity } from "@/generated/api";
// Components
import DurationDisplay from "@/components/DurationDisplay.vue";
import Icon from "../Icon.vue";
// Stores
import { useLocationsStore } from "@/stores";

export default defineComponent({
  name: "ProgramActivityCard",
  components: {
    DurationDisplay,
    Icon,
  },
  props: {
    activity: {
      type: Object as PropType<Activity>,
      required: true,
    },
  },
  emits: ["remove"],
  setup() {
    const locationsStore = useLocationsStore();
    return { locationsStore };
  },
  methods: {
    getLocationName(locationId: string): string {
      const location = this.locationsStore.getLocationById(locationId);
      return location?.meta.name || "Unknown Location";
    },
    formatTime(time: string): string {
      if (!time) return "";
      // Convert 24-hour time (HH:mm) to 12-hour format with AM/PM
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    },
  },
});
</script>

<style lang="scss" scoped>
.program-activity-card {
  padding: 1rem;
}

.activity-info {
  display: flex;
  align-items: bottom;
  gap: 0.5rem;

  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
    margin: 0;
    font-size: 0.875rem;
  }
}

.activity-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
