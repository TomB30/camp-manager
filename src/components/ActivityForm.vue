<template>
  <section>
    <div class="form-group">
      <label class="form-label">Activity Name</label>
      <BaseInput
        :model-value="modelValue.meta.name"
        @update:model-value="updateMetaField('name', $event)"
        type="text"
        placeholder="e.g., Wakeboarding, Pottery"
        :rules="[(val: string) => !!val || 'Enter activity name']"
      />
    </div>

    <div class="form-group">
      <label class="form-label">Description</label>
      <BaseInput
        :model-value="modelValue.meta.description"
        @update:model-value="updateMetaField('description', $event)"
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
                : modelValue.spec.duration === preset.minutes,
          }"
          @click="handleDurationPresetClick(preset)"
        >
          {{ preset.label }}
        </BaseButton>
      </div>
      <div v-if="isCustomDuration" class="custom-duration-input">
        <BaseInput
          :model-value="String(modelValue.spec.duration)"
          @update:model-value="updateSpecField('duration', Number($event))"
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
        :model-value="modelValue.spec.defaultLocationId"
        @update:model-value="updateSpecField('defaultLocationId', $event)"
        :options="locations"
        placeholder="Select a default location"
      />
    </div>

    <div class="form-group">
      <label class="form-label">Default Capacity</label>
      <BaseInput
        :model-value="String(modelValue.spec.defaultCapacity)"
        @update:model-value="updateSpecField('defaultCapacity', Number($event))"
        type="number"
        :min="1"
        placeholder="Maximum number of campers"
      />
    </div>

    <div class="form-group">
      <label class="form-label">Minimum Staff for Activity</label>
      <div>
        <BaseInput
          :model-value="String(modelValue.spec.minStaff)"
          @update:model-value="updateSpecField('minStaff', $event)"
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
        :model-value="modelValue.spec.requiredCertificationIds || []"
        @update:model-value="
          updateSpecField('requiredCertificationIds', $event)
        "
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
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import Autocomplete, {
  type AutocompleteOption,
} from "@/components/Autocomplete.vue";
import SelectionList from "@/components/SelectionList.vue";
import type { ActivityCreationRequest } from "@/generated/api";
import {
  useCertificationsStore,
  useDurationPresetsStore,
  useLocationsStore,
} from "@/stores";

export default defineComponent({
  name: "ActivityForm",
  components: {
    Autocomplete,
    SelectionList,
  },
  props: {
    modelValue: {
      type: Object as PropType<ActivityCreationRequest>,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  setup() {
    const durationPresetsStore = useDurationPresetsStore();
    return { durationPresetsStore };
  },
  data() {
    return {
      isCustomDuration: false,
    };
  },
  created() {
    this.isCustomDuration = !this.durationPresets.find(
      (preset) => preset.minutes === this.modelValue.spec.duration
    );
  },
  computed: {
    locations(): AutocompleteOption[] {
      return useLocationsStore().locations.map((location) => ({
        value: location.meta.id,
        label: location.meta.name,
      }));
    },
    certifications(): AutocompleteOption[] {
      return useCertificationsStore().certifications.map((certification) => ({
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
    updateSpecField(field: keyof ActivityCreationRequest["spec"], value: any) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        spec: {
          ...this.modelValue.spec,
          [field]: value,
        },
      });
    },
    updateMetaField(field: keyof ActivityCreationRequest["meta"], value: any) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        meta: {
          ...this.modelValue.meta,
          [field]: value,
        },
      });
    },
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
        this.updateSpecField("duration", preset.minutes as number);
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
