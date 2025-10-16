<template>
  <BaseModal
    :show="show"
    :title="session?.name || ''"
    @close="$emit('close')"
  >
    <template #body>
      <div v-if="session">
        <div v-if="session.description" class="detail-section">
          <div class="detail-label">Description</div>
          <div>{{ session.description }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Start Date</div>
          <div>{{ formatDate(session.startDate) }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">End Date</div>
          <div>{{ formatDate(session.endDate) }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Duration</div>
          <div>{{ calculateDuration(session.startDate, session.endDate) }}</div>
        </div>

        <div v-if="session.maxCampers" class="detail-section">
          <div class="detail-label">Maximum Campers</div>
          <div>{{ session.maxCampers }} campers</div>
        </div>

        <div v-if="session.createdAt" class="detail-section">
          <div class="detail-label">Created</div>
          <div>{{ formatDateTime(session.createdAt) }}</div>
        </div>

        <div v-if="session.updatedAt" class="detail-section">
          <div class="detail-label">Last Updated</div>
          <div>{{ formatDateTime(session.updatedAt) }}</div>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-error" @click="$emit('delete', session?.id)">Delete Session</button>
      <button class="btn btn-secondary" @click="$emit('edit', session)">Edit</button>
      <button class="btn btn-secondary" @click="$emit('close')">Close</button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import type { CampSession } from '@/types';

export default defineComponent({
  name: 'SessionDetailModal',
  components: {
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    session: {
      type: Object as PropType<CampSession | null>,
      default: null
    }
  },
  emits: ['close', 'edit', 'delete'],
  methods: {
    formatDate(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    formatDateTime(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    calculateDuration(startDate: string, endDate: string): string {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return '1 day';
      if (diffDays === 1) return '2 days';
      if (diffDays < 7) return `${diffDays + 1} days`;
      
      const weeks = Math.floor((diffDays + 1) / 7);
      const remainingDays = (diffDays + 1) % 7;
      
      if (remainingDays === 0) {
        return weeks === 1 ? '1 week' : `${weeks} weeks`;
      } else {
        return `${weeks} week${weeks > 1 ? 's' : ''}, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
      }
    },
  }
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

