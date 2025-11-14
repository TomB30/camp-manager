<template>
  <div class="card card-clickable area-card" @click="$emit('click')">
    <section class="card-header">
      <div class="card-icon" :style="{ background: '#3b82f6' }">
        <slot name="icon">
          <Icon name="Map" :size="28" :stroke-width="2" />
        </slot>
      </div>
      <div class="title-and-description-wrapper">
        <h4>{{ area.meta.name }}</h4>
        <p v-if="area.meta.description" class="card-description">
          {{ area.meta.description }}
        </p>
      </div>
    </section>

    <div class="row items-center gap-2">
      <span v-if="area.spec.capacity" class="row items-center q-gutter-x-xs">
        <Icon name="Users" :size="14" />
        <span>
          {{ area.spec.capacity }}
        </span>
      </span>
      <div
        v-if="area.spec.equipment && area.spec.equipment.length > 0"
        class="row items-center q-gutter-x-xs"
      >
        <Icon name="Package" :size="14" />
        <span>{{ area.spec.equipment.length }} equipment</span>
      </div>
      <div v-if="area.spec.notes" class="row items-center q-gutter-x-xs">
        <Icon name="FileText" :size="14" />
        <span>Has notes</span>
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
.area-card {
  min-height: 120px;
}

.badge .inline {
  vertical-align: middle;
  margin-right: 2px;
  margin-top: -2px;
}
</style>
