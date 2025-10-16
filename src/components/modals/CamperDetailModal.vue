<template>
  <BaseModal
    :show="show"
    :title="camper ? `${camper.firstName} ${camper.lastName}` : ''"
    @close="$emit('close')"
  >
    <template #body>
      <div v-if="camper">
        <div class="detail-section">
          <div class="detail-label">Age</div>
          <div>{{ camper.age }} years old</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Parent Contact</div>
          <div>{{ camper.parentContact }}</div>
        </div>

        <div v-if="camper.allergies && camper.allergies.length > 0" class="detail-section">
          <div class="detail-label">Allergies</div>
          <div class="flex gap-1 flex-wrap">
            <span v-for="allergy in camper.allergies" :key="allergy" class="badge badge-warning">
              {{ allergy }}
            </span>
          </div>
        </div>

        <div v-if="camper.medicalNotes" class="detail-section">
          <div class="detail-label">Medical Notes</div>
          <div>{{ camper.medicalNotes }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Gender</div>
          <div>
            <span class="badge badge-primary">{{ formatGender(camper.gender) }}</span>
          </div>
        </div>

        <div v-if="camper.registrationDate" class="detail-section">
          <div class="detail-label">Registration Date</div>
          <div>{{ formatDate(camper.registrationDate) }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Session</div>
          <slot name="session">
            <div class="text-secondary">Not registered for a session</div>
          </slot>
        </div>

        <div class="detail-section">
          <div class="detail-label">Family Group</div>
          <slot name="family-group">
            <div class="text-secondary">Not assigned to a family group</div>
          </slot>
        </div>

        <div class="detail-section">
          <div class="detail-label">Enrolled Events</div>
          <slot name="events">
            <div class="text-secondary">No events enrolled</div>
          </slot>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-error" @click="$emit('delete')">Delete Camper</button>
      <button class="btn btn-secondary" @click="$emit('edit')">Edit</button>
      <button class="btn btn-secondary" @click="$emit('close')">Close</button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import type { Camper } from '@/types';
import { format } from 'date-fns';

export default defineComponent({
  name: 'CamperDetailModal',
  components: {
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    camper: {
      type: Object as PropType<Camper | null>,
      default: null
    }
  },
  emits: ['close', 'edit', 'delete'],
  methods: {
    formatGender(gender: string): string {
      return gender.charAt(0).toUpperCase() + gender.slice(1);
    },
    formatDate(dateStr: string): string {
      return format(new Date(dateStr), 'MMMM d, yyyy');
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

