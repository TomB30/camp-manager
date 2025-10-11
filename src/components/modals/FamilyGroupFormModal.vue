<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Family Group' : 'Create New Family Group'"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label class="form-label">Group Name</label>
          <input v-model="localFormData.name" type="text" class="form-input" required placeholder="e.g., Eagles Family" />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="localFormData.description" class="form-textarea" placeholder="Optional description..."></textarea>
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Start Date</label>
            <input v-model="localFormData.startDate" type="date" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">End Date</label>
            <input v-model="localFormData.endDate" type="date" class="form-input" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Campers in this Group</label>
          <slot name="campers-selection"></slot>
        </div>

        <div class="form-group">
          <label class="form-label">Staff Members</label>
          <slot name="staff-selection"></slot>
        </div>

        <div class="form-group">
          <label class="form-label">Sleeping Room</label>
          <slot name="room-info"></slot>
          <slot name="room-select"></slot>
          <slot name="capacity-warning"></slot>
        </div>

        <div class="form-group">
          <label class="form-label">Group Color</label>
          <slot name="color-picker"></slot>
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

interface FamilyGroupFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  sleepingRoomId: string;
  staffMemberIds: string[];
  camperIds: string[];
  color: string;
}

export default defineComponent({
  name: 'FamilyGroupFormModal',
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
      type: Object as PropType<FamilyGroupFormData>,
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

