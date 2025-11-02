<template>
  <div
    class="card card-clickable card-horizontal"
    @click="$emit('click', room)"
  >
    <div class="card-icon" style="background: var(--accent-color)">
      <Icon name="Bed" :size="32" :stroke-width="2" />
    </div>
    <div class="card-details">
      <h4>{{ room.meta.name }}</h4>
      <div class="card-meta row items-center">
        <span class="badge badge-primary">{{ room.spec.beds }} beds</span>
        <span
          v-if="room.spec.bathroom"
          class="badge badge-primary"
        >
          {{ bathroomLabel }}
        </span>
        <span
          v-if="locationName"
          class="text-sm text-grey-7 text-subtitle2 row items-center q-gutter-x-xs"
        >
          <Icon name="MapPin" :size="14" class="inline" />
          <span>{{ locationName }}</span>
        </span>
      </div>
      <div v-if="groups.length > 0" class="assigned-groups mt-2">
        <div class="text-xs text-grey-7 text-subtitle2 mb-1">
          Family Groups:
        </div>
        <div class="flex gap-1 flex-wrap">
          <span
            v-for="group in groups"
            :key="group.meta.id"
            class="badge badge-success badge-sm"
          >
            {{ group.meta.name }}
          </span>
        </div>
      </div>
      <div v-else class="text-xs text-grey-7 mt-2">No groups assigned</div>
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
    locationName(): string | undefined {
      if (this.room.spec.areaId) {
        return this.areasStore.getAreaById(this.room.spec.areaId)?.meta.name;
      }
      return undefined;
    },
    bathroomLabel(): string {
      if (!this.room.spec.bathroom) return "";
      return this.room.spec.bathroom === "private" ? "Private Bathroom" : "Shared Bathroom";
    },
  },
});
</script>

<style scoped>
@import "./card-styles.css";

.assigned-groups {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
