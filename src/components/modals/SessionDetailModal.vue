<template>
  <BaseModal show :title="session?.name || ''" @close="$emit('close')">
    <template #body>
      <div>
        <div v-if="session.description" class="detail-section">
          <div class="detail-label">Description</div>
          <div>{{ session.description }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Dates</div>
          <div>{{ formatDate(session.startDate) }} - {{ formatDate(session.endDate) }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Duration</div>
          <div>{{ calculateDuration(session.startDate, session.endDate) }}</div>
        </div>

        <div v-if="session.maxCampers" class="detail-section">
          <div class="detail-label">Maximum Campers</div>
          <div>{{ session.maxCampers }} campers</div>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-error" @click="$emit('delete', session?.id)">
        Delete Session
      </button>
      <button class="btn btn-secondary" @click="$emit('edit', session)">
        Edit
      </button>
      <button class="btn btn-secondary" @click="$emit('close')">Close</button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import type { Session } from "@/types";
import { dateUtils } from "@/utils/dateUtils";

export default defineComponent({
  name: "SessionDetailModal",
  components: {
    BaseModal,
  },
  props: {
    session: {
      type: Object as PropType<Session>,
      required: true
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
      });
    },
    formatDateTime(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    calculateDuration(startDate: string, endDate: string): string {
      return dateUtils.calculateDuration(startDate, endDate);
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
