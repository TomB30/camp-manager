<template>
  <div class="filter-bar card">
    <div class="filter-bar-content">
      <!-- Search Box (if enabled) -->
      <div v-if="showSearch" class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input 
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="text"
          :placeholder="searchPlaceholder"
          class="form-input form-input-sm"
        />
      </div>

      <!-- Filter Dropdowns -->
      <div class="filters-group">
        <select
          v-for="(filter, index) in filters"
          :key="index"
          :value="filter.value"
          @change="$emit(`update:${filter.model}`, ($event.target as HTMLSelectElement).value)"
          class="form-select form-select-sm"
        >
          <option value="">{{ filter.placeholder }}</option>
          <option
            v-for="option in filter.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Actions -->
      <div class="filter-actions">
        <button 
        v-if="hasActiveFilters"
        @click="$emit('clear')"
        class="btn btn-sm btn-secondary"
        >
        Clear
      </button>
      <span v-if="showCount" class="text-xs text-secondary count-badge">
        {{ filteredCount }}/{{ totalCount }}
      </span>
      <!-- Custom slot for additional controls (e.g., view toggle) -->
      <div v-if="$slots.prepend" class="prepend-slot">
        <slot name="prepend"></slot>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface FilterOption {
  label: string;
  value: string;
}

export interface Filter {
  model: string;
  value: string;
  placeholder: string;
  options: FilterOption[];
}

interface Props {
  showSearch?: boolean;
  searchQuery?: string;
  searchPlaceholder?: string;
  filters: Filter[];
  filteredCount?: number;
  totalCount?: number;
  showCount?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showSearch: true,
  searchQuery: '',
  searchPlaceholder: 'Search...',
  showCount: true,
  filteredCount: 0,
  totalCount: 0,
});

defineEmits<{
  (e: 'update:searchQuery', value: string): void;
  (e: `update:${string}`, value: string): void;
  (e: 'clear'): void;
}>();

const hasActiveFilters = computed(() => {
  return props.searchQuery || props.filters.some(f => f.value);
});
</script>

<style scoped>
.filter-bar {
  padding: 0.625rem 0.75rem;
  margin-bottom: 1rem;
}

.filter-bar-content {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 180px;
  max-width: 280px;
}

.search-box svg {
  position: absolute;
  left: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
}

.search-box input {
  padding-left: 2.25rem;
  width: 100%;
}

.filters-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
}

.form-select {
  min-width: 120px;
  max-width: 160px;
}

.form-input-sm,
.form-select-sm {
  padding: 0.375rem 0.625rem;
  font-size: 0.875rem;
}

.filter-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-left: auto;
}

.count-badge {
  white-space: nowrap;
  font-weight: 500;
}

.prepend-slot {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

@media (max-width: 768px) {
  .filter-bar-content {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: 100%;
  }

  .filters-group {
    width: 100%;
  }

  .filter-actions {
    width: 100%;
    justify-content: space-between;
    margin-left: 0;
  }
}
</style>

