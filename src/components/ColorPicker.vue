<template>
  <div class="color-picker">
    <div class="color-options">
      <label 
        v-for="color in colorOptions"
        :key="color.value"
        class="color-option"
        :class="{ 'selected': modelValue === color.value }"
      >
        <input 
          type="radio" 
          :value="color.value"
          :checked="modelValue === color.value"
          @change="$emit('update:modelValue', color.value)"
          class="color-radio"
        />
        <div 
          class="color-circle"
          :style="{ background: color.value }"
          :title="color.name"
        ></div>
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useCampStore } from '@/stores/campStore';

export default defineComponent({
  name: 'ColorPicker',
  props: {
    modelValue: {
      type: String,
      default: '#6366F1'
    }
  },
  emits: ['update:modelValue'],
  setup() {
    const store = useCampStore();
    return { store };
  },
  computed: {
    colorOptions() {
      // If custom colors are configured, use them
      if (this.store.colors.length > 0) {
        return this.store.colors.map(color => ({
          name: color.name,
          value: color.hexValue
        }));
      }
      
      // Otherwise, use default colors
      return [
        { name: 'Blue', value: '#6366F1' },
        { name: 'Green', value: '#10B981' },
        { name: 'Orange', value: '#F59E0B' },
        { name: 'Purple', value: '#8B5CF6' },
        { name: 'Pink', value: '#EC4899' },
        { name: 'Red', value: '#EF4444' },
        { name: 'Teal', value: '#14B8A6' },
        { name: 'Indigo', value: '#4F46E5' },
      ];
    }
  }
});
</script>

<style scoped>
.color-picker {
  display: block;
}

.color-options {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 4px; /* Add padding to prevent box-shadow clipping */
  margin: -4px; /* Negative margin to maintain visual alignment */
}

.color-option {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-radio {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.color-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-circle:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.color-option.selected .color-circle {
  border-color: var(--text-primary);
  box-shadow: 0 0 0 2px white, 0 0 0 4px var(--text-primary);
  transform: scale(1.05);
}
</style>

