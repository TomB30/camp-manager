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
          <label class="form-label">Certifications</label>
          <SelectionList
            v-model="localFormData.certificationIds"
            :items="store.certifications"
            item-type="certification"
            placeholder="Select a certification..."
            empty-text="No certifications selected"
            add-button-text="Add"
            mode="multiple"
            :get-label-fn="(cert) => cert.name"
            :get-initials-fn="(cert) => cert.name.substring(0, 2).toUpperCase()"
            :get-options-fn="(cert) => ({ label: cert.name, value: cert.id })"
          />
          <p class="form-help-text">Select certifications from the prepared list</p>
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
import SelectionList from '@/components/SelectionList.vue';
import { useCampStore } from '@/stores/campStore';
import type { StaffMember } from '@/types/api';

interface StaffMemberFormData {
  firstName: string;
  lastName: string;
  role: StaffMember['role'];
  email: string;
  phone: string;
  certificationIds: string[];
  managerId: string;
}

export default defineComponent({
  name: 'StaffMemberFormModal',
  components: {
    BaseModal,
    Autocomplete,
    SelectionList
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
  setup() {
    const store = useCampStore();
    return { store };
  },
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData)),
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
.form-help-text {
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>

