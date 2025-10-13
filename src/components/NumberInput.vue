<template>
  <div class="number-input" :class="{ small: small }">
    <button 
      type="button" 
      class="control-btn minus" 
      @click="decrement"
      :disabled="disabled || modelValue <= min"
    >
      −
    </button>
    <input 
      :value="modelValue"
      @input="handleInput"
      type="number" 
      :min="min" 
      :max="max"
      :disabled="disabled"
      class="number-input-field"
    />
    <button 
      type="button" 
      class="control-btn plus" 
      @click="increment"
      :disabled="disabled || modelValue >= max"
    >
      +
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'NumberInput',
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    min: {
      type: Number,
      default: 1
    },
    max: {
      type: Number,
      default: 99
    },
    disabled: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  methods: {
    increment() {
      if (this.modelValue < this.max) {
        this.$emit('update:modelValue', this.modelValue + 1);
      }
    },
    decrement() {
      if (this.modelValue > this.min) {
        this.$emit('update:modelValue', this.modelValue - 1);
      }
    },
    handleInput(event: Event) {
      const target = event.target as HTMLInputElement;
      const value = parseInt(target.value, 10);
      if (!isNaN(value)) {
        const clampedValue = Math.max(this.min, Math.min(this.max, value));
        this.$emit('update:modelValue', clampedValue);
      }
    }
  }
});
</script>

<style scoped>
.number-input {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  overflow: hidden;
}

.number-input.small {
  display: inline-flex;
}

.control-btn {
  padding: 0.5rem 0.75rem;
  background: var(--surface);
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: 600;
  transition: all 0.15s ease;
  color: var(--text-primary);
  min-width: 40px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn.minus {
  border-right: 1px solid var(--border-color);
}

.control-btn.plus {
  border-left: 1px solid var(--border-color);
}

.control-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.number-input-field {
  width: 60px;
  height: 42px;
  text-align: center;
  border: none;
  padding: 0 0.25rem;
  font-size: 1rem;
  font-weight: 600;
  appearance: textfield;
  -moz-appearance: textfield;
}

.number-input-field::-webkit-outer-spin-button,
.number-input-field::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.number-input-field:disabled {
  background: transparent;
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

