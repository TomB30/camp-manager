<template>
  <div class="autocomplete" ref="autocompleteRef">
    <div class="autocomplete-input-wrapper">
      <input
        ref="inputRef"
        type="text"
        v-model="searchQuery"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @keydown.down.prevent="navigateDown"
        @keydown.up.prevent="navigateUp"
        @keydown.enter.prevent="selectHighlighted"
        @keydown.escape="closeDropdown"
        :placeholder="displayPlaceholder"
        :required="required"
        :disabled="disabled"
        class="form-input autocomplete-input"
        :class="{ 'has-value': modelValue }"
        autocomplete="off"
      />
      <div class="autocomplete-icons">
        <button
          v-if="showClear && modelValue && !disabled"
          type="button"
          class="autocomplete-clear"
          @mousedown.prevent="clearSelection"
          tabindex="-1"
        >
          <Icon name="X" :size="14" />
        </button>
        <Icon name="ChevronDown" 
          :size="16" 
          class="autocomplete-arrow" 
          :class="{ 'is-open': isOpen }"
        />
      </div>
    </div>
    
    <Teleport to="body">
      <Transition name="dropdown-fade">
        <div
          v-if="isOpen && filteredOptions.length > 0"
          class="autocomplete-dropdown"
          :style="dropdownStyle"
          @mousedown.prevent
        >
        <div class="autocomplete-options">
          <div
            v-for="(option, index) in filteredOptions"
            :key="getOptionValue(option)"
            class="autocomplete-option"
            :class="{ 
              'highlighted': index === highlightedIndex,
              'selected': isSelected(option),
              'disabled': isOptionDisabled(option)
            }"
            @click="selectOption(option)"
            @mouseenter="highlightedIndex = index"
          >
            <slot name="option" :option="option" :index="index">
              {{ getOptionLabel(option) }}
            </slot>
          </div>
        </div>
        
        <div v-if="filteredOptions.length === 0 && searchQuery" class="autocomplete-empty">
          No matches found
        </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick, onMounted, onUnmounted, type PropType } from 'vue';
import Icon from './Icon.vue';

export interface AutocompleteOption {
  label: string;
  value: any;
  disabled?: boolean;
  [key: string]: any;
}

export default defineComponent({
  name: 'Autocomplete',
  components: {
    Icon
  },
  props: {
    modelValue: {
      type: [String, Number, Boolean] as PropType<string | number | boolean | null>,
      default: null
    },
    options: {
      type: Array as PropType<AutocompleteOption[] | any[]>,
      required: true
    },
    placeholder: {
      type: String,
      default: 'Search...'
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // If true, options are plain strings/numbers, not objects
    primitive: {
      type: Boolean,
      default: false
    },
    // Custom function to get the label from an option
    optionLabel: {
      type: [String, Function] as PropType<string | ((option: any) => string)>,
      default: 'label'
    },
    // Custom function to get the value from an option
    optionValue: {
      type: [String, Function] as PropType<string | ((option: any) => any)>,
      default: 'value'
    },
    // Custom function to check if option is disabled
    optionDisabled: {
      type: [String, Function] as PropType<string | ((option: any) => boolean)>,
      default: 'disabled'
    },
    // Filter mode: 'contains' or 'startsWith'
    filterMode: {
      type: String as PropType<'contains' | 'startsWith'>,
      default: 'contains'
    },
    // Maximum height for dropdown
    maxHeight: {
      type: Number,
      default: 300
    },
    // Show clear button
    showClear: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const autocompleteRef = ref<HTMLElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);
    const isOpen = ref(false);
    const searchQuery = ref('');
    const highlightedIndex = ref(0);
    const dropdownStyle = ref({});
    const isFocused = ref(false);

    // Get option label
    const getOptionLabel = (option: any): string => {
      if (props.primitive) return String(option);
      if (typeof props.optionLabel === 'function') {
        return props.optionLabel(option);
      }
      return option[props.optionLabel as string] || '';
    };

    // Get option value
    const getOptionValue = (option: any): any => {
      if (props.primitive) return option;
      if (typeof props.optionValue === 'function') {
        return props.optionValue(option);
      }
      return option[props.optionValue as string];
    };

    // Check if option is disabled
    const isOptionDisabled = (option: any): boolean => {
      if (props.primitive) return false;
      if (typeof props.optionDisabled === 'function') {
        return props.optionDisabled(option);
      }
      return option[props.optionDisabled as string] || false;
    };

    // Get selected option
    const selectedOption = computed(() => {
      if (!props.modelValue && props.modelValue !== 0 && props.modelValue !== false) return null;
      return props.options.find(opt => getOptionValue(opt) === props.modelValue);
    });

    // Display placeholder or selected value
    const displayPlaceholder = computed(() => {
      if (isFocused.value) return props.placeholder;
      if (selectedOption.value) return getOptionLabel(selectedOption.value);
      return props.placeholder;
    });

    // Filtered options based on search query
    const filteredOptions = computed(() => {
      if (!searchQuery.value) return props.options;

      const query = searchQuery.value.toLowerCase();
      return props.options.filter(option => {
        const label = getOptionLabel(option).toLowerCase();
        if (props.filterMode === 'startsWith') {
          return label.startsWith(query);
        }
        return label.includes(query);
      });
    });

    // Check if option is selected
    const isSelected = (option: any): boolean => {
      return getOptionValue(option) === props.modelValue;
    };

    // Handle focus
    const handleFocus = () => {
      if (props.disabled) return;
      isFocused.value = true;
      isOpen.value = true;
      searchQuery.value = '';
      highlightedIndex.value = 0;
      updateDropdownPosition();
    };

    // Handle blur
    const handleBlur = () => {
      setTimeout(() => {
        isFocused.value = false;
        isOpen.value = false;
        // Restore display value
        if (selectedOption.value) {
          searchQuery.value = getOptionLabel(selectedOption.value);
        } else {
          searchQuery.value = '';
        }
      }, 200);
    };

    // Handle input
    const handleInput = () => {
      isOpen.value = true;
      highlightedIndex.value = 0;
      updateDropdownPosition();
    };

    // Navigate down
    const navigateDown = () => {
      if (!isOpen.value) {
        isOpen.value = true;
        updateDropdownPosition();
        return;
      }
      if (highlightedIndex.value < filteredOptions.value.length - 1) {
        highlightedIndex.value++;
        scrollToHighlighted();
      }
    };

    // Navigate up
    const navigateUp = () => {
      if (!isOpen.value) {
        isOpen.value = true;
        updateDropdownPosition();
        return;
      }
      if (highlightedIndex.value > 0) {
        highlightedIndex.value--;
        scrollToHighlighted();
      }
    };

    // Select highlighted option
    const selectHighlighted = () => {
      if (isOpen.value && filteredOptions.value.length > 0) {
        const option = filteredOptions.value[highlightedIndex.value];
        if (!isOptionDisabled(option)) {
          selectOption(option);
        }
      }
    };

    // Select option
    const selectOption = (option: any) => {
      if (isOptionDisabled(option)) return;
      
      const value = getOptionValue(option);
      emit('update:modelValue', value);
      emit('change', value);
      searchQuery.value = getOptionLabel(option);
      isOpen.value = false;
      inputRef.value?.blur();
    };

    // Clear selection
    const clearSelection = () => {
      emit('update:modelValue', '');
      emit('change', '');
      searchQuery.value = '';
      isOpen.value = false;
      inputRef.value?.focus();
    };

    // Close dropdown
    const closeDropdown = () => {
      isOpen.value = false;
      inputRef.value?.blur();
    };

    // Update dropdown position
    const updateDropdownPosition = () => {
      nextTick(() => {
        if (!autocompleteRef.value) return;
        
        const rect = autocompleteRef.value.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = Math.min(props.maxHeight, filteredOptions.value.length * 40);
        
        // Decide whether to show above or below
        const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
        
        dropdownStyle.value = {
          position: 'fixed',
          top: showAbove ? `${rect.top - dropdownHeight - 4}px` : `${rect.bottom + 4}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          maxHeight: `${props.maxHeight}px`,
          zIndex: 9999
        };
      });
    };

    // Scroll to highlighted option
    const scrollToHighlighted = () => {
      nextTick(() => {
        const dropdown = document.querySelector('.autocomplete-dropdown');
        const highlighted = dropdown?.querySelector('.autocomplete-option.highlighted') as HTMLElement;
        if (dropdown && highlighted) {
          const dropdownRect = dropdown.getBoundingClientRect();
          const highlightedRect = highlighted.getBoundingClientRect();
          
          if (highlightedRect.bottom > dropdownRect.bottom) {
            dropdown.scrollTop += highlightedRect.bottom - dropdownRect.bottom;
          } else if (highlightedRect.top < dropdownRect.top) {
            dropdown.scrollTop -= dropdownRect.top - highlightedRect.top;
          }
        }
      });
    };

    // Handle window resize and scroll
    const handleWindowEvent = () => {
      if (isOpen.value) {
        updateDropdownPosition();
      }
    };

    // Initialize display value
    watch(() => props.modelValue, (newValue) => {
      if (newValue && !isFocused.value) {
        const option = selectedOption.value;
        if (option) {
          searchQuery.value = getOptionLabel(option);
        }
      } else if (!newValue && !isFocused.value) {
        searchQuery.value = '';
      }
    }, { immediate: true });

    // Watch options changes
    watch(() => props.options, () => {
      if (isOpen.value) {
        highlightedIndex.value = 0;
      }
    });

    onMounted(() => {
      window.addEventListener('resize', handleWindowEvent);
      window.addEventListener('scroll', handleWindowEvent, true);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', handleWindowEvent);
      window.removeEventListener('scroll', handleWindowEvent, true);
    });

    return {
      autocompleteRef,
      inputRef,
      isOpen,
      searchQuery,
      highlightedIndex,
      dropdownStyle,
      displayPlaceholder,
      filteredOptions,
      selectedOption,
      getOptionLabel,
      getOptionValue,
      isOptionDisabled,
      isSelected,
      handleFocus,
      handleBlur,
      handleInput,
      navigateDown,
      navigateUp,
      selectHighlighted,
      selectOption,
      clearSelection,
      closeDropdown
    };
  }
});
</script>

<style scoped>
.autocomplete {
  position: relative;
  width: 100%;
}

.autocomplete-input-wrapper {
  position: relative;
  width: 100%;
}

.autocomplete-input {
  width: 100%;
  padding-right: 3rem;
}

.autocomplete-input.has-value {
  font-weight: 500;
}

.autocomplete-icons {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  pointer-events: none;
}

.autocomplete-clear {
  pointer-events: all;
  background: none;
  border: none;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
}

.autocomplete-clear:hover {
  background: var(--background-secondary);
  color: var(--error-color, #EF4444);
}

.autocomplete-arrow {
  color: var(--text-secondary);
  transition: transform 0.2s ease;
  pointer-events: none;
  flex-shrink: 0;
}

.autocomplete-arrow.is-open {
  transform: rotate(180deg);
}

/* Dropdown fade animation */
.dropdown-fade-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-fade-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.dropdown-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.autocomplete-dropdown {
  background: var(--surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  overflow-y: auto;
  z-index: 9999;
}

.autocomplete-options {
  padding: 0.25rem;
}

.autocomplete-option {
  padding: 0.625rem 0.75rem;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.1s ease;
  font-size: 0.9375rem;
}

.autocomplete-option:not(.disabled):hover,
.autocomplete-option.highlighted:not(.disabled) {
  background: var(--primary-color);
  color: white;
}

.autocomplete-option.selected:not(.disabled) {
  background: var(--primary-light);
  font-weight: 600;
}

.autocomplete-option.selected.highlighted:not(.disabled) {
  background: var(--primary-color);
  color: white;
}

.autocomplete-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  color: var(--text-secondary);
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.option-label {
  font-weight: 500;
}

.option-description {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.3;
}

.autocomplete-option.disabled .option-description {
  color: var(--error-color, #EF4444);
  font-weight: 500;
}

.autocomplete-empty {
  padding: 1rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* Scrollbar styling */
.autocomplete-dropdown::-webkit-scrollbar {
  width: 8px;
}

.autocomplete-dropdown::-webkit-scrollbar-track {
  background: var(--background);
  border-radius: var(--radius);
}

.autocomplete-dropdown::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--radius);
}

.autocomplete-dropdown::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
</style>

