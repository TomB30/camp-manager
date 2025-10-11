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
            <slot name="gender-select">
              <select v-model="localFormData.gender" class="form-input" required>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </slot>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Parent Contact (Email/Phone)</label>
          <input v-model="localFormData.parentContact" type="text" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Family Group</label>
          <slot name="family-group-select"></slot>
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
      type: Object as PropType<CamperFormData>,
      required: true
    }
  },
  emits: ['close', 'save'],
  data() {
    return {
      localFormData: { ...this.formData },
      allergiesInput: this.formData.allergies.join(', ')
    };
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
    handleSave() {
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

