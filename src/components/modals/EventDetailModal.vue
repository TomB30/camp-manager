<template>
  <BaseModal
    :show="show"
    :title="event?.title || ''"
    @close="$emit('close')"
  >
    <template #body>
      <div v-if="event">
        <div class="mb-3">
          <div class="text-sm text-secondary mb-1">Time</div>
          <slot name="time"></slot>
        </div>

        <div class="mb-3">
          <div class="text-sm text-secondary mb-1">Room</div>
          <slot name="room"></slot>
        </div>

        <div class="mb-3">
          <div class="text-sm text-secondary mb-1">Capacity</div>
          <slot name="capacity"></slot>
        </div>

        <div class="mb-3">
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm text-secondary">Enrolled Campers</div>
          </div>

          <!-- Quick Assign Group Section -->
          <slot name="quick-assign-group"></slot>

          <!-- Enrolled Campers List (with drag and drop support) -->
          <slot name="enrolled-campers"></slot>
        </div>

        <div class="mb-3">
          <div class="text-sm text-secondary mb-1">Assigned Staff</div>
          <slot name="assigned-staff"></slot>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-error" @click="$emit('delete')">Delete Event</button>
      <button class="btn btn-secondary" @click="$emit('edit')">Edit</button>
      <button class="btn btn-secondary" @click="$emit('close')">Close</button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import type { Event } from '@/types/api';

export default defineComponent({
  name: 'EventDetailModal',
  components: {
    BaseModal,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    event: {
      type: Object as PropType<Event | null>,
      default: null,
    },
  },
  emits: ['close', 'edit', 'delete'],
});
</script>

