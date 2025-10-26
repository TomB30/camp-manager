<template>
  <div
    class="card card-clickable card-horizontal"
    @click="$emit('click', location)"
  >
    <div class="card-icon" :style="{ background: iconColor }">
      <Icon :name="locationTypeIcon" :size="24" :stroke-width="2" />
    </div>
    <div class="card-details">
      <h4>{{ location.name }}</h4>
      <div class="card-meta row items-center">
        <span class="badge badge-primary" v-if="location.type">
          {{ formattedType }}
        </span>
        <span v-if="location.capacity" class="badge badge-success">
          Capacity: {{ location.capacity }}
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
import type { Location } from "@/types";
import { useAreasStore, useEventsStore, useLocationsStore } from "@/stores";
import Icon, { type IconName } from "../Icon.vue";

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
      if (this.location.areaId) {
        return this.areasStore.getAreaById(this.location.areaId)?.name;
      }
      return undefined;
    },
    formattedType(): string {
      if (!this.location.type) return "";
      return (
        this.location.type.charAt(0).toUpperCase() + this.location.type.slice(1)
      );
    },
    iconColor(): string {
      const colors: Record<Location["type"], string> = {
        classroom: "#2196F3",
        activity: "#4CAF50",
        sports: "#FF9800",
        dining: "#795548",
        outdoor: "#8BC34A",
        arts: "#9C27B0",
      };
      return colors[this.location.type] || "#757575";
    },
    locationTypeIcon(): IconName {
      const iconMap: Record<Location["type"], IconName> = {
        classroom: "BookOpen",
        activity: "Target",
        sports: "Dumbbell",
        dining: "Utensils",
        outdoor: "Trees",
        arts: "Palette",
      };
      return iconMap[this.location.type] || "MapPin";
    },
    usagePercent(): number {
      const locationEvents = this.eventsStore.locationEvents(this.location.id);
      if (locationEvents.length === 0) return 0;

      if (!this.location.capacity) return 0;

      // Calculate average capacity usage
      const totalUsage = locationEvents.reduce((sum, event) => {
        return (
          sum +
          (this.eventsStore.getEventCamperIds(event.id).length /
            (this.location.capacity || 1)) *
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
