<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Location' : 'Add New Location'"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label class="form-label">Location Name</label>
          <input v-model="localFormData.name" type="text" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="localFormData.description" class="form-textarea" rows="2"></textarea>
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Type</label>
            <Autocomplete
              v-model="localFormData.type"
              :options="locationTypeOptions"
              placeholder="Select location type..."
              :required="true"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Capacity</label>
            <input v-model.number="localFormData.capacity" type="number" min="0" class="form-input" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Equipment (comma-separated)</label>
          <input v-model="equipmentInput" type="text" class="form-input" placeholder="e.g., Tables, Chairs, Sound System" />
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
        {{ isEditing ? 'Update' : 'Add' }} Location
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import Autocomplete, { type AutocompleteOption } from '@/components/Autocomplete.vue';
import type { Location } from '@/types/api';

interface LocationFormData {
  name: string;
  description: string;
  type: Location['type'];
  capacity?: number;
  equipment: string[];
  notes: string;
}

export default defineComponent({
  name: 'LocationFormModal',
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
      type: Object as PropType<LocationFormData>,
      required: true
    }
  },
  emits: ['close', 'save'],
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData)),
      equipmentInput: this.formData.equipment.join(', '),
      locationTypeOptions: [
        { label: 'Indoor', value: 'indoor' },
        { label: 'Outdoor', value: 'outdoor' },
        { label: 'Facility', value: 'facility' },
        { label: 'Field', value: 'field' },
        { label: 'Water', value: 'water' },
        { label: 'Other', value: 'other' }
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

