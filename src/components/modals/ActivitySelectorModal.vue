<template>
  <BaseModal title="Add Activity to Program" @close="$emit('close')">
    <template #body>
      <div class="selector-content">
        <div class="selector-options">
          <button
            class="selector-option"
            :class="{ active: mode === 'create' }"
            @click="mode = 'create'"
          >
            <div class="option-icon">
              <Icon name="Plus" :size="24" />
            </div>
            <div class="option-content">
              <h3>Create New Activity</h3>
              <p>Create a brand new activity for this program</p>
            </div>
          </button>

          <button
            class="selector-option"
            :class="{ active: mode === 'existing' }"
            @click="mode = 'existing'"
          >
            <div class="option-icon">
              <Icon name="ListPlus" :size="24" />
            </div>
            <div class="option-content">
              <h3>Add Existing Activity</h3>
              <p>Add an activity from another program</p>
            </div>
          </button>
        </div>

        <!-- Create New Activity Form -->
        <div v-if="mode === 'create'" class="activity-form">
          <ActivityForm
            v-model="formData"
            v-model:selected-certification-ids="selectedCertificationIds"
            v-model:is-custom-duration="isCustomDuration"
            :room-options="roomOptions"
            :certifications="certificationsStore.certifications"
            :compact-mode="true"
            @submit="handleCreateNew"
          />
        </div>

        <!-- Existing Activities List -->
        <div v-if="mode === 'existing'" class="existing-activities">
          <div class="search-box">
            <BaseInput
              v-model="searchQuery"
              placeholder="Search activities..."
            />
          </div>

          <div v-if="availableActivities.length === 0" class="empty-message">
            <p v-if="searchQuery">No activities match your search.</p>
            <p v-else>
              No activities available to add. All existing activities are
              already in this program.
            </p>
          </div>

          <div v-else class="activities-list">
            <div
              v-for="activity in availableActivities"
              :key="activity.id"
              class="activity-item"
              :class="{ selected: selectedActivityId === activity.id }"
              @click="selectActivity(activity.id)"
            >
              <div class="activity-info">
                <div class="activity-header">
                  <h4>{{ activity.name }}</h4>
                  <span class="activity-duration"
                    ><DurationDisplay :minutes="activity.duration || 0"
                  /></span>
                </div>
                <p v-if="activity.description" class="activity-description">
                  {{ activity.description }}
                </p>
                <div class="activity-programs">
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
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex q-gutter-x-sm">
        <BaseButton flat @click="$emit('close')" label="Cancel" />
        <BaseButton
          v-if="mode === 'create'"
          color="primary"
          @click="handleCreateNew"
          label="Create Activity"
        />
        <BaseButton
          v-if="mode === 'existing'"
          color="primary"
          :disabled="!selectedActivityId"
          @click="handleAddExisting"
          label="Add Activity"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  useActivitiesStore,
  useProgramsStore,
  useLocationsStore,
  useColorsStore,
  useCertificationsStore,
} from "@/stores";
import type { Activity } from "@/types";
import BaseModal from "@/components/BaseModal.vue";
import ActivityForm, {
  type ActivityFormData,
} from "@/components/ActivityForm.vue";
import { type AutocompleteOption } from "@/components/Autocomplete.vue";
import DurationDisplay from "@/components/DurationDisplay.vue";
import Icon from "@/components/Icon.vue";

export default defineComponent({
  name: "ActivitySelectorModal",
  components: {
    BaseModal,
    ActivityForm,
    DurationDisplay,
    Icon,
  },
  props: {
    programId: {
      type: String,
      required: true,
    },
  },
  emits: ["close", "create-new", "add-existing"],
  setup() {
    const activitiesStore = useActivitiesStore();
    const programsStore = useProgramsStore();
    const locationsStore = useLocationsStore();
    const colorsStore = useColorsStore();
    const certificationsStore = useCertificationsStore();
    return {
      activitiesStore,
      programsStore,
      locationsStore,
      colorsStore,
      certificationsStore,
    };
  },
  data() {
    return {
      mode: "create" as "create" | "existing",
      selectedActivityId: null as string | null,
      searchQuery: "",
      formData: {
        name: "",
        description: "",
        duration: 60,
        defaultLocationId: "",
        requiredCertificationIds: [],
        minStaff: 0,
        defaultCapacity: 0,
      } as ActivityFormData,
      selectedCertificationIds: [] as string[],
      isCustomDuration: false,
    };
  },
  computed: {
    programActivities() {
      return this.activitiesStore.getActivitiesInProgram(this.programId);
    },
    programActivityIds() {
      return new Set(this.programActivities.map((a) => a.id));
    },
    filteredActivities(): Activity[] {
      // Get all activities not in this program
      const activities = this.activitiesStore.activities.filter(
        (a) => !a.programIds.includes(this.programId),
      );

      // Apply search filter
      if (!this.searchQuery.trim()) {
        return activities;
      }

      const query = this.searchQuery.toLowerCase().trim();
      return activities.filter(
        (activity) =>
          activity.name.toLowerCase().includes(query) ||
          (activity.description &&
            activity.description.toLowerCase().includes(query)),
      );
    },
    availableActivities(): Activity[] {
      return this.filteredActivities;
    },
    roomOptions(): AutocompleteOption[] {
      return this.locationsStore.locations.map((room) => ({
        value: room.id,
        label: `${room.name} (${room.type})`,
      }));
    },
  },
  methods: {
    resetForm() {
      this.mode = "create";
      this.selectedActivityId = null;
      this.searchQuery = "";
      this.formData = {
        name: "",
        description: "",
        duration: 60,
        defaultLocationId: "",
        requiredCertificationIds: [],
        minStaff: 0,
        defaultCapacity: 0,
      };
      this.selectedCertificationIds = [];
      this.isCustomDuration = false;
    },
    selectActivity(activityId: string) {
      this.selectedActivityId = activityId;
    },
    getCertificationNamesFromIds(ids: string[]): string[] {
      return ids
        .map((id) => {
          const cert = this.certificationsStore.getCertificationById(id);
          return cert ? cert.name : "";
        })
        .filter((name) => name !== "");
    },
    handleCreateNew() {
      const now = new Date().toISOString();

      // Convert selected certification IDs to names
      const certifications = this.getCertificationNamesFromIds(
        this.selectedCertificationIds,
      );

      const activityData: Activity = {
        id: crypto.randomUUID(),
        name: this.formData.name,
        description: this.formData.description || undefined,
        programIds: [this.programId],
        duration: this.formData.duration,
        defaultLocationId: this.formData.defaultLocationId || undefined,
        requiredCertificationIds:
          certifications.length > 0 ? this.selectedCertificationIds : undefined,
        minStaff: this.formData.minStaff || undefined,
        defaultCapacity: this.formData.defaultCapacity || undefined,
        createdAt: now,
        updatedAt: now,
      };

      this.$emit("create-new", activityData);
      this.$emit("close");
    },
    handleAddExisting() {
      if (this.selectedActivityId) {
        this.$emit("add-existing", this.selectedActivityId);
        this.$emit("close");
      }
    },
    getProgramName(programId: string): string {
      const program = this.programsStore.getProgramById(programId);
      return program?.name || "Unknown Program";
    },
  },
});
</script>

<style scoped>
.selector-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.selector-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.selector-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: var(--surface);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.selector-option:hover {
  border-color: var(--accent-color);
  background: var(--surface-secondary);
}

.selector-option.active {
  border-color: var(--accent-color);
}

.option-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--surface-secondary);
  color: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}

.selector-option.active .option-icon {
  background: var(--accent-color);
  color: white;
}

.option-content h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.option-content p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.existing-activities {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-box {
  margin-bottom: 0.5rem;
}

.activities-list {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  padding: 1rem;
  background: var(--surface);
  border: 2px solid var(--border-light);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.activity-item:hover {
  border-color: var(--accent-color);
  background: var(--surface-secondary);
}

.activity-item.selected {
  border-color: var(--accent-color);
}

.activity-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.activity-header h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.activity-duration {
  font-size: 0.875rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.activity-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.activity-programs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.program-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--surface-secondary);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

.empty-message {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-message p {
  margin: 0;
}

.activity-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden; /* Prevent horizontal overflow */
}

@media (max-width: 640px) {
  .selector-options {
    grid-template-columns: 1fr;
  }
}
</style>
