<template>
  <BaseModal :title="certification?.meta.name || ''" @close="$emit('close')">
    <template #body>
      <div v-if="certification">
        <div v-if="certification.meta.description" class="detail-section">
          <div class="detail-label">Description</div>
          <div>{{ certification.meta.description }}</div>
        </div>

        <div v-if="certification.meta.createdAt" class="detail-section">
          <div class="detail-label">Created</div>
          <div>{{ formatDate(certification.meta.createdAt) }}</div>
        </div>

        <div v-if="certification.meta.updatedAt" class="detail-section">
          <div class="detail-label">Last Updated</div>
          <div>{{ formatDate(certification.meta.updatedAt) }}</div>
        </div>
      </div>
    </template>

    <template #footer>
      <BaseButton
        outline
        color="negative"
        @click="$emit('delete', certification?.meta.id)"
        label="Delete"
      />
      <BaseButton
        outline
        color="grey-8"
        @click="$emit('edit', certification)"
        label="Edit"
      />
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import type { Certification } from "@/generated/api";

export default defineComponent({
  name: "CertificationDetailModal",
  components: {
    BaseModal,
  },
  props: {
    certification: {
      type: Object as PropType<Certification | null>,
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
