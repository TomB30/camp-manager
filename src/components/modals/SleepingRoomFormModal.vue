<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Cabin' : 'Add New Cabin'"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="$emit('save', formData)">
        <div class="form-group">
          <label class="form-label">Cabin Name</label>
          <input v-model="formData.name" type="text" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Number of Beds</label>
          <input v-model.number="formData.beds" type="number" min="1" max="50" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Location</label>
          <input v-model="formData.location" type="text" class="form-input" placeholder="e.g., North Wing, Floor 1" />
        </div>
      </form>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="$emit('save', formData)">
        {{ isEditing ? 'Update' : 'Add' }} Cabin
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';

interface RoomFormData {
  name: string;
  beds: number;
  location: string;
}

export default defineComponent({
  name: 'SleepingRoomFormModal',
  components: {
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object as PropType<RoomFormData>,
      required: true
    }
  },
  emits: ['close', 'save']
});
</script>

