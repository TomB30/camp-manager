<template>
  <BaseModal
    :title="isEditing ? 'Edit Activity' : 'Create New Activity'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent ref="formRef">
        <section>
          <div class="form-group">
            <label class="form-label">Activity Name</label>
            <BaseInput
              v-model="formData.meta.name"
              type="text"
              placeholder="e.g., Wakeboarding, Pottery"
              :rules="[(val: string) => !!val || 'Enter activity name']"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <BaseInput
              v-model="formData.meta.description"
              type="textarea"
              :rows="3"
              placeholder="Describe this activity..."
            />
          </div>

          <div class="form-group">
            <label class="form-label">Time Settings</label>
            <div class="time-settings-container">
              <q-option-group
                inline
                v-model="timeMode"
                :options="[
                  { label: 'Duration-based', value: 'duration' },
                  { label: 'Fixed time', value: 'fixed' },
                ]"
                color="primary"
                class="time-mode-selector"
              />

              <div v-if="timeMode === 'duration'" class="time-input-section">
                <label class="time-input-label">Duration (minutes)</label>
                <div class="duration-presets">
                  <BaseButton
                    v-for="preset in durationPresets"
                    :key="preset.minutes || 'custom'"
                    type="button"
                    class="duration-preset-btn"
                    :class="{
                      active:
                        preset.minutes === null
                          ? isCustomDuration
                          : formData.spec.duration === preset.minutes,
                    }"
                    @click="handleDurationPresetClick(preset)"
                  >
                    {{ preset.label }}
                  </BaseButton>
                </div>
                <div v-if="isCustomDuration" class="custom-duration-input">
                  <div class="grid grid-cols-2">
                    <div>
                      <label class="form-sublabel">Hours</label>
                      <BaseInput
                        v-model="customDurationHours"
                        type="number"
                        :min="0"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label class="form-sublabel">Minutes</label>
                      <BaseInput
                        v-model="customDurationMinutes"
                        type="number"
                        :min="0"
                        :max="59"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="timeMode === 'fixed'" class="time-input-section">
                <label class="time-input-label">Fixed Time</label>
                <div class="grid grid-cols-2">
                  <div>
                    <label class="form-sublabel">Start Time</label>
                    <q-input
                      v-model="formData.spec.fixedTime.startTime"
                      outlined
                      dense
                      type="time"
                      placeholder="HH:MM"
                      :rules="[
                        (val: string) => !!val || 'Start time is required',
                      ]"
                    />
                  </div>
                  <div>
                    <label class="form-sublabel">End Time</label>
                    <q-input
                      v-model="formData.spec.fixedTime.endTime"
                      outlined
                      dense
                      type="time"
                      placeholder="HH:MM"
                      :rules="[
                        (val: string) => !!val || 'End time is required',
                        (val: string) =>
                          validateEndTime(val) ||
                          'End time must be after start time',
                      ]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Default Location</label>
            <Autocomplete
              v-model="formData.spec.defaultLocationId"
              :options="locations"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Required Staff Positions</label>
            <p class="form-help-text">
              Define staff positions needed for this activity. Events created
              from this activity will inherit these requirements.
            </p>

            <div class="required-staff-list">
              <div
                v-for="(position, index) in formData.spec.requiredStaff"
                :key="index"
                class="required-staff-item"
              >
                <div
                  class="staff-position-inputs row items-center justify-between q-gutter-x-md q-pt-md q-px-md"
                >
                  <BaseInput
                    class="col"
                    label="Position Name"
                    v-model="position.positionName"
                    placeholder="e.g., Lead Instructor, Lifeguard"
                    :rules="[
                      (val: string) => !!val || 'Position name is required',
                    ]"
                  />
                  <q-select
                    class="col"
                    outlined
                    dense
                    label="Required Certification"
                    v-model="position.requiredCertificationId"
                    :options="certifications"
                    placeholder="None"
                    clearable
                    :rules="[() => true]"
                    emit-value
                    map-options
                  />

                  <BaseButton
                    class="q-mb-md"
                    type="button"
                    color="negative"
                    outline
                    size="sm"
                    @click="removeStaffPosition(index)"
                    round
                  >
                    <Icon name="X" :size="16" />
                  </BaseButton>
                </div>
              </div>

              <BaseButton
                type="button"
                outline
                @click="addStaffPosition"
                label="+ Add Staff Position"
                class="add-position-btn"
              />
            </div>
          </div>

          <q-expansion-item
            label="Advanced settings"
            header-class="conflicts-expansion-header"
            class="conflicts-expansion"
          >
            <div class="conflicts-content">
              <p class="form-help-text">
                Define scheduling conflicts to prevent incompatible activities
                from being scheduled before, after, or during this activity.
              </p>

              <div class="form-group">
                <label class="form-label">Pre-Activity Conflicts</label>
                <p class="form-help-text">
                  Activities that cannot occur immediately before this activity
                </p>
                <q-select
                  outlined
                  dense
                  multiple
                  use-chips
                  v-model="formData.spec.activityConflicts.preActivityConflicts"
                  :options="availableActivities"
                  placeholder="Select activities..."
                  emit-value
                  map-options
                />
              </div>

              <div class="form-group">
                <label class="form-label">Post-Activity Conflicts</label>
                <p class="form-help-text">
                  Activities that cannot occur immediately after this activity
                </p>
                <q-select
                  outlined
                  dense
                  multiple
                  use-chips
                  v-model="
                    formData.spec.activityConflicts.postActivityConflicts
                  "
                  :options="availableActivities"
                  placeholder="Select activities..."
                  emit-value
                  map-options
                />
              </div>

              <div class="form-group">
                <label class="form-label">Concurrent Activity Conflicts</label>
                <p class="form-help-text">
                  Activities that cannot occur at the same time as this activity
                </p>
                <q-select
                  outlined
                  dense
                  multiple
                  use-chips
                  v-model="
                    formData.spec.activityConflicts.concurrentActivityConflicts
                  "
                  :options="availableActivities"
                  placeholder="Select activities..."
                  emit-value
                  map-options
                />
              </div>
            </div>
          </q-expansion-item>
        </section>
      </q-form>
    </template>

    <template #footer>
      <div class="flex q-gutter-x-sm">
        <BaseButton flat @click="$emit('close')" label="Cancel" />
        <BaseButton
          @click="handleSave"
          color="primary"
          type="submit"
          :label="isEditing ? 'Save Changes' : 'Create Activity'"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  useLocationsStore,
  useCertificationsStore,
  useActivitiesStore,
  useDurationPresetsStore,
} from "@/stores";
import BaseModal from "@/components/BaseModal.vue";
import Autocomplete, {
  type AutocompleteOption,
} from "@/components/Autocomplete.vue";
import Icon from "@/components/Icon.vue";
import type { Activity } from "@/generated/api";
import { QForm } from "quasar";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "ActivityFormModal",
  components: {
    BaseModal,
    Autocomplete,
    Icon,
  },
  props: {
    activityId: {
      type: String,
      required: false,
    },
    programId: {
      type: String,
      required: true,
    },
  },
  emits: ["close", "save"],
  setup() {
    const locationsStore = useLocationsStore();
    const certificationsStore = useCertificationsStore();
    const activitiesStore = useActivitiesStore();
    const durationPresetsStore = useDurationPresetsStore();
    const toast = useToast();
    return {
      locationsStore,
      certificationsStore,
      activitiesStore,
      durationPresetsStore,
      toast,
    };
  },
  data() {
    return {
      formData: {
        meta: {
          name: "",
          description: "",
        },
        spec: {
          programId: "",
          duration: 60,
          defaultLocationId: "",
          requiredStaff: [] as Array<{
            positionName: string;
            requiredCertificationId?: string;
          }>,
          fixedTime: {
            startTime: "",
            endTime: "",
          },
          activityConflicts: {
            preActivityConflicts: [] as string[],
            postActivityConflicts: [] as string[],
            concurrentActivityConflicts: [] as string[],
          },
        },
      } as any,
      isCustomDuration: false,
      timeMode: "duration" as "duration" | "fixed",
      editingActivity: null as Activity | null,
      customDurationHours: 0,
      customDurationMinutes: 0,
    };
  },
  created() {
    if (this.activityId) {
      const activity = this.activitiesStore.getActivityById(this.activityId);
      if (!activity) return;
      this.editingActivity = activity;

      // Determine if activity has fixed time or duration
      if (activity.spec.fixedTime) {
        this.timeMode = "fixed";
        this.formData.spec.fixedTime = {
          startTime: activity.spec.fixedTime.startTime || "",
          endTime: activity.spec.fixedTime.endTime || "",
        };
      } else {
        this.timeMode = "duration";
        this.formData.spec.duration = activity.spec.duration || 60;
      }

      this.formData = {
        meta: {
          name: activity.meta.name,
          description: activity.meta.description || "",
        },
        spec: {
          programId: activity.spec.programId,
          duration: activity.spec.duration || 60,
          defaultLocationId: activity.spec.defaultLocationId || "",
          requiredStaff: activity.spec.requiredStaff || [],
          fixedTime: {
            startTime: activity.spec.fixedTime?.startTime || "",
            endTime: activity.spec.fixedTime?.endTime || "",
          },
          activityConflicts: {
            preActivityConflicts:
              activity.spec.activityConflicts?.preActivityConflicts || [],
            postActivityConflicts:
              activity.spec.activityConflicts?.postActivityConflicts || [],
            concurrentActivityConflicts:
              activity.spec.activityConflicts?.concurrentActivityConflicts ||
              [],
          },
        },
      };
    }

    this.isCustomDuration = !this.durationPresets.find(
      (preset) => preset.minutes === this.formData.spec.duration,
    );

    // Set custom duration hours and minutes if custom
    if (this.isCustomDuration && this.formData.spec.duration) {
      this.customDurationHours = Math.floor(this.formData.spec.duration / 60);
      this.customDurationMinutes = this.formData.spec.duration % 60;
    }
  },
  watch: {
    customDurationHours() {
      this.updateDurationFromCustom();
    },
    customDurationMinutes() {
      this.updateDurationFromCustom();
    },
  },
  computed: {
    isEditing() {
      return !!this.activityId;
    },
    locations(): AutocompleteOption[] {
      return this.locationsStore.locations.map((location) => ({
        value: location.meta.id,
        label: location.meta.name,
      }));
    },
    certifications(): AutocompleteOption[] {
      return this.certificationsStore.certifications.map((certification) => ({
        value: certification.meta.id,
        label: certification.meta.name,
      }));
    },
    durationPresets(): { label: string; minutes: number | null }[] {
      // Build presets from store
      const presets: { label: string; minutes: number | null }[] =
        this.durationPresetsStore.sortedDurationPresets.map((preset) => ({
          label: this.formatDuration(preset.spec.durationMinutes),
          minutes: preset.spec.durationMinutes as number,
        }));

      // Add "Custom" option at the end
      presets.push({ label: "Custom", minutes: null });

      return presets;
    },
    availableActivities(): AutocompleteOption[] {
      return this.activitiesStore.activities
        .filter(
          (activity) =>
            activity.spec.programId === this.programId &&
            activity.meta.id !== this.activityId,
        )
        .map((activity) => ({
          value: activity.meta.id,
          label: activity.meta.name,
        }));
    },
  },
  methods: {
    handleDurationPresetClick(preset: {
      label: string;
      minutes: number | null;
    }) {
      if (preset.minutes === null) {
        // Custom option selected
        this.isCustomDuration = true;
        // Initialize custom duration from current duration
        if (this.formData.spec.duration) {
          this.customDurationHours = Math.floor(
            this.formData.spec.duration / 60,
          );
          this.customDurationMinutes = this.formData.spec.duration % 60;
        }
      } else {
        // Preset option selected
        this.isCustomDuration = false;
        this.formData.spec.duration = preset.minutes as number;
      }
    },
    updateDurationFromCustom() {
      const hours = Number(this.customDurationHours) || 0;
      const minutes = Number(this.customDurationMinutes) || 0;
      this.formData.spec.duration = hours * 60 + minutes;
    },
    formatDuration(minutes: number): string {
      if (minutes < 60) {
        return `${minutes} min`;
      }
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} ${hours === 1 ? "hour" : "hours"}`;
      }
      return `${hours}h ${remainingMinutes}m`;
    },
    validateEndTime(endTime: string): boolean {
      if (!this.formData.spec.fixedTime.startTime || !endTime) {
        return true;
      }
      return endTime > this.formData.spec.fixedTime.startTime;
    },
    addStaffPosition() {
      this.formData.spec.requiredStaff.push({
        positionName: "",
        requiredCertificationId: undefined,
      });
    },
    removeStaffPosition(index: number) {
      this.formData.spec.requiredStaff.splice(index, 1);
    },
    async handleSave() {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      const activityData: any = {
        meta: {
          name: this.formData.meta.name,
          description: this.formData.meta.description || undefined,
        },
        spec: {
          programId: this.programId,
          defaultLocationId: this.formData.spec.defaultLocationId || undefined,
          requiredStaff:
            this.formData.spec.requiredStaff &&
            this.formData.spec.requiredStaff.length > 0
              ? this.formData.spec.requiredStaff.map((position: any) => ({
                  positionName: position.positionName,
                  requiredCertificationId:
                    position.requiredCertificationId || undefined,
                }))
              : undefined,
          activityConflicts:
            this.formData.spec.activityConflicts &&
            (this.formData.spec.activityConflicts.preActivityConflicts
              ?.length > 0 ||
              this.formData.spec.activityConflicts.postActivityConflicts
                ?.length > 0 ||
              this.formData.spec.activityConflicts.concurrentActivityConflicts
                ?.length > 0)
              ? {
                  preActivityConflicts:
                    this.formData.spec.activityConflicts.preActivityConflicts
                      ?.length > 0
                      ? this.formData.spec.activityConflicts
                          .preActivityConflicts
                      : undefined,
                  postActivityConflicts:
                    this.formData.spec.activityConflicts.postActivityConflicts
                      ?.length > 0
                      ? this.formData.spec.activityConflicts
                          .postActivityConflicts
                      : undefined,
                  concurrentActivityConflicts:
                    this.formData.spec.activityConflicts
                      .concurrentActivityConflicts?.length > 0
                      ? this.formData.spec.activityConflicts
                          .concurrentActivityConflicts
                      : undefined,
                }
              : undefined,
        },
      };

      // Add either duration or fixedTime based on timeMode
      if (this.timeMode === "duration") {
        activityData.spec.duration = this.formData.spec.duration;
      } else {
        activityData.spec.fixedTime = {
          startTime: this.formData.spec.fixedTime.startTime,
          endTime: this.formData.spec.fixedTime.endTime,
        };
      }

      if (this.activityId) {
        try {
          await this.activitiesStore.updateActivity(
            this.activityId,
            activityData,
          );
          this.toast.success("Activity updated successfully");
        } catch (error: any) {
          this.toast.error(error.message || "Failed to update activity");
        }
      } else {
        try {
          await this.activitiesStore.addActivity(activityData);
          this.toast.success("Activity created successfully");
        } catch (error: any) {
          this.toast.error(error.message || "Failed to create activity");
        }
      }
      this.$emit("close");
    },
  },
});
</script>

<style scoped>
.form-help-text {
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.form-sublabel {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
}

.time-settings-container {
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  background: var(--background);
}

.time-mode-selector {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.time-input-section {
  animation: slideDown 0.2s ease-out;
}

.time-input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.duration-presets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.duration-preset-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: white;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.duration-preset-btn:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
  color: var(--primary-color);
}

.duration-preset-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.duration-preset-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.custom-duration-input {
  margin-top: 0.75rem;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid {
  display: grid;
  gap: 1rem;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.text-xs {
  font-size: 0.75rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

@media (max-width: 640px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}

.required-staff-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.required-staff-item {
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background: var(--background);
}

.add-position-btn {
  margin-top: 0.5rem;
}

.conflicts-expansion {
  margin-top: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
}

.conflicts-expansion :deep(.conflicts-expansion-header) {
  background: var(--surface-secondary);
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.conflicts-content {
  padding: 1rem;
  background: var(--background);
}
</style>
