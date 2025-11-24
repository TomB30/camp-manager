<template>
  <div class="card clickable" @click="$emit('click', program)">
    <div class="card-header">
      <div class="card-icon" :style="{ background: programColor }">
        <Icon name="Boxes" :size="24" />
      </div>
      <div>
        <h4>{{ program.meta.name }}</h4>
        <p v-if="program.meta.description" class="card-description">
          {{ program.meta.description }}
        </p>
      </div>
    </div>

    <div class="row gap-2">
      <div class="card-info-item" v-if="staffGroupsCount > 0">
        <Icon name="Users" :size="16" />
        <span>
          {{ staffGroupsCount }} staff group{{
            staffGroupsCount !== 1 ? "s" : ""
          }}
        </span>
      </div>
      <div class="card-info-item" v-if="locationsCount > 0">
        <Icon name="MapPin" :size="16" />
        <span>
          {{ locationsCount }} location{{ locationsCount !== 1 ? "s" : "" }}
        </span>
      </div>
      <div class="card-info-item" v-if="activitiesCount > 0">
        <Icon name="Bike" :size="16" />
        <span>
          {{ activitiesCount }} activit{{ activitiesCount !== 1 ? "ies" : "y" }}
        </span>
      </div>
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
