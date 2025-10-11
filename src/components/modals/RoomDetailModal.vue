<template>
  <BaseModal
    :show="show"
    :title="room?.name || ''"
    @close="$emit('close')"
  >
    <template #body>
      <div v-if="room">
        <div class="detail-section">
          <div class="detail-label">Type</div>
          <div>
            <span class="badge badge-primary">{{ formatRoomType(room.type) }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Capacity</div>
          <div>{{ room.capacity }} people</div>
        </div>

        <div v-if="room.location" class="detail-section">
          <div class="detail-label">Location</div>
          <div>{{ room.location }}</div>
        </div>

        <div v-if="room.equipment && room.equipment.length > 0" class="detail-section">
          <div class="detail-label">Equipment</div>
          <div class="flex gap-1 flex-wrap">
            <span v-for="item in room.equipment" :key="item" class="badge badge-success">
              {{ item }}
            </span>
          </div>
        </div>

        <div v-if="room.notes" class="detail-section">
          <div class="detail-label">Notes</div>
          <div>{{ room.notes }}</div>
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
      <button class="btn btn-error" @click="$emit('delete')">Delete Room</button>
      <button class="btn btn-secondary" @click="$emit('edit')">Edit</button>
      <button class="btn btn-secondary" @click="$emit('close')">Close</button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import type { Room } from '@/types/api';

export default defineComponent({
  name: 'RoomDetailModal',
  components: {
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    room: {
      type: Object as PropType<Room | null>,
      default: null
    }
  },
  emits: ['close', 'edit', 'delete'],
  methods: {
    formatRoomType(type: string): string {
      return type.charAt(0).toUpperCase() + type.slice(1);
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

