<template>
  <div 
    class="card card-clickable card-horizontal"
    @click="$emit('click', room)"
  >
    <div class="card-icon" :style="{ background: iconColor }">
      <slot name="icon" />
    </div>
    <div class="card-details">
      <h4>{{ room.name }}</h4>
      <div class="card-meta">
        <span class="badge badge-primary">{{ formattedType }}</span>
        <span class="badge badge-success">Capacity: {{ room.capacity }}</span>
      </div>
      <div v-if="locationName" class="room-location text-sm text-secondary mt-1">
        <MapPin :size="14" class="inline" />
        {{ locationName }}
      </div>
      <div class="room-usage mt-2">
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
import type { Room } from '@/types/api';
import { useCampStore } from '@/stores/campStore';
import { MapPin } from 'lucide-vue-next';

export default defineComponent({
  name: 'RoomCard',
  components: {
    MapPin,
  },
  props: {
    room: {
      type: Object as PropType<Room>,
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
    const store = useCampStore();
    return { store };
  },
  computed: {
    locationName(): string | undefined {
      if (this.room.locationId) {
        return this.store.getLocationById(this.room.locationId)?.name;
      }
      return this.room.location;
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

