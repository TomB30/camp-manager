<template>
  <div 
    class="card card-clickable card-horizontal location-card"
    @click="$emit('click')"
  >
    <div class="card-icon" :style="{ background: iconColor }">
      <slot name="icon">
        <MapPin :size="28" :stroke-width="2" />
      </slot>
    </div>
    <div class="card-details">
      <h4>{{ location.name }}</h4>
      <div class="card-meta">
        <span class="badge badge-sm" :class="getTypeBadgeClass(location.type)">
          {{ formatType }}
        </span>
        <span v-if="location.capacity" class="badge badge-sm badge-secondary">
          <Users :size="12" class="inline" /> {{ location.capacity }}
        </span>
      </div>
      <p v-if="location.description" class="card-description">
        {{ location.description }}
      </p>
      <div class="card-stats">
        <div v-if="location.equipment && location.equipment.length > 0" class="card-stat-item">
          <Package :size="14" />
          <span>{{ location.equipment.length }} equipment</span>
        </div>
        <div v-if="location.notes" class="card-stat-item">
          <FileText :size="14" />
          <span>Has notes</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { Location } from '@/types/api';
import { MapPin, Users, Package, FileText } from 'lucide-vue-next';

export default defineComponent({
  name: 'LocationCard',
  components: {
    MapPin,
    Users,
    Package,
    FileText,
  },
  props: {
    location: {
      type: Object as PropType<Location>,
      required: true,
    },
    formatType: {
      type: String,
      default: '',
    },
    iconColor: {
      type: String,
      default: '#3b82f6',
    },
  },
  emits: ['click'],
  methods: {
    getTypeBadgeClass(type: string): string {
      const typeMap: Record<string, string> = {
        indoor: 'badge-primary',
        outdoor: 'badge-success',
        facility: 'badge-info',
        field: 'badge-warning',
        water: 'badge-blue',
        other: 'badge-secondary',
      };
      return typeMap[type] || 'badge-secondary';
    },
  },
});
</script>

<style scoped>
@import './card-styles.css';

.location-card {
  min-height: 120px;
}

.badge .inline {
  vertical-align: middle;
  margin-right: 2px;
  margin-top: -2px;
}
</style>

