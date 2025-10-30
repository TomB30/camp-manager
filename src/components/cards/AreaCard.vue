<template>
  <div
    class="card card-clickable card-horizontal area-card"
    @click="$emit('click')"
  >
    <div class="card-icon" :style="{ background: '#3b82f6' }">
      <slot name="icon">
        <Icon name="Map" :size="28" :stroke-width="2" />
      </slot>
    </div>
    <div class="card-details">
      <h4>{{ area.meta.name }}</h4>
      <div class="card-meta">
        <span v-if="area.spec.capacity" class="badge badge-sm badge-secondary">
          <Icon name="Users" :size="12" class="inline" />
          {{ area.spec.capacity }}
        </span>
      </div>
      <p v-if="area.meta.description" class="card-description">
        {{ area.meta.description }}
      </p>
      <div class="card-stats">
        <div
          v-if="area.spec.equipment && area.spec.equipment.length > 0"
          class="card-stat-item"
        >
          <Icon name="Package" :size="14" />
          <span>{{ area.spec.equipment.length }} equipment</span>
        </div>
        <div v-if="area.spec.notes" class="card-stat-item">
          <Icon name="FileText" :size="14" />
          <span>Has notes</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Area } from "@/generated/api";
import Icon from "../Icon.vue";

export default defineComponent({
  name: "AreaCard",
  components: {
    Icon,
  },
  props: {
    area: {
      type: Object as PropType<Area>,
      required: true,
    },
  },
  emits: ["click"],
});
</script>

<style scoped>
@import "./card-styles.css";

.area-card {
  min-height: 120px;
}

.badge .inline {
  vertical-align: middle;
  margin-right: 2px;
  margin-top: -2px;
}
</style>
