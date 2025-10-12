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
          <ColorPicker v-model="localFormData.color" />
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
          <Autocomplete
            v-model="localFormData.filters.gender"
            :options="genderFilterOptions"
            placeholder="Any gender"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Allergies</label>
          <Autocomplete
            v-model="localFormData.filters.hasAllergies"
            :options="allergiesFilterOptions"
            placeholder="Any (with or without allergies)"
          />
        </div>

        <div class="form-divider">
          <span>Family Groups (Optional)</span>
        </div>

        <div class="form-group">
          <label class="form-label">Include Family Groups</label>
          <p class="form-help-text">Select family groups to include all their campers in this virtual group</p>
          <div class="checkbox-group">
            <label 
              v-for="familyGroup in familyGroups" 
              :key="familyGroup.id"
              class="checkbox-label"
            >
              <input 
                type="checkbox" 
                :value="familyGroup.id"
                v-model="localFormData.familyGroupIds"
                class="checkbox-input"
              />
              <span>{{ familyGroup.name }} ({{ getCampersInFamilyGroup(familyGroup.id) }} campers)</span>
            </label>
            <div v-if="familyGroups.length === 0" class="text-sm text-secondary">
              No family groups available
            </div>
          </div>
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
import Autocomplete, { type AutocompleteOption } from '@/components/Autocomplete.vue';
import ColorPicker from '@/components/ColorPicker.vue';
import type { FamilyGroup, Camper } from '@/types/api';

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
  familyGroupIds?: string[];
}

export default defineComponent({
  name: 'GroupFormModal',
  components: {
    BaseModal,
    Autocomplete,
    ColorPicker
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
    },
    familyGroups: {
      type: Array as PropType<FamilyGroup[]>,
      required: true
    },
    campers: {
      type: Array as PropType<Camper[]>,
      required: true
    }
  },
  emits: ['close', 'save'],
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData)),
      genderFilterOptions: [
        { label: 'Any Gender', value: '' },
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' }
      ] as AutocompleteOption[],
      allergiesFilterOptions: [
        { label: 'Any (with or without allergies)', value: undefined },
        { label: 'Has Allergies', value: true },
        { label: 'No Allergies', value: false }
      ] as AutocompleteOption[]
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
    getCampersInFamilyGroup(familyGroupId: string): number {
      return this.campers.filter(c => c.familyGroupId === familyGroupId).length;
    },
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

.form-help-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius);
  transition: background 0.15s ease;
}

.checkbox-label:hover {
  background: var(--background);
}

.checkbox-input {
  cursor: pointer;
}
</style>

