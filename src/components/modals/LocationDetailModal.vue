<template>
  <BaseModal
    :show="show"
    :title="location?.name || ''"
    @close="$emit('close')"
  >
    <template #body>
      <div v-if="location">
        <div class="detail-section">
          <div class="detail-label">Type</div>
          <div>
            <span class="badge badge-primary">{{ formatLocationType(location.type) }}</span>
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
          <div class="detail-label">Scheduled Events</div>
          <slot name="events-list">
            <div class="text-secondary">No events scheduled</div>
          </slot>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-error" @click="$emit('delete')">Delete Location</button>
      <button class="btn btn-secondary" @click="$emit('edit')">Edit</button>
      <button class="btn btn-secondary" @click="$emit('close')">Close</button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import type { Location } from '@/types/api';
import { useCampStore } from '@/stores/campStore';

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
  setup() {
    const store = useCampStore();
    return { store };
  },
  methods: {
    formatLocationType(type: string): string {
      return type.charAt(0).toUpperCase() + type.slice(1);
    },
    getAreaName(areaId: string): string {
      const area = this.store.getAreaById(areaId);
      return area?.name || 'Unknown';
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

