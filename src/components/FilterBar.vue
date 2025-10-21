<template>
  <div class="filter-bar card">
    <div class="filter-bar-content">
      <BaseInput
        v-model="internalSearchQuery"
        :placeholder="searchPlaceholder"
        @update:model-value="
          (value: string | number | null) => handleSearchInput(value)
        "
      >
      <template #prepend>
        <Icon name="Search" :size="16" />
      </template>
    </BaseInput>

      <!-- Add Filter Button -->
      <!-- <BaseButton
        v-if="availableFilters.length > 0"
        color="grey-6"
        flat
        class="add-filter-btn"
        icon="add"
        label="Add Filter"
      >
        <q-menu>
          <q-list style="min-width: 180px">
            <q-item
              v-for="filter in availableFilters"
              :key="filter.model"
              clickable
              v-close-popup
              @click="addFilter(filter.model)"
            >
              <q-item-section>{{ filter.placeholder }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </BaseButton> -->

      <!-- Active Filters -->
      <!-- <div class="filters-group">
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
            
          </button>
        </div>
      </div> -->

      <!-- Actions -->
      <div class="filter-actions">
        <!-- <button
          v-if="hasActiveFilters"
          @click="$emit('clear')"
          class="btn btn-sm btn-secondary"
        >
          Clear All
        </button> -->
        <span v-if="showCount" class="text-caption">
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
import Icon from "./Icon.vue";
import BaseInput from "./common/BaseInput.vue";
import BaseButton from "./common/BaseButton.vue";

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
    Icon,
    BaseInput,
    BaseButton,
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
    };
  },
  computed: {
    hasActiveFilters(): boolean {
      return !!this.searchQuery || this.filters.some((f: Filter) => f.value);
    },
    activeFilters(): Filter[] {
      return this.filters.filter((f) =>
        this.addedFilterModels.includes(f.model)
      );
    },
    availableFilters(): Filter[] {
      return this.filters.filter(
        (f) => !this.addedFilterModels.includes(f.model)
      );
    },
  },
  beforeUnmount() {
    // Clear debounce timer
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
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
          newFilters.some((f) => f.model === model)
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
    handleSearchInput(value: string | number | null): void {
      // Update internal query immediately for responsive UI
      this.internalSearchQuery = value as string;

      // Clear existing timer
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
      }

      // Set new timer to emit the update after delay
      this.searchDebounceTimer = setTimeout(() => {
        this.$emit("update:searchQuery", value as string);
      }, this.searchDebounce);
    },
    handleFilterChange(
      model: string,
      value: string | number | boolean | null
    ): void {
      this.$emit(`update:${model}` as any, value);
    },
    addFilter(model: string): void {
      if (!this.addedFilterModels.includes(model)) {
        this.addedFilterModels.push(model);
      }
    },
    removeFilter(model: string): void {
      const index = this.addedFilterModels.indexOf(model);
      if (index > -1) {
        this.addedFilterModels.splice(index, 1);
      }
      // Clear the filter value
      this.handleFilterChange(model, "");
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
  max-width: 200px;
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
