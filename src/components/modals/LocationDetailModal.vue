<template>
  <BaseModal :title="location?.name || ''" @close="$emit('close')">
    <template #body>
      <div v-if="location">
        <div class="detail-section">
          <div class="detail-label">Type</div>
          <div>
            <span class="badge badge-primary">{{
              formatLocationType(location.type)
            }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Capacity</div>
          <div>{{ location.capacity }} people</div>
        </div>

        <div v-if="location.areaId" class="detail-section">
          <div class="detail-label">Area</div>
          <div>{{ getAreaName(location.areaId) }}</div>
        </div>

        <div
          v-if="location.equipment && location.equipment.length > 0"
          class="detail-section"
        >
          <div class="detail-label">Equipment</div>
          <div class="flex gap-1 flex-wrap">
            <span
              v-for="item in location.equipment"
              :key="item"
              class="badge badge-success"
            >
              {{ item }}
            </span>
          </div>
        </div>

        <div v-if="location.notes" class="detail-section">
          <div class="detail-label">Notes</div>
          <div>{{ location.notes }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Scheduled Events</div>
          <slot name="events-list">
            <div class="text-grey-7">No events scheduled</div>
          </slot>
        </div>
      </div>
    </template>

    <template #footer>
      <BaseButton outline color="negative" @click="$emit('delete')" label="Delete" />
      <BaseButton outline color="grey-8" @click="$emit('edit')" label="Edit" />
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import type { Location } from "@/types";
import { useAreasStore } from "@/stores";

export default defineComponent({
  name: "LocationDetailModal",
  components: {
    BaseModal,
  },
  props: {
    location: {
      type: Object as PropType<Location | null>,
      default: null,
    },
  },
  emits: ["close", "edit", "delete"],
  setup() {
    const areasStore = useAreasStore();
    return { areasStore };
  },
  methods: {
    formatLocationType(type: string): string {
      return type.charAt(0).toUpperCase() + type.slice(1);
    },
    getAreaName(areaId: string): string {
      const area = this.areasStore.getAreaById(areaId);
      return area?.name || "Unknown";
    },
  },
});
</script>

<style scoped>
.detail-section {
  margin-bottom: 1.5rem;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}
</style>
