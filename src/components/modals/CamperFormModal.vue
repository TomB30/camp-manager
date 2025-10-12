<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Camper' : 'Add New Camper'"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">First Name</label>
            <input v-model="localFormData.firstName" type="text" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Last Name</label>
            <input v-model="localFormData.lastName" type="text" class="form-input" required />
          </div>
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Age</label>
            <input v-model.number="localFormData.age" type="number" min="5" max="18" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Gender</label>
            <Autocomplete
              v-model="localFormData.gender"
              :options="genderOptions"
              placeholder="Select gender..."
              :required="true"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Parent Contact (Email/Phone)</label>
          <input v-model="localFormData.parentContact" type="text" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Family Group</label>
          <Autocomplete
            v-model="localFormData.familyGroupId"
            :options="familyGroupOptions"
            placeholder="Select a family group..."
            :required="true"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Allergies (comma-separated)</label>
          <input v-model="allergiesInput" type="text" class="form-input" placeholder="e.g., Peanuts, Dairy" />
        </div>

        <div class="form-group">
          <label class="form-label">Medical Notes</label>
          <textarea v-model="localFormData.medicalNotes" class="form-textarea"></textarea>
        </div>
      </form>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="handleSave">
        {{ isEditing ? 'Update' : 'Add' }} Camper
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import Autocomplete, { type AutocompleteOption } from '@/components/Autocomplete.vue';
import type { FamilyGroup } from '@/types/api';

interface CamperFormData {
  firstName: string;
  lastName: string;
  age: number;
  gender: 'male' | 'female';
  parentContact: string;
  allergies: string[];
  medicalNotes: string;
  familyGroupId?: string;
}

export default defineComponent({
  name: 'CamperFormModal',
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
      type: Object as PropType<CamperFormData>,
      required: true
    },
    familyGroups: {
      type: Array as PropType<FamilyGroup[]>,
      required: true
    }
  },
  emits: ['close', 'save'],
  data() {
    return {
      localFormData: { ...this.formData },
      allergiesInput: this.formData.allergies.join(', '),
      genderOptions: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' }
      ] as AutocompleteOption[]
    };
  },
  computed: {
    familyGroupOptions(): AutocompleteOption[] {
      return this.familyGroups.map(group => ({
        label: group.name,
        value: group.id
      }));
    }
  },
  watch: {
    formData: {
      handler(newVal) {
        this.localFormData = { ...newVal };
        this.allergiesInput = newVal.allergies.join(', ');
      },
      deep: true
    }
  },
  methods: {
    handleSave(): void {
      const allergies = this.allergiesInput
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);
      
      this.$emit('save', {
        ...this.localFormData,
        allergies
      });
    }
  }
});
</script>

