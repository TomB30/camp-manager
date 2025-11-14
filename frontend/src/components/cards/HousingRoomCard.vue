<template>
  <div class="card" @click="$emit('click', room)">
    <div class="card-header">
      <div class="card-icon" style="background: var(--accent-color)">
        <Icon name="Bed" :size="32" :stroke-width="2" />
      </div>
      <div>
        <h4>{{ room.meta.name }}</h4>
        <p v-if="room.meta.description" class="card-description">
          {{ room.meta.description }}
        </p>
      </div>
    </div>
    <div class="card-meta row items-center gap-1">
      <span class="badge badge-primary">{{ room.spec.beds }} beds</span>
      <span v-if="room.spec.bathroom" class="badge badge-primary">
        {{ bathroomLabel }}
      </span>
      <span v-if="areaName" class="row items-center q-gutter-x-xs">
        <Icon name="MapPin" :size="14" class="inline" />
        <span>{{ areaName }}</span>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { HousingRoom, Group } from "@/generated/api";
import { useAreasStore } from "@/stores";
import Icon from "../Icon.vue";

export default defineComponent({
  name: "HousingRoomCard",
  components: {
    Icon,
  },
  props: {
    room: {
      type: Object as PropType<HousingRoom>,
      required: true,
    },
    groups: {
      type: Array as PropType<Group[]>,
      default: () => [],
    },
  },
  emits: ["click"],
  setup() {
    const areasStore = useAreasStore();
    return { areasStore };
  },
  computed: {
    areaName(): string | undefined {
      if (this.room.spec.areaId) {
        return this.areasStore.getAreaById(this.room.spec.areaId)?.meta.name;
      }
      return undefined;
    },
    bathroomLabel(): string {
      if (!this.room.spec.bathroom) return "";
      return this.room.spec.bathroom === "private"
        ? "Private Bathroom"
        : "Shared Bathroom";
    },
  },
});
</script>

<style scoped></style>
