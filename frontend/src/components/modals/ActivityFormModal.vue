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
            <label class="form-label">Duration (minutes)</label>
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
              <BaseInput
                v-model="formData.spec.duration"
                type="number"
                :min="1"
                placeholder="Enter custom duration in minutes"
                required
              />
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
            <label class="form-label">Default Capacity</label>
            <BaseInput
              v-model="formData.spec.defaultCapacity"
              type="number"
              :min="1"
              placeholder="Maximum number of campers"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Minimum Staff for Activity</label>
            <div>
              <BaseInput
                v-model="formData.spec.minStaff"
                type="number"
                :min="0"
                placeholder="Minimum number of staff required"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Required Certifications</label>
            <q-select
              class="certifications-select"
              outlined
              dense
              v-model="formData.spec.requiredCertificationIds"
              :options="certifications"
              placeholder="Select certifications..."
              use-chips
              multiple
              emit-value
              map-options
            />
            <p class="form-help-text">
              Staff assigned to events using this activity will need these
              certifications
            </p>
          </div>
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
import type { Activity, ActivityCreationRequest } from "@/generated/api";
import { QForm } from "quasar";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "ActivityFormModal",
  components: {
    BaseModal,
    Autocomplete,
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
          requiredCertificationIds: [],
          minStaff: null as number | null,
          defaultCapacity: null as number | null,
        },
      } as ActivityCreationRequest,
      isCustomDuration: false,
      editingActivity: null as Activity | null,
    };
  },
  created() {
    if (this.activityId) {
      const activity = this.activitiesStore.getActivityById(this.activityId);
      if (!activity) return;
      this.editingActivity = activity;
      this.formData = {
        meta: {
          name: activity.meta.name,
          description: activity.meta.description || "",
        },
        spec: {
          programId: activity.spec.programId,
          duration: activity.spec.duration || 60,
          defaultLocationId: activity.spec.defaultLocationId || "",
          requiredCertificationIds:
            activity.spec.requiredCertificationIds || [],
          minStaff: activity.spec.minStaff || 0,
          defaultCapacity: activity.spec.defaultCapacity || 0,
        },
      };
    }

    this.isCustomDuration = !this.durationPresets.find(
      (preset) => preset.minutes === this.formData.spec.duration,
    );
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
  },
  methods: {
    handleDurationPresetClick(preset: {
      label: string;
      minutes: number | null;
    }) {
      if (preset.minutes === null) {
        // Custom option selected
        this.isCustomDuration = true;
      } else {
        // Preset option selected
        this.isCustomDuration = false;
        this.formData.spec.duration = preset.minutes as number;
      }
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
    async handleSave() {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      const activityData: ActivityCreationRequest = {
        meta: {
          name: this.formData.meta.name,
          description: this.formData.meta.description || undefined,
        },
        spec: {
          programId: this.programId,
          duration: this.formData.spec.duration,
          defaultLocationId: this.formData.spec.defaultLocationId || undefined,
          requiredCertificationIds:
            this.formData.spec.requiredCertificationIds || undefined,
          minStaff: this.formData.spec.minStaff || undefined,
          defaultCapacity: this.formData.spec.defaultCapacity || undefined,
        },
      };

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
</style>
