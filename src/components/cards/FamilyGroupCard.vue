<template>
  <div 
    class="card card-clickable"
    :style="{ borderLeft: `4px solid ${group.color || '#6366F1'}` }"
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
        <Bed :size="16" />
        <span>{{ sleepingRoomName }}</span>
      </div>
      <div v-if="group.staffMemberIds.length > 0" class="card-info-row">
        <Users :size="16" />
        <span>{{ group.staffMemberIds.length }} staff member(s)</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { FamilyGroup } from '@/types/api';
import { Bed, Users } from 'lucide-vue-next';

export default defineComponent({
  name: 'FamilyGroupCard',
  components: {
    Bed,
    Users,
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
    sleepingRoomName: {
      type: String,
      required: true,
    },
  },
  emits: ['click'],
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

