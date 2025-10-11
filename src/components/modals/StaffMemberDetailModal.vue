<template>
  <BaseModal
    :show="show"
    :title="member ? `${member.firstName} ${member.lastName}` : ''"
    @close="$emit('close')"
  >
    <template #body>
      <div v-if="member">
        <div class="detail-section">
          <div class="detail-label">Role</div>
          <div>
            <span class="badge badge-primary">{{ formatRole(member.role) }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Manager</div>
          <slot name="manager-info">
            <div>
              <span class="badge badge-success">None</span>
            </div>
          </slot>
        </div>

        <div class="detail-section">
          <div class="detail-label">Direct Reports</div>
          <slot name="direct-reports">
            <div class="text-secondary">No direct reports</div>
          </slot>
        </div>

        <div v-if="member.email" class="detail-section">
          <div class="detail-label">Email</div>
          <div>{{ member.email }}</div>
        </div>

        <div v-if="member.phone" class="detail-section">
          <div class="detail-label">Phone</div>
          <div>{{ member.phone }}</div>
        </div>

        <div v-if="member.certifications && member.certifications.length > 0" class="detail-section">
          <div class="detail-label">Certifications</div>
          <div class="flex gap-1 flex-wrap">
            <span v-for="cert in member.certifications" :key="cert" class="badge badge-success">
              {{ cert }}
            </span>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Assigned Events</div>
          <slot name="events-list">
            <div class="text-secondary">No events assigned</div>
          </slot>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-error" @click="$emit('delete')">Delete Member</button>
      <button class="btn btn-secondary" @click="$emit('edit')">Edit</button>
      <button class="btn btn-secondary" @click="$emit('close')">Close</button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import type { StaffMember } from '@/types/api';

export default defineComponent({
  name: 'StaffMemberDetailModal',
  components: {
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    member: {
      type: Object as PropType<StaffMember | null>,
      default: null
    }
  },
  emits: ['close', 'edit', 'delete'],
  methods: {
    formatRole(role: string): string {
      return role.charAt(0).toUpperCase() + role.slice(1);
    }
  }
});
</script>

<style scoped>
.detail-section {
  margin-bottom: 1.5rem;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}
</style>

