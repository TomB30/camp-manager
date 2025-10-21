<template>
  <div
    class="card card-clickable card-horizontal"
    @click="$emit('click', location)"
  >
    <div class="card-icon" :style="{ background: iconColor }">
      <slot name="icon" />
    </div>
    <div class="card-details">
      <h4>{{ location.name }}</h4>
      <div class="card-meta row items-center">
        <span class="badge badge-primary">{{ formattedType }}</span>
        <span class="badge badge-success"
          >Capacity: {{ location.capacity }}</span
        >
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
import { useAreasStore } from "@/stores";
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
    formattedType: {
      type: String,
      required: true,
    },
    iconColor: {
      type: String,
      required: true,
    },
    usagePercent: {
      type: Number,
      default: 0,
    },
  },
  emits: ["click"],
  setup() {
    const areasStore = useAreasStore();
    return { areasStore };
  },
  computed: {
    areaName(): string | undefined {
      if (this.location.areaId) {
        return this.areasStore.getAreaById(this.location.areaId)?.name;
      }
      return undefined;
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
