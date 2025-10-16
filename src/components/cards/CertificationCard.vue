<template>
  <div 
    class="card card-clickable card-horizontal certification-card"
    @click="$emit('click')"
  >
    <div class="card-icon" :style="{ background: iconColor }">
      <slot name="icon">
        <Award :size="28" :stroke-width="2" />
      </slot>
    </div>
    <div class="card-details">
      <h4>{{ certification.name }}</h4>
      <div class="card-meta">
        <span class="badge badge-sm" :class="certification.expirationRequired ? 'badge-warning' : 'badge-success'">
          {{ certification.expirationRequired ? 'Time-limited' : 'Permanent' }}
        </span>
        <span v-if="certification.expirationRequired && certification.validityPeriodMonths" class="badge badge-sm badge-secondary">
          <Clock :size="12" class="inline" /> {{ certification.validityPeriodMonths }}mo
        </span>
      </div>
      <p v-if="certification.description" class="card-description">
        {{ certification.description }}
      </p>
      <div v-if="certification.expirationRequired" class="card-stats">
        <div class="card-stat-item">
          <CheckCircle :size="14" />
          <span v-if="certification.validityPeriodMonths">
            Valid for {{ certification.validityPeriodMonths }} months
          </span>
          <span v-else>
            Requires expiration tracking
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { Certification } from '@/types';
import { Award, Clock, CheckCircle } from 'lucide-vue-next';

export default defineComponent({
  name: 'CertificationCard',
  components: {
    Award,
    Clock,
    CheckCircle,
  },
  props: {
    certification: {
      type: Object as PropType<Certification>,
      required: true,
    },
    iconColor: {
      type: String,
      default: '#10b981',
    },
  },
  emits: ['click'],
});
</script>

<style scoped>
@import './card-styles.css';

.certification-card {
  min-height: 120px;
}

.badge .inline {
  vertical-align: middle;
  margin-right: 2px;
  margin-top: -2px;
}
</style>

