<template>
  <BaseModal
    :show="show"
    :title="group?.name || ''"
    modal-class="modal-lg"
    @close="$emit('close')"
  >
    <template #body>
      <div v-if="group">
        <div class="detail-section">
          <div class="detail-label">Description</div>
          <div>{{ group.description || 'No description provided' }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Dates</div>
          <div>
            <span class="badge badge-primary">
              {{ formatDate(group.startDate) }} - {{ formatDate(group.endDate) }}
            </span>
            <div class="text-xs text-secondary mt-1">
              {{ getDayCount(group.startDate, group.endDate) }} days
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Sleeping Room</div>
          <slot name="sleeping-room">
            <div class="text-secondary">No sleeping room assigned</div>
          </slot>
        </div>

        <div class="detail-section">
          <div class="detail-label">Staff Members</div>
          <slot name="staff-members">
            <div class="text-secondary">No staff members assigned</div>
          </slot>
        </div>

        <div class="detail-section">
          <div class="detail-label">Campers ({{ campers.length }})</div>
          <slot name="campers-list">
            <div class="text-secondary">No campers in this family group yet.</div>
          </slot>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-error" @click="$emit('delete')">Delete Group</button>
      <button class="btn btn-secondary" @click="$emit('edit')">Edit</button>
      <button class="btn btn-secondary" @click="$emit('close')">Close</button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import type { FamilyGroup, Camper } from '@/types/api';

export default defineComponent({
  name: 'FamilyGroupDetailModal',
  components: {
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    group: {
      type: Object as PropType<FamilyGroup | null>,
      default: null
    },
    campers: {
      type: Array as PropType<Camper[]>,
      default: () => []
    }
  },
  emits: ['close', 'edit', 'delete'],
  methods: {
    formatDate(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },
    getDayCount(startDate: string, endDate: string): number {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
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

.modal-lg {
  max-width: 800px;
}
</style>

