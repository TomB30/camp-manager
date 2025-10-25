<template>
  <form @submit.prevent="$emit('submit')">
    <div class="form-group">
      <label class="form-label">Activity Name</label>
      <BaseInput
        :model-value="modelValue.name"
        @update:model-value="updateField('name', $event)"
        type="text"
        placeholder="e.g., Wakeboarding, Pottery"
        required
      />
    </div>

    <div class="form-group">
      <label class="form-label">Description</label>
      <BaseInput
        :model-value="modelValue.description"
        @update:model-value="updateField('description', $event)"
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
                : modelValue.duration === preset.minutes,
          }"
          @click="handleDurationPresetClick(preset)"
        >
          {{ preset.label }}
        </BaseButton>
      </div>
      <div v-if="isCustomDuration" class="custom-duration-input">
        <BaseInput
          :model-value="String(modelValue.duration)"
          @update:model-value="updateField('duration', Number($event))"
          type="number"
          :min="1"
          placeholder="Enter custom duration in minutes"
          required
        />
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Default Location (Optional)</label>
      <Autocomplete
        :model-value="modelValue.defaultLocationId"
        @update:model-value="updateField('defaultLocationId', $event)"
        :options="roomOptions"
        placeholder="Select a default location"
      />
    </div>

    <div class="form-group">
      <label class="form-label">Default Capacity (Optional)</label>
      <BaseInput
        :model-value="String(modelValue.defaultCapacity)"
        @update:model-value="updateField('defaultCapacity', Number($event))"
        type="number"
        :min="1"
        placeholder="Maximum number of campers"
      />
    </div>

    <div class="form-group">
      <label class="form-label">Minimum Staff Required (Optional)</label>
      <div>
          <BaseInput
            :model-value="String(modelValue.minStaff)"
            @update:model-value="updateField('minStaff', $event)"
            type="number"
            :min="0"
            placeholder="Minimum number of staff required"
          />
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Required Certifications (Optional)</label>
      <SelectionList
        :model-value="selectedCertificationIds"
        @update:model-value="$emit('update:selectedCertificationIds', $event)"
        :items="certifications"
        item-type="certification"
        placeholder="Select a certification..."
        empty-text="No certifications required"
        add-button-text="Add"
        mode="multiple"
        :get-label-fn="(cert) => cert.name"
        :get-initials-fn="(cert) => cert.name.substring(0, 2).toUpperCase()"
        :get-options-fn="(cert) => ({ label: cert.name, value: cert.id })"
      />
      <p class="form-help-text">
        Staff assigned to events using this activity will need these
        certifications
      </p>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import Autocomplete, {
  type AutocompleteOption,
} from "@/components/Autocomplete.vue";
import SelectionList from "@/components/SelectionList.vue";
import type { Certification } from "@/types";

export interface ActivityFormData {
  name: string;
  description: string;
  duration: number;
  defaultLocationId: string;
  requiredCertificationIds: string[];
  minStaff: number;
  defaultCapacity: number;
}

export default defineComponent({
  name: "ActivityForm",
  components: {
    Autocomplete,
    SelectionList,
  },
  props: {
    modelValue: {
      type: Object as PropType<ActivityFormData>,
      required: true,
    },
    selectedCertificationIds: {
      type: Array as PropType<string[]>,
      required: true,
    },
    roomOptions: {
      type: Array as PropType<AutocompleteOption[]>,
      required: true,
    },
    certifications: {
      type: Array as PropType<Certification[]>,
      required: true,
    },
    isCustomDuration: {
      type: Boolean,
      required: true,
    },
    compactMode: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "update:modelValue",
    "update:selectedCertificationIds",
    "update:isCustomDuration",
    "submit",
  ],
  data() {
    return {
      durationPresets: [
        { label: "30 min", minutes: 30 },
        { label: "1 hour", minutes: 60 },
        { label: "1.5 hours", minutes: 90 },
        { label: "2 hours", minutes: 120 },
        { label: "3 hours", minutes: 180 },
        { label: "Half Day", minutes: 240 },
        { label: "Full Day", minutes: 480 },
        { label: "Custom", minutes: null },
      ],
    };
  },
  methods: {
    updateField(field: keyof ActivityFormData, value: any) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        [field]: value,
      });
    },
    handleDurationPresetClick(preset: {
      label: string;
      minutes: number | null;
    }) {
      if (preset.minutes === null) {
        // Custom option selected
        this.$emit("update:isCustomDuration", true);
      } else {
        // Preset option selected
        this.$emit("update:isCustomDuration", false);
        this.updateField("duration", preset.minutes);
      }
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
