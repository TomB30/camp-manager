<template>
  <BaseModal
    :show="show"
    :title="location?.name || ''"
    @close="$emit('close')"
  >
    <template #body>
      <div v-if="location">
        <div v-if="location.description" class="detail-section">
          <div class="detail-label">Description</div>
          <div>{{ location.description }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Type</div>
          <div>
            <span class="badge badge-primary">{{ formatLocationType(location.type) }}</span>
          </div>
        </div>

        <div v-if="location.capacity" class="detail-section">
          <div class="detail-label">Capacity</div>
          <div>{{ location.capacity }} people</div>
        </div>

        <div v-if="location.equipment && location.equipment.length > 0" class="detail-section">
          <div class="detail-label">Equipment</div>
          <div class="flex gap-1 flex-wrap">
            <span v-for="item in location.equipment" :key="item" class="badge badge-success">
              {{ item }}
            </span>
          </div>
        </div>

        <div v-if="location.notes" class="detail-section">
          <div class="detail-label">Notes</div>
          <div>{{ location.notes }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Created</div>
          <div>{{ formatDate(location.createdAt) }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Last Updated</div>
          <div>{{ formatDate(location.updatedAt) }}</div>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-error" @click="$emit('delete', location?.id)">Delete Location</button>
      <button class="btn btn-secondary" @click="$emit('edit', location)">Edit</button>
      <button class="btn btn-secondary" @click="$emit('close')">Close</button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import type { Location } from '@/types/api';

export default defineComponent({
  name: 'LocationDetailModal',
  components: {
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    location: {
      type: Object as PropType<Location | null>,
      default: null
    }
  },
  emits: ['close', 'edit', 'delete'],
  methods: {
    formatLocationType(type: string): string {
      const typeMap: Record<string, string> = {
        indoor: 'Indoor',
        outdoor: 'Outdoor',
        facility: 'Facility',
        field: 'Field',
        water: 'Water',
        other: 'Other',
      };
      return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
    },
    formatDate(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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
</style>

