<template>
  <BaseModal :title="area?.name || ''" @close="$emit('close')">
    <template #body>
      <div v-if="area">
        <div v-if="area.description" class="detail-section">
          <div class="detail-label">Description</div>
          <div>{{ area.description }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Type</div>
          <div>
            <span class="badge badge-primary">{{
              formatAreaType(area.type || "other")
            }}</span>
          </div>
        </div>

        <div v-if="area.capacity" class="detail-section">
          <div class="detail-label">Capacity</div>
          <div>{{ area.capacity }} people</div>
        </div>

        <div
          v-if="area.equipment && area.equipment.length > 0"
          class="detail-section"
        >
          <div class="detail-label">Equipment</div>
          <div class="flex gap-1 flex-wrap">
            <span
              v-for="item in area.equipment"
              :key="item"
              class="badge badge-success"
            >
              {{ item }}
            </span>
          </div>
        </div>

        <div v-if="area.notes" class="detail-section">
          <div class="detail-label">Notes</div>
          <div>{{ area.notes }}</div>
        </div>

        <div v-if="area.createdAt" class="detail-section">
          <div class="detail-label">Created</div>
          <div>{{ formatDate(area.createdAt) }}</div>
        </div>

        <div v-if="area.updatedAt" class="detail-section">
          <div class="detail-label">Last Updated</div>
          <div>{{ formatDate(area.updatedAt) }}</div>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-error" @click="$emit('delete', area?.id)">
        Delete Area
      </button>
      <button class="btn btn-secondary" @click="$emit('edit', area)">
        Edit
      </button>
      <button class="btn btn-secondary" @click="$emit('close')">Close</button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import type { Area } from "@/types";

export default defineComponent({
  name: "AreaDetailModal",
  components: {
    BaseModal,
  },
  props: {
    area: {
      type: Object as PropType<Area | null>,
      default: null,
    },
  },
  emits: ["close", "edit", "delete"],
  methods: {
    formatAreaType(type: string): string {
      const typeMap: Record<string, string> = {
        indoor: "Indoor",
        outdoor: "Outdoor",
        facility: "Facility",
        field: "Field",
        water: "Water",
        other: "Other",
      };
      return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
    },
    formatDate(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
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
