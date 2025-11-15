<template>
  <div class="card clickable" @click="$emit('click', location)">
    <div class="card-header">
      <div class="card-icon" :style="{ background: '#3b82f6' }">
        <Icon name="MapPin" :size="24" :stroke-width="2" />
      </div>
      <div>
        <h4>{{ location.meta.name }}</h4>
        <p v-if="location.meta.description" class="card-description">
          {{ location.meta.description }}
        </p>
      </div>
    </div>

    <div class="card-meta row items-center gap-2">
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
  },
});
</script>

<style scoped>
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
