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
          @input="handleSearchInput"
          type="text"
          :placeholder="searchPlaceholder"
          class="form-input form-input-sm"
        />
      </div>

      <!-- Filter Dropdowns -->
      <div class="filters-group">
        <Autocomplete
          v-for="(filter, index) in filters"
          :key="index"
          :model-value="filter.value"
          @update:model-value="(value) => handleFilterChange(filter.model, value)"
          :options="getFilterOptions(filter)"
          :placeholder="filter.placeholder"
          class="filter-autocomplete"
        />
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

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Autocomplete from './Autocomplete.vue';

export interface FilterOption {
  label: string;
  value: string | number | boolean | null;
}

export interface Filter {
  model: string;
  value: string | number | boolean | null;
  placeholder: string;
  options: FilterOption[];
}

export default defineComponent({
  name: 'FilterBar',
  components: {
    Autocomplete
  },
  props: {
    showSearch: {
      type: Boolean,
      default: true
    },
    searchQuery: {
      type: String,
      default: ''
    },
    searchPlaceholder: {
      type: String,
      default: 'Search...'
    },
    filters: {
      type: Array as PropType<Filter[]>,
      required: true
    },
    filteredCount: {
      type: Number,
      default: 0
    },
    totalCount: {
      type: Number,
      default: 0
    },
    showCount: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:searchQuery', 'clear'],
  computed: {
    hasActiveFilters(): boolean {
      return !!this.searchQuery || this.filters.some((f: Filter) => f.value);
    }
  },
  methods: {
    getFilterOptions(filter: Filter): Array<FilterOption> {
      // Add empty option for placeholder behavior
      return [
        { label: filter.placeholder, value: '' },
        ...filter.options
      ];
    },
    handleSearchInput(event: Event): void {
      const target = event.target as HTMLInputElement;
      this.$emit('update:searchQuery', target.value);
    },
    handleFilterChange(model: string, value: string | number | boolean | null): void {
      this.$emit(`update:${model}` as any, value);
    }
  }
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

.filter-autocomplete {
  min-width: 150px;
  max-width: 180px;
}

.filter-autocomplete :deep(.autocomplete-input) {
  padding: 0.375rem 2.5rem 0.375rem 0.625rem;
  font-size: 0.875rem;
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

