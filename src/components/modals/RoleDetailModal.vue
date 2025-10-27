<template>
  <BaseModal :title="role?.meta.name || ''" @close="$emit('close')">
    <template #body>
      <div v-if="role">
        <div v-if="role.meta.description" class="detail-section">
          <div class="detail-label">Description</div>
          <div>{{ role.meta.description }}</div>
        </div>

        <div v-if="!role.meta.description" class="detail-section">
          <div class="detail-label">Description</div>
          <div class="text-caption">No description provided</div>
        </div>

        <div v-if="role.meta.createdAt" class="detail-section">
          <div class="detail-label">Created</div>
          <div>{{ formatDate(role.meta.createdAt) }}</div>
        </div>

        <div v-if="role.meta.updatedAt" class="detail-section">
          <div class="detail-label">Last Updated</div>
          <div>{{ formatDate(role.meta.updatedAt) }}</div>
        </div>
      </div>
    </template>

    <template #footer>
      <BaseButton
        outline
        color="negative"
        @click="$emit('delete', role?.meta.id)"
        label="Delete"
      />
      <BaseButton
        outline
        color="grey-8"
        @click="$emit('edit', role)"
        label="Edit"
      />
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import type { Role } from "@/types";

export default defineComponent({
  name: "RoleDetailModal",
  components: {
    BaseModal,
  },
  props: {
    role: {
      type: Object as PropType<Role | null>,
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
