<template>
  <BaseModal :title="area?.meta.name || ''" @close="$emit('close')">
    <template #body>
      <div v-if="area">
        <div v-if="area.meta.description" class="detail-section">
          <div class="detail-label">Description</div>
          <div>{{ area.meta.description }}</div>
        </div>

        <div v-if="area.spec.capacity" class="detail-section">
          <div class="detail-label">Capacity</div>
          <div>{{ area.spec.capacity }} people</div>
        </div>

        <div
          v-if="area.spec.equipment && area.spec.equipment.length > 0"
          class="detail-section"
        >
          <div class="detail-label">Equipment</div>
          <div class="flex gap-1 flex-wrap">
            <span
              v-for="item in area.spec.equipment"
              :key="item"
              class="badge badge-success"
            >
              {{ item }}
            </span>
          </div>
        </div>

        <div v-if="area.spec.notes" class="detail-section">
          <div class="detail-label">Notes</div>
          <div>{{ area.spec.notes }}</div>
        </div>

        <div v-if="area.meta.createdAt" class="detail-section">
          <div class="detail-label">Created</div>
          <div>{{ formatDate(area.meta.createdAt) }}</div>
        </div>

        <div v-if="area.meta.updatedAt" class="detail-section">
          <div class="detail-label">Last Updated</div>
          <div>{{ formatDate(area.meta.updatedAt) }}</div>
        </div>
      </div>
    </template>

    <template #footer>
      <BaseButton
        outline
        color="negative"
        @click="$emit('delete', area?.meta.id)"
        label="Delete"
      />
      <BaseButton
        outline
        color="grey-8"
        @click="$emit('edit', area)"
        label="Edit"
      />
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import type { Area } from "@/generated/api";

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
