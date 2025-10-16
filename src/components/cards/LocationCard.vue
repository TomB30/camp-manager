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
      <div class="card-meta">
        <span class="badge badge-primary">{{ formattedType }}</span>
        <span class="badge badge-success">Capacity: {{ location.capacity }}</span>
      </div>
      <div v-if="areaName" class="location-area text-sm text-secondary mt-1">
        <MapPin :size="14" class="inline" />
        {{ areaName }}
      </div>
      <div class="location-usage mt-2">
        <div class="usage-bar">
          <div 
            class="usage-fill"
            :style="{ 
              width: `${usagePercent}%`,
              background: usagePercent > 80 ? 'var(--error-color)' : 'var(--success-color)'
            }"
          ></div>
        </div>
        <div class="text-xs text-secondary mt-1">
          {{ usagePercent.toFixed(0) }}% average usage
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { Location } from '@/types';
import { useAreasStore } from '@/stores';
import { MapPin } from 'lucide-vue-next';

export default defineComponent({
  name: 'LocationCard',
  components: {
    MapPin,
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
  emits: ['click'],
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
    }
  }
});
</script>

<style scoped>
@import './card-styles.css';

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

