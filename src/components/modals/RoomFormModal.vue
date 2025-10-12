<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Room' : 'Add New Room'"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label class="form-label">Room Name</label>
          <input v-model="localFormData.name" type="text" class="form-input" required />
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Type</label>
            <Autocomplete
              v-model="localFormData.type"
              :options="roomTypeOptions"
              placeholder="Select room type..."
              :required="true"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Capacity</label>
            <input v-model.number="localFormData.capacity" type="number" min="1" class="form-input" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Location</label>
          <input v-model="localFormData.location" type="text" class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">Equipment (comma-separated)</label>
          <input v-model="equipmentInput" type="text" class="form-input" placeholder="e.g., Projector, Tables, Chairs" />
        </div>

        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea v-model="localFormData.notes" class="form-textarea"></textarea>
        </div>
      </form>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="handleSave">
        {{ isEditing ? 'Update' : 'Add' }} Room
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import Autocomplete, { type AutocompleteOption } from '@/components/Autocomplete.vue';
import type { Room } from '@/types/api';

interface RoomFormData {
  name: string;
  type: Room['type'];
  capacity: number;
  location: string;
  equipment: string[];
  notes: string;
}

export default defineComponent({
  name: 'RoomFormModal',
  components: {
    BaseModal,
    Autocomplete
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
  emits: ['close', 'save'],
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData)),
      equipmentInput: this.formData.equipment.join(', '),
      roomTypeOptions: [
        { label: 'Classroom', value: 'classroom' },
        { label: 'Activity', value: 'activity' },
        { label: 'Sports', value: 'sports' },
        { label: 'Dining', value: 'dining' },
        { label: 'Outdoor', value: 'outdoor' },
        { label: 'Arts', value: 'arts' }
      ] as AutocompleteOption[]
    };
  },
  watch: {
    formData: {
      handler(newVal) {
        this.localFormData = JSON.parse(JSON.stringify(newVal));
        this.equipmentInput = newVal.equipment.join(', ');
      },
      deep: true
    }
  },
  methods: {
    handleSave() {
      const equipment = this.equipmentInput
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);
      
      this.$emit('save', {
        ...this.localFormData,
        equipment
      });
    }
  }
});
</script>

