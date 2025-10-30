<template>
  <div
    class="card card-clickable card-horizontal"
    @click="$emit('click', location)"
  >
    <div class="card-icon" :style="{ background: '#3b82f6' }">
      <Icon name="MapPin" :size="24" :stroke-width="2" />
    </div>
    <div class="card-details">
      <h4>{{ location.meta.name }}</h4>
      <div class="card-meta row items-center">
        <span v-if="location.spec.capacity" class="badge badge-success">
          Capacity: {{ location.spec.capacity }}
        </span>
        <span
          v-if="areaName"
          class="text-sm text-grey-7 text-subtitle2 row items-center q-gutter-x-xs"
        >
          <Icon name="MapPin" :size="14" class="inline" />
          <span>{{ areaName }}</span>
        </span>
      </div>
      <div class="location-usage mt-2">
        <div class="usage-bar">
          <div
            class="usage-fill"
            :style="{
              width: `${usagePercent}%`,
              background:
                usagePercent > 80
                  ? 'var(--error-color)'
                  : 'var(--success-color)',
            }"
          ></div>
        </div>
        <div class="text-xs text-grey-7 text-subtitle2 mt-1">
          {{ usagePercent.toFixed(0) }}% average usage
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Location } from "@/generated/api";
import { useAreasStore, useEventsStore, useLocationsStore } from "@/stores";
import Icon from "../Icon.vue";

export default defineComponent({
  name: "LocationCard",
  components: {
    Icon,
  },
  props: {
    location: {
      type: Object as PropType<Location>,
      required: true,
    },
  },
  emits: ["click"],
  setup() {
    const areasStore = useAreasStore();
    const eventsStore = useEventsStore();
    const locationsStore = useLocationsStore();
    return { areasStore, eventsStore, locationsStore };
  },
  computed: {
    areaName(): string | undefined {
      if (this.location.spec.areaId) {
        return this.areasStore.getAreaById(this.location.spec.areaId)?.meta
          .name;
      }
      return undefined;
    },
    usagePercent(): number {
      const locationEvents = this.eventsStore.locationEvents(
        this.location.meta.id,
      );
      if (locationEvents.length === 0) return 0;

      if (!this.location.spec.capacity) return 0;

      // Calculate average capacity usage
      const totalUsage = locationEvents.reduce((sum, event) => {
        return (
          sum +
          (this.eventsStore.getEventCamperIds(event.meta.id).length /
            (this.location.spec.capacity || 1)) *
            100
        );
      }, 0);

      return totalUsage / locationEvents.length;
    },
  },
});
</script>

<style scoped>
@import "./card-styles.css";

.usage-bar {
  height: 6px;
  background: var(--surface-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.usage-fill {
  height: 100%;
  transition: width 0.3s ease;
}
</style>
