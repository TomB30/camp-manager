<template>
  <div
    class="card card-clickable"
    :style="{ borderLeft: `4px solid ${programColor}` }"
    @click="$emit('click', program)"
  >
    <div class="card-header">
      <h4>{{ program.meta.name }}</h4>
      <div>
        <span class="badge badge-primary"
          >{{ activitiesCount }} activities</span
        >
      </div>
    </div>

    <p v-if="program.meta.description" class="card-description">
      {{ program.meta.description }}
    </p>

    <div class="card-stats">
      <span class="card-stat-item">
        <Icon name="Users" :size="16" />
        {{ staffCount }} staff
      </span>
      <span class="card-stat-item">
        <Icon name="Home" :size="16" />
        {{ locationsCount }} locations
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Program } from "@/types";
import { useColorsStore } from "@/stores";
import Icon from "../Icon.vue";

export default defineComponent({
  name: "ProgramCard",
  components: {
    Icon,
  },
  props: {
    program: {
      type: Object as PropType<Program>,
      required: true,
    },
    activitiesCount: {
      type: Number,
      default: 0,
    },
    staffCount: {
      type: Number,
      default: 0,
    },
    locationsCount: {
      type: Number,
      default: 0,
    },
  },
  emits: ["click"],
  setup() {
    const colorsStore = useColorsStore();
    return { colorsStore };
  },
  computed: {
    programColor(): string {
      if (this.program.spec.colorId) {
        const color = this.colorsStore.getColorById(this.program.spec.colorId);
        return color?.spec.hexValue || "#6366F1";
      }
      return "#6366F1";
    },
  },
});
</script>

<style scoped>
@import "./card-styles.css";
</style>
