<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Certification' : 'Add New Certification'"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label class="form-label">Certification Name</label>
          <input v-model="localFormData.name" type="text" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="localFormData.description" class="form-textarea" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label class="form-checkbox-wrapper">
            <input v-model="localFormData.expirationRequired" type="checkbox" class="form-checkbox" />
            <span class="form-checkbox-label">Requires Expiration Tracking</span>
          </label>
          <p class="form-help-text">Check this if the certification needs to be renewed periodically</p>
        </div>

        <div v-if="localFormData.expirationRequired" class="form-group">
          <label class="form-label">Validity Period (months)</label>
          <input 
            v-model.number="localFormData.validityPeriodMonths" 
            type="number" 
            min="1" 
            class="form-input" 
            placeholder="e.g., 12, 24, 36"
          />
          <p class="form-help-text">How many months the certification remains valid</p>
        </div>
      </form>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="handleSave">
        {{ isEditing ? 'Update' : 'Add' }} Certification
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';

interface CertificationFormData {
  name: string;
  description: string;
  expirationRequired: boolean;
  validityPeriodMonths?: number;
}

export default defineComponent({
  name: 'CertificationFormModal',
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
      type: Object as PropType<CertificationFormData>,
      required: true
    }
  },
  emits: ['close', 'save'],
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData))
    };
  },
  watch: {
    formData: {
      handler(newVal) {
        this.localFormData = JSON.parse(JSON.stringify(newVal));
      },
      deep: true
    }
  },
  methods: {
    handleSave() {
      this.$emit('save', this.localFormData);
    }
  }
});
</script>

<style scoped>
.form-checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.form-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.form-checkbox-label {
  font-weight: 500;
  color: var(--text-primary);
}

.form-help-text {
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>

