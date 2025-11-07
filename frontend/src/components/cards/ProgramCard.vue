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
        {{ staffGroupsCount }} staff groups
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
// Types
import type { Program } from "@/generated/api";
// Stores
import { useColorsStore } from "@/stores";
// Components
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
    activitiesCount(): number {
      return this.program.spec.activityIds?.length || 0;
    },
    staffGroupsCount(): number {
      return this.program.spec.staffGroupIds?.length || 0;
    },
    locationsCount(): number {
      return this.program.spec.locationIds?.length || 0;
    },
  },
});
</script>

<style scoped>
@import "./card-styles.css";
</style>
