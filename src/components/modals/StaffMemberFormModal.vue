<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Staff Member' : 'Add New Staff Member'"
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

        <div class="form-group">
          <label class="form-label">Role</label>
          <slot name="role-select"></slot>
        </div>

        <div class="form-group">
          <label class="form-label">Manager</label>
          <slot name="manager-select"></slot>
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="localFormData.email" type="email" class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">Phone</label>
          <input v-model="localFormData.phone" type="tel" class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">Certifications (comma-separated)</label>
          <input v-model="certificationsInput" type="text" class="form-input" placeholder="e.g., CPR, First Aid" />
        </div>
      </form>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="handleSave">
        {{ isEditing ? 'Update' : 'Add' }} Member
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import type { StaffMember } from '@/types/api';

interface StaffMemberFormData {
  firstName: string;
  lastName: string;
  role: StaffMember['role'];
  email: string;
  phone: string;
  certifications: string[];
  managerId: string;
}

export default defineComponent({
  name: 'StaffMemberFormModal',
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
      type: Object as PropType<StaffMemberFormData>,
      required: true
    }
  },
  emits: ['close', 'save'],
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData)),
      certificationsInput: this.formData.certifications.join(', ')
    };
  },
  watch: {
    formData: {
      handler(newVal) {
        this.localFormData = JSON.parse(JSON.stringify(newVal));
        this.certificationsInput = newVal.certifications.join(', ');
      },
      deep: true
    }
  },
  methods: {
    handleSave() {
      const certifications = this.certificationsInput
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);
      
      this.$emit('save', {
        ...this.localFormData,
        certifications
      });
    }
  }
});
</script>

