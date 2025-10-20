<template>
  <div class="color-picker">
    <div class="color-options">
      <label
        v-for="color in colorOptions"
        :key="color.value"
        class="color-option"
        :class="{ selected: modelValue === color.id }"
      >
        <input
          type="radio"
          :value="color.id"
          :checked="modelValue === color.id"
          @change="$emit('update:modelValue', color.id)"
          class="color-radio"
        />
        <div class="color-option-content">
          <div
            class="color-circle"
            :style="{ background: color.value }"
            :title="color.name"
          ></div>
          <span class="color-name">{{ color.name }}</span>
        </div>
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useColorsStore } from "@/stores";
import type { Color } from "@/types";

export default defineComponent({
  name: "ColorPicker",
  props: {
    modelValue: {
      type: String,
      default: "#6366F1",
    },
  },
  emits: ["update:modelValue"],
  setup() {
    const colorsStore = useColorsStore();
    return { colorsStore };
  },
  computed: {
    colorOptions(): { name: string; value: string; id: string }[] {
      // If custom colors are configured, use them
      if (this.colorsStore.colors.length > 0) {
        return this.colorsStore.colors.map((color: Color) => ({
          name: color.name,
          value: color.hexValue,
          id: color.id,
        }));
      }

      // Otherwise, use default colors
      return [
        { name: "Blue", value: "#6366F1", id: "color-001" },
        { name: "Green", value: "#10B981", id: "color-002" },
        { name: "Orange", value: "#F59E0B", id: "color-003" },
        { name: "Purple", value: "#8B5CF6", id: "color-004" },
        { name: "Pink", value: "#EC4899", id: "color-005" },
        { name: "Red", value: "#EF4444", id: "color-006" },
        { name: "Teal", value: "#14B8A6", id: "color-007" },
        { name: "Indigo", value: "#4F46E5", id: "color-008" },
      ];
    },
  },
});
</script>

<style scoped>
.color-picker {
  display: block;
}

.color-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 0.75rem 0.5rem;
  padding: 4px;
  margin: -4px;
}

.color-option {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-option-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
}

.color-name {
  font-size: 0.6875rem;
  color: var(--text-secondary);
  text-align: center;
  transition: color 0.2s ease;
  user-select: none;
  line-height: 1.2;
  white-space: nowrap;
}

.color-option.selected .color-name {
  color: var(--text-primary);
  font-weight: 600;
}

.color-radio {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.color-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.color-circle:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.color-option.selected .color-circle {
  border-color: var(--text-primary);
  box-shadow:
    0 0 0 2px white,
    0 0 0 3px var(--text-primary);
  transform: scale(1.05);
}
</style>
