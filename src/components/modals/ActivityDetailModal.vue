<template>
  <BaseModal
    :show="show"
    @close="$emit('close')"
    modal-class="modal-large"
  >
    <template #header>
      <div class="activity-title-header">
        <div 
          v-if="activity?.color" 
          class="activity-color-indicator"
          :style="{ background: activity.color }"
        ></div>
        <h3>{{ activity?.name || 'Activity Details' }}</h3>
      </div>
    </template>

    <template #body>
      <div v-if="activity" class="activity-detail">
        <div v-if="activity.description" class="detail-section">
          <h4>Description</h4>
          <p>{{ activity.description }}</p>
        </div>

        <div class="detail-section">
          <h4>Activity Settings</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Duration</span>
              <span class="detail-value"><DurationDisplay :minutes="activity.durationMinutes" format="long" /></span>
            </div>
            
            <div v-if="activity.defaultRoomId" class="detail-item">
              <span class="detail-label">Default Location</span>
              <span class="detail-value">{{ getRoomName(activity.defaultRoomId) }}</span>
            </div>
            
            <div v-if="activity.defaultCapacity" class="detail-item">
              <span class="detail-label">Default Capacity</span>
              <span class="detail-value">{{ activity.defaultCapacity }} campers</span>
            </div>
            
            <div v-if="activity.minStaff || activity.maxStaff" class="detail-item">
              <span class="detail-label">Staff Requirements</span>
              <span class="detail-value">
                <template v-if="activity.minStaff && activity.maxStaff">
                  {{ activity.minStaff }} - {{ activity.maxStaff }} staff
                </template>
                <template v-else-if="activity.minStaff">
                  Min {{ activity.minStaff }} staff
                </template>
                <template v-else-if="activity.maxStaff">
                  Max {{ activity.maxStaff }} staff
                </template>
              </span>
            </div>
          </div>
        </div>

        <div v-if="activity.requiredCertifications && activity.requiredCertifications.length > 0" class="detail-section">
          <h4>Required Certifications</h4>
          <div class="certifications-list">
            <span 
              v-for="cert in activity.requiredCertifications" 
              :key="cert"
              class="certification-badge"
            >
              {{ cert }}
            </span>
          </div>
        </div>

        <div class="detail-section">
          <h4>Programs</h4>
          <div class="programs-list">
            <span 
              v-for="programId in activity.programIds" 
              :key="programId"
              class="program-badge"
            >
              {{ getProgramName(programId) }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Close</button>
      <button class="btn btn-primary-outline" @click="$emit('edit', activity)">Edit Activity</button>
      <button class="btn btn-danger-outline" @click="$emit('delete', activity)">Delete Activity</button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { useCampStore } from '@/stores/campStore';
import BaseModal from '@/components/BaseModal.vue';
import DurationDisplay from '@/components/DurationDisplay.vue';
import type { Activity } from '@/types/api';

export default defineComponent({
  name: 'ActivityDetailModal',
  components: {
    BaseModal,
    DurationDisplay,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    activity: {
      type: Object as PropType<Activity | null>,
      default: null,
    },
  },
  emits: ['close', 'edit', 'delete'],
  computed: {
    store() {
      return useCampStore();
    },
  },
  methods: {
    getRoomName(roomId: string) {
      const room = this.store.getRoomById(roomId);
      return room?.name || 'Unknown Location';
    },
    getProgramName(programId: string) {
      const program = this.store.getProgramById(programId);
      return program?.name || 'Unknown Program';
    },
  },
});
</script>

<style scoped>
.activity-title-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.activity-color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
}

.activity-title-header h3 {
  margin: 0;
  flex: 1;
}

.activity-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-light);
}

.detail-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem 0;
}

.detail-section p {
  margin: 0;
  color: var(--text-primary);
  line-height: 1.6;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 0.9375rem;
  color: var(--text-primary);
  font-weight: 500;
}

.certifications-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.certification-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: var(--surface-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
}

.programs-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.program-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: var(--surface-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
}
</style>

