<template>
  <div class="card clickable" @click="$emit('click', room)">
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
    <div class="row gap-2">
      <div class="card-info-item">
        <Icon name="Bed" :size="16" />
        <span>{{ room.spec.beds }} beds</span>
      </div>
      <div class="card-info-item">
        <Icon name="Toilet" :size="16" />
        <span>{{ bathroomLabel }}</span>
      </div>
      <div class="card-info-item" v-if="areaName">
        <Icon name="MapPin" :size="16" />
        <span>{{ areaName }}</span>
      </div>
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
