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
          <Autocomplete
            v-model="localFormData.role"
            :options="roleOptions"
            placeholder="Select role..."
            :required="true"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Manager</label>
          <Autocomplete
            v-model="localFormData.managerId"
            :options="managerOptions"
            placeholder="No Manager (Top Level)"
          />
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
import Autocomplete, { type AutocompleteOption } from '@/components/Autocomplete.vue';
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
      type: Object as PropType<StaffMemberFormData>,
      required: true
    },
    staffMembers: {
      type: Array as PropType<StaffMember[]>,
      required: true
    },
    currentMemberId: {
      type: String,
      default: ''
    }
  },
  emits: ['close', 'save'],
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData)),
      certificationsInput: this.formData.certifications.join(', '),
      roleOptions: [
        { label: 'Counselor', value: 'counselor' },
        { label: 'Supervisor', value: 'supervisor' },
        { label: 'Director', value: 'director' },
        { label: 'Nurse', value: 'nurse' },
        { label: 'Instructor', value: 'instructor' }
      ] as AutocompleteOption[]
    };
  },
  computed: {
    managerOptions(): AutocompleteOption[] {
      // Filter out the current member to prevent self-assignment
      return this.staffMembers
        .filter(m => m.id !== this.currentMemberId)
        .map(member => ({
          label: `${member.firstName} ${member.lastName} (${member.role})`,
          value: member.id
        }));
    }
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

