<template>
  <BaseModal @close="$emit('close')">
    <template #header>
      <div class="activity-title-header">
        <h3>{{ activity?.meta.name || "Activity Details" }}</h3>
      </div>
    </template>

    <template #body>
      <div v-if="activity" class="activity-detail">
        <div v-if="activity.meta.description" class="detail-section">
          <h4>Description</h4>
          <p>{{ activity.meta.description }}</p>
        </div>

        <div class="detail-section">
          <h4>Activity Settings</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Duration</span>
              <span class="detail-value"
                ><DurationDisplay
                  :minutes="activity.spec.duration || 0"
                  format="long"
              /></span>
            </div>

            <div v-if="activity.spec.defaultLocationId" class="detail-item">
              <span class="detail-label">Default Location</span>
              <span class="detail-value">{{
                getLocationName(activity.spec.defaultLocationId)
              }}</span>
            </div>

            <div v-if="activity.spec.defaultCapacity" class="detail-item">
              <span class="detail-label">Default Capacity</span>
              <span class="detail-value"
                >{{ activity.spec.defaultCapacity }} campers</span
              >
            </div>

            <div v-if="activity.spec.minStaff" class="detail-item">
              <span class="detail-label">Staff Requirements</span>
              <span class="detail-value">
                <template v-if="activity.spec.minStaff">
                  Min {{ activity.spec.minStaff }} staff
                </template>
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="
            activity.spec.requiredCertificationIds &&
            activity.spec.requiredCertificationIds.length > 0
          "
          class="detail-section"
        >
          <h4>Required Certifications</h4>
          <div class="certifications-list">
            <span
              v-for="certId in activity.spec.requiredCertificationIds"
              :key="certId"
              class="certification-badge"
            >
              {{ getCertificationName(certId) }}
            </span>
          </div>
        </div>

        <div class="detail-section">
          <h4>Programs</h4>
          <div class="programs-list">
            <span
              v-for="programId in activity.spec.programIds"
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
      <BaseButton
        outline
        color="grey-8"
        @click="$emit('edit', activity)"
        label="Edit"
      />
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import {
  useProgramsStore,
  useLocationsStore,
  useColorsStore,
  useCertificationsStore,
} from "@/stores";
import BaseModal from "@/components/BaseModal.vue";
import DurationDisplay from "@/components/DurationDisplay.vue";
import type { Activity } from "@/generated/api";

export default defineComponent({
  name: "ActivityDetailModal",
  components: {
    BaseModal,
    DurationDisplay,
  },
  props: {
    activity: {
      type: Object as PropType<Activity | null>,
      default: null,
    },
  },
  emits: ["close", "edit"],
  setup() {
    const programsStore = useProgramsStore();
    const locationsStore = useLocationsStore();
    const colorsStore = useColorsStore();
    const certificationsStore = useCertificationsStore();
    return { programsStore, locationsStore, colorsStore, certificationsStore };
  },
  methods: {
    getLocationName(locationId: string) {
      const location = this.locationsStore.getLocationById(locationId);
      return location?.meta.name || "Unknown Location";
    },
    getProgramName(programId: string) {
      const program = this.programsStore.getProgramById(programId);
      return program?.meta.name || "Unknown Program";
    },
    getCertificationName(certificationId: string) {
      const certification =
        this.certificationsStore.getCertificationById(certificationId);
      return certification?.meta.name || "Unknown Certification";
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
