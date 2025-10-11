<template>
  <BaseModal
    :show="show"
    title="Create New Event"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label class="form-label">Title</label>
          <input v-model="localFormData.title" type="text" class="form-input" required />
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Start Time</label>
            <input v-model="localFormData.startTime" type="time" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">End Time</label>
            <input v-model="localFormData.endTime" type="time" class="form-input" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Room</label>
          <slot name="room-select"></slot>
        </div>

        <div class="form-group">
          <label class="form-label">Capacity</label>
          <input v-model.number="localFormData.capacity" type="number" min="1" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Type</label>
          <slot name="type-select"></slot>
        </div>

        <div class="form-group">
          <label class="form-label">Color</label>
          <slot name="color-picker"></slot>
        </div>

        <div class="form-group">
          <label class="form-label">Assign Camper Groups (Optional)</label>
          <slot name="camper-groups-selection"></slot>
          <slot name="camper-groups-preview"></slot>
        </div>
      </form>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="handleSave">Create Event</button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import type { Event } from '@/types/api';

interface EventFormData {
  title: string;
  startTime: string;
  endTime: string;
  roomId: string;
  capacity: number;
  type: Event['type'];
  color: string;
  camperGroupIds: string[];
}

export default defineComponent({
  name: 'EventFormModal',
  components: {
    BaseModal,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    formData: {
      type: Object as PropType<EventFormData>,
      required: true,
    },
  },
  emits: ['close', 'save'],
  computed: {
    localFormData() {
      return this.formData;
    },
  },
  methods: {
    handleSave() {
      this.$emit('save', this.localFormData);
    },
  },
});
</script>

