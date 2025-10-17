<template>
  <div 
    class="card card-clickable"
    :style="{ borderLeft: `4px solid ${groupColor}` }"
    @click="$emit('click', group)"
  >
    <div class="card-header">
      <h4>{{ group.name }}</h4>
      <span class="badge badge-primary">{{ campersCount }} campers</span>
    </div>
    
    <p v-if="group.description" class="card-description">{{ group.description }}</p>
    
    <div class="group-dates">
      <span class="text-xs text-secondary">
        📅 {{ formattedDateRange }}
      </span>
    </div>
    
    <div class="group-info mt-2">
      <div class="card-info-row">
        <Icon name="Bed" :size="16" />
        <span>{{ housingRoomName }}</span>
      </div>
      <div v-if="group.staffMemberIds.length > 0" class="card-info-row">
        <Icon name="Users" :size="16" />
        <span>{{ group.staffMemberIds.length }} staff member(s)</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { FamilyGroup } from '@/types';
import { useColorsStore } from '@/stores';
import Icon from '../Icon.vue';

export default defineComponent({
  name: 'FamilyGroupCard',
  components: {
    Icon,
  },
  props: {
    group: {
      type: Object as PropType<FamilyGroup>,
      required: true,
    },
    campersCount: {
      type: Number,
      default: 0,
    },
    formattedDateRange: {
      type: String,
      required: true,
    },
    housingRoomName: {
      type: String,
      required: true,
    },
  },
  emits: ['click'],
  setup() {
    const colorsStore = useColorsStore();
    return { colorsStore };
  },
  computed: {
    groupColor(): string {
      if (this.group.colorId) {
        const color = this.colorsStore.getColorById(this.group.colorId);
        return color?.hexValue || '#6366F1';
      }
      return '#6366F1';
    }
  }
});
</script>

<style scoped>
@import './card-styles.css';

.group-dates {
  margin-bottom: 0.75rem;
}

.group-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>

