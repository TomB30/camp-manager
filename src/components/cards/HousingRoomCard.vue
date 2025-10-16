<template>
  <div 
    class="card card-clickable card-horizontal"
    @click="$emit('click', room)"
  >
    <div class="card-icon" style="background: var(--accent-color)">
      <Bed :size="32" :stroke-width="2" />
    </div>
    <div class="card-details">
      <h4>{{ room.name }}</h4>
      <div class="card-meta">
        <span class="badge badge-primary">{{ room.beds }} beds</span>
        <span v-if="locationName" class="text-sm text-secondary">
          <MapPin :size="14" class="inline" />
          {{ locationName }}
        </span>
      </div>
      <div v-if="familyGroups.length > 0" class="assigned-groups mt-2">
        <div class="text-xs text-secondary mb-1">Family Groups:</div>
        <div class="flex gap-1 flex-wrap">
          <span 
            v-for="familyGroup in familyGroups" 
            :key="familyGroup.id" 
            class="badge badge-success badge-sm"
          >
            {{ familyGroup.name }}
          </span>
        </div>
      </div>
      <div v-else class="text-xs text-secondary mt-2">No family groups assigned</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { HousingRoom } from '@/types';
import type { FamilyGroup } from '@/types';
import { useCampStore } from '@/stores/campStore';
import { Bed, MapPin } from 'lucide-vue-next';

export default defineComponent({
  name: 'HousingRoomCard',
  components: {
    Bed,
    MapPin,
  },
  props: {
    room: {
      type: Object as PropType<HousingRoom>,
      required: true,
    },
    familyGroups: {
      type: Array as PropType<FamilyGroup[]>,
      default: () => [],
    },
  },
  emits: ['click'],
  setup() {
    const store = useCampStore();
    return { store };
  },
  computed: {
    locationName(): string | undefined {
      if (this.room.areaId) {
        return this.store.getAreaById(this.room.areaId)?.name;
      }
      return undefined;
    }
  }
});
</script>

<style scoped>
@import './card-styles.css';

.assigned-groups {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>

