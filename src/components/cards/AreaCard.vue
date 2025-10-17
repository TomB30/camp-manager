<template>
  <div 
    class="card card-clickable card-horizontal area-card"
    @click="$emit('click')"
  >
    <div class="card-icon" :style="{ background: iconColor }">
      <slot name="icon">
        <Icon name="MapPin" :size="28" :stroke-width="2" />
      </slot>
    </div>
    <div class="card-details">
      <h4>{{ area.name }}</h4>
      <div class="card-meta">
        <span class="badge badge-sm" :class="getTypeBadgeClass(area.type)">
          {{ formatType }}
        </span>
        <span v-if="area.capacity" class="badge badge-sm badge-secondary">
          <Icon name="Users" :size="12" class="inline" /> {{ area.capacity }}
        </span>
      </div>
      <p v-if="area.description" class="card-description">
        {{ area.description }}
      </p>
      <div class="card-stats">
        <div v-if="area.equipment && area.equipment.length > 0" class="card-stat-item">
          <Icon name="Package" :size="14" />
          <span>{{ area.equipment.length }} equipment</span>
        </div>
        <div v-if="area.notes" class="card-stat-item">
          <Icon name="FileText" :size="14" />
          <span>Has notes</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { Area } from '@/types';
import Icon from '../Icon.vue';

export default defineComponent({
  name: 'AreaCard',
  components: {
    Icon,
  },
  props: {
    area: {
      type: Object as PropType<Area>,
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

.area-card {
  min-height: 120px;
}

.badge .inline {
  vertical-align: middle;
  margin-right: 2px;
  margin-top: -2px;
}
</style>

