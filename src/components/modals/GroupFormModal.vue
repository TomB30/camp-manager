<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Group' : 'Create New Group'"
    modal-class="modal-large"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label class="form-label">Group Name *</label>
          <input v-model="localFormData.name" type="text" class="form-input" required placeholder="e.g., Junior Campers" />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea 
            v-model="localFormData.description" 
            class="form-textarea" 
            rows="2"
            placeholder="Optional description of this group"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Color</label>
          <slot name="color-picker"></slot>
        </div>

        <div class="form-divider">
          <span>Filter Criteria</span>
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Minimum Age</label>
            <input 
              v-model.number="localFormData.filters.ageMin" 
              type="number" 
              min="5" 
              max="18" 
              class="form-input"
              placeholder="No minimum"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Maximum Age</label>
            <input 
              v-model.number="localFormData.filters.ageMax" 
              type="number" 
              min="5" 
              max="18" 
              class="form-input"
              placeholder="No maximum"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Gender</label>
          <slot name="gender-select"></slot>
        </div>

        <div class="form-group">
          <label class="form-label">Allergies</label>
          <slot name="allergies-select"></slot>
        </div>

        <div class="form-info">
          <strong>Preview:</strong> {{ previewCount }} campers match these criteria
        </div>
      </form>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="handleSave">
        {{ isEditing ? 'Update' : 'Create' }} Group
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';

interface GroupFilters {
  ageMin?: number;
  ageMax?: number;
  gender: '' | 'male' | 'female';
  hasAllergies?: boolean;
}

interface GroupFormData {
  name: string;
  description: string;
  color: string;
  filters: GroupFilters;
}

export default defineComponent({
  name: 'GroupFormModal',
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
      type: Object as PropType<GroupFormData>,
      required: true
    },
    previewCount: {
      type: Number,
      default: 0
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
.form-divider {
  margin: 1.5rem 0;
  text-align: center;
  position: relative;
}

.form-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border-color);
}

.form-divider span {
  position: relative;
  background: var(--background);
  padding: 0 1rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
}

.form-info {
  padding: 1rem;
  background: var(--info-bg, #EFF6FF);
  border: 1px solid var(--info-border, #BFDBFE);
  border-radius: var(--radius);
  color: var(--info-text, #1E40AF);
  font-size: 0.875rem;
}

.modal-large {
  max-width: 700px;
}
</style>

