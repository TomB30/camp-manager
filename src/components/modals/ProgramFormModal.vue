<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Program' : 'Create New Program'"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label class="form-label">Program Name</label>
          <input 
            v-model="localFormData.name" 
            type="text" 
            class="form-input" 
            placeholder="e.g., Watersports, Arts & Crafts"
            required 
          />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea
            v-model="localFormData.description"
            class="form-textarea"
            rows="3"
            placeholder="Describe this program..."
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Color</label>
          <ColorPicker v-model="localFormData.color" />
        </div>
      </form>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="handleSave">
        {{ isEditing ? 'Save Changes' : 'Create Program' }}
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import ColorPicker from '@/components/ColorPicker.vue';
import type { Program } from '@/types';

interface ProgramFormData {
  name: string;
  description: string;
  color: string;
  activityIds: string[];
  staffMemberIds: string[];
  locationIds: string[];
}

export default defineComponent({
  name: 'ProgramFormModal',
  components: {
    BaseModal,
    ColorPicker,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    program: {
      type: Object as PropType<Program | null>,
      default: null,
    },
  },
  emits: ['close', 'save'],
  data() {
    return {
      localFormData: {
        name: '',
        description: '',
        color: '#6366F1',
        activityIds: [],
        staffMemberIds: [],
        locationIds: [],
      } as ProgramFormData,
    };
  },
  computed: {
    isEditing() {
      return !!this.program;
    },
  },
  watch: {
    show(newValue) {
      if (newValue) {
        this.resetForm();
      }
    },
  },
  methods: {
    resetForm() {
      if (this.program) {
        this.localFormData = {
          name: this.program.name,
          description: this.program.description || '',
          color: this.program.color || '#6366F1',
          activityIds: [...this.program.activityIds],
          staffMemberIds: [...this.program.staffMemberIds],
          locationIds: [...this.program.locationIds],
        };
      } else {
        this.localFormData = {
          name: '',
          description: '',
          color: '#6366F1',
          activityIds: [],
          staffMemberIds: [],
          locationIds: [],
        };
      }
    },
    handleSave() {
      const now = new Date().toISOString();
      const programData: Program = {
        id: this.program?.id || crypto.randomUUID(),
        name: this.localFormData.name,
        description: this.localFormData.description || undefined,
        color: this.localFormData.color,
        activityIds: this.localFormData.activityIds,
        staffMemberIds: this.localFormData.staffMemberIds,
        locationIds: this.localFormData.locationIds,
        createdAt: this.program?.createdAt || now,
        updatedAt: now,
      };

      this.$emit('save', programData);
    },
  },
});
</script>


