<template>
  <div class="filter-bar card">
    <div class="filter-bar-content">
      <!-- Search Box (if enabled) -->
      <div v-if="showSearch" class="search-box">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          :value="internalSearchQuery"
          @input="handleSearchInput"
          type="text"
          :placeholder="searchPlaceholder"
          class="form-input form-input-sm"
        />
      </div>

      <!-- Add Filter Button -->
      <div class="add-filter-wrapper" v-if="availableFilters.length > 0">
        <button
          @click="toggleAddFilterDropdown"
          class="btn btn-sm btn-secondary add-filter-btn"
          ref="addFilterButton"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Filter
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="showAddFilterDropdown"
          class="add-filter-dropdown"
          ref="addFilterDropdown"
        >
          <button
            v-for="filter in availableFilters"
            :key="filter.model"
            @click="addFilter(filter.model)"
            class="add-filter-option"
          >
            {{ filter.placeholder }}
          </button>
        </div>
      </div>

      <!-- Active Filters -->
      <div class="filters-group">
        <div
          v-for="filter in activeFilters"
          :key="filter.model"
          class="active-filter-wrapper"
        >
          <Autocomplete
            :model-value="filter.value"
            @update:model-value="
              (value) => handleFilterChange(filter.model, value)
            "
            :options="getFilterOptions(filter)"
            :placeholder="filter.placeholder"
            :show-clear="false"
            class="filter-autocomplete"
          />
          <button
            @click="removeFilter(filter.model)"
            class="remove-filter-btn"
            :title="`Remove ${filter.placeholder} filter`"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="filter-actions">
        <button
          v-if="hasActiveFilters"
          @click="$emit('clear')"
          class="btn btn-sm btn-secondary"
        >
          Clear All
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
import { defineComponent, PropType } from "vue";
import Autocomplete from "./Autocomplete.vue";

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
  name: "FilterBar",
  components: {
    Autocomplete,
  },
  props: {
    showSearch: {
      type: Boolean,
      default: true,
    },
    searchQuery: {
      type: String,
      default: "",
    },
    searchPlaceholder: {
      type: String,
      default: "Search...",
    },
    searchDebounce: {
      type: Number,
      default: 300,
    },
    filters: {
      type: Array as PropType<Filter[]>,
      required: true,
    },
    filteredCount: {
      type: Number,
      default: 0,
    },
    totalCount: {
      type: Number,
      default: 0,
    },
    showCount: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      internalSearchQuery: this.searchQuery,
      searchDebounceTimer: null as ReturnType<typeof setTimeout> | null,
      addedFilterModels: [] as string[],
      showAddFilterDropdown: false,
    };
  },
  computed: {
    hasActiveFilters(): boolean {
      return !!this.searchQuery || this.filters.some((f: Filter) => f.value);
    },
    activeFilters(): Filter[] {
      return this.filters.filter((f) =>
        this.addedFilterModels.includes(f.model),
      );
    },
    availableFilters(): Filter[] {
      return this.filters.filter(
        (f) => !this.addedFilterModels.includes(f.model),
      );
    },
  },
  mounted() {
    // Add click outside listener
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    // Clear debounce timer
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    // Remove click outside listener
    document.removeEventListener("click", this.handleClickOutside);
  },
  watch: {
    searchQuery(newValue: string) {
      // Sync internal search query when prop changes externally
      if (this.internalSearchQuery !== newValue) {
        this.internalSearchQuery = newValue;
      }
    },
    filters: {
      handler(newFilters: Filter[]) {
        // Remove filters that no longer exist in the filters array
        this.addedFilterModels = this.addedFilterModels.filter((model) =>
          newFilters.some((f) => f.model === model),
        );

        // Auto-remove filters that have been cleared
        this.addedFilterModels = this.addedFilterModels.filter((model) => {
          const filter = newFilters.find((f) => f.model === model);
          return filter && filter.value;
        });
      },
      deep: true,
    },
  },
  methods: {
    getFilterOptions(filter: Filter): Array<FilterOption> {
      // Add empty option for placeholder behavior
      return [{ label: filter.placeholder, value: "" }, ...filter.options];
    },
    handleSearchInput(event: Event): void {
      const target = event.target as HTMLInputElement;
      const value = target.value;

      // Update internal query immediately for responsive UI
      this.internalSearchQuery = value;

      // Clear existing timer
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
      }

      // Set new timer to emit the update after delay
      this.searchDebounceTimer = setTimeout(() => {
        this.$emit("update:searchQuery", value);
      }, this.searchDebounce);
    },
    handleFilterChange(
      model: string,
      value: string | number | boolean | null,
    ): void {
      this.$emit(`update:${model}` as any, value);
    },
    addFilter(model: string): void {
      if (!this.addedFilterModels.includes(model)) {
        this.addedFilterModels.push(model);
      }
      this.showAddFilterDropdown = false;
    },
    removeFilter(model: string): void {
      const index = this.addedFilterModels.indexOf(model);
      if (index > -1) {
        this.addedFilterModels.splice(index, 1);
      }
      // Clear the filter value
      this.handleFilterChange(model, "");
    },
    toggleAddFilterDropdown(): void {
      this.showAddFilterDropdown = !this.showAddFilterDropdown;
    },
    handleClickOutside(event: MouseEvent): void {
      const target = event.target as HTMLElement;
      const addFilterButton = this.$refs.addFilterButton as HTMLElement;
      const addFilterDropdown = this.$refs.addFilterDropdown as HTMLElement;

      if (
        this.showAddFilterDropdown &&
        addFilterButton &&
        !addFilterButton.contains(target) &&
        addFilterDropdown &&
        !addFilterDropdown.contains(target)
      ) {
        this.showAddFilterDropdown = false;
      }
    },
  },
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

.active-filter-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.filter-autocomplete {
  min-width: 150px;
  max-width: 180px;
}

.filter-autocomplete :deep(.autocomplete-input) {
  padding: 0.375rem 3rem 0.375rem 0.625rem;
  font-size: 0.875rem;
}

.remove-filter-btn {
  position: absolute;
  right: 1.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  transition: all 0.15s ease;
  z-index: 10;
}

.remove-filter-btn:hover {
  color: var(--danger);
  background: var(--danger-light);
}

.add-filter-wrapper {
  position: relative;
}

.add-filter-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  white-space: nowrap;
}

.add-filter-dropdown {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  background: var(--surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  min-width: 180px;
  max-height: 300px;
  overflow-y: auto;
}

.add-filter-option {
  display: block;
  width: 100%;
  padding: 0.625rem 0.875rem;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.15s ease;
}

.add-filter-option:hover {
  background: var(--background);
}

.add-filter-option:not(:last-child) {
  border-bottom: 1px solid var(--border-light);
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

  .add-filter-dropdown {
    left: auto;
    right: 0;
  }
}
</style>
