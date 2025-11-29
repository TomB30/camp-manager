<template>
  <div class="colors-tab view">
    <LoadingState v-if="!isInitialized" message="Loading colors..." />
    <template v-else>
      <TabHeader
        title="Color Palette"
        description="Manage the colors available for programs and events. Set a default color for events not created from activity templates."
        action-text="Color"
        @action="showFormModal = true"
      />

      <FilterBar
        v-model:searchQuery="filters.searchQuery"
        search-placeholder="Search by name..."
        @clear="clearFilters"
      >
        <template #prepend>
          <ViewToggle v-model="filters.viewMode" />
        </template>
      </FilterBar>

      <ServerTable
        v-if="isInitialized"
        :columns="colorColumns"
        :rows="colorsData"
        row-key="meta.id"
        :grid="filters.viewMode === 'grid'"
        :loading="loading"
        :pagination="filters.pagination"
        @update:pagination="handlePaginationUpdate"
        @row-click="selectColor($event)"
      >
        <template #item="{ item }">
          <ColorCard
            :color="item"
            @edit="editColor"
            @delete="deleteColorConfirm"
          />
        </template>

        <template #cell-hexValue="{ item }">
          <div class="color-cell">
            <div
              class="color-swatch"
              :style="{ backgroundColor: item.spec.hexValue }"
            ></div>
            <span>{{ item.spec.hexValue }}</span>
          </div>
        </template>

        <template #cell-default="{ item }">
          <q-badge v-if="item.spec.default" color="primary" label="Default" />
          <span v-else class="text-grey-6">—</span>
        </template>

        <template #empty>
          <EmptyState
            type="empty"
            title="No Colors Yet"
            message="Add your first color to start customizing your camp's color palette."
            action-text="Color"
            @action="showFormModal = true"
            icon-name="Palette"
          />
        </template>
      </ServerTable>

      <ColorFormModal
        v-if="showFormModal"
        :color-id="editingColorId || undefined"
        @close="closeModal"
      />

      <ConfirmModal
        v-if="showConfirmModal"
        title="Delete Color"
        message="Are you sure you want to delete this color?"
        confirm-text="Delete"
        :danger-mode="true"
        @confirm="handleDeleteColor"
        @cancel="handleCancelConfirm"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// Stores
import { useColorsStore } from "@/stores";
// Types
import type { Color } from "@/generated/api";
import type { QTableColumn } from "quasar";
// Components
import TabHeader from "@/components/settings/TabHeader.vue";
import ColorCard from "@/components/cards/ColorCard.vue";
import ColorFormModal from "@/components/modals/ColorFormModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import FilterBar from "@/components/FilterBar.vue";
import EmptyState from "@/components/EmptyState.vue";
import LoadingState from "@/components/LoadingState.vue";
import ServerTable from "@/components/ServerTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
// Composables
import { useToast } from "@/composables/useToast";
import { usePageFilters } from "@/composables/usePageFilters";
// Config
import { isBackendEnabled } from "@/config/dataSource";
import { tableUtils } from "@/utils/tableUtils";

export default defineComponent({
  name: "ColorsTab",
  components: {
    TabHeader,
    ColorCard,
    ColorFormModal,
    ConfirmModal,
    FilterBar,
    EmptyState,
    LoadingState,
    ServerTable,
    ViewToggle,
  },
  setup() {
    const { filters, updateFilter, updateFilters, isInitialized } =
      usePageFilters("colors", {
        searchQuery: "",
        viewMode: "grid" as "grid" | "table",
        pagination: {
          offset: 0,
          limit: 20,
          total: 0,
          sortBy: undefined,
          sortOrder: "asc" as "asc" | "desc",
        },
      });

    const colorsStore = useColorsStore();
    const toast = useToast();

    return {
      filters,
      updateFilter,
      updateFilters,
      isInitialized,
      colorsStore,
      toast,
    };
  },
  data() {
    return {
      loading: false,
      colorsData: [] as Color[],
      showFormModal: false,
      showConfirmModal: false,
      editingColorId: null as string | null,
      colorToDelete: null as Color | null,
      colorColumns: [
        tableUtils.newTableColumn({
          name: "name",
          label: "Color Name",
          field: (row: Color) => row.meta.name,
          sortable: true,
        }),
        tableUtils.newTableColumn({
          name: "description",
          label: "Description",
          field: (row: Color) => row.meta.description,
          format: (value: string | undefined) => value || "-",
        }),
        tableUtils.newTableColumn({
          name: "hexValue",
          label: "Hex Value",
          field: (row: Color) => row.spec.hexValue,
          sortable: true,
        }),
        tableUtils.newTableColumn({
          name: "default",
          label: "Default",
          field: (row: Color) => row.spec.default,
        }),
      ] as QTableColumn[],
    };
  },
  methods: {
    async fetchColors(): Promise<void> {
      if (!this.isInitialized) return;

      if (!isBackendEnabled()) {
        // Client-side: Load all data and apply filters/pagination locally
        try {
          this.loading = true;
          await this.colorsStore.loadColors();
          this.applyFiltersAndPagination();
        } catch (error) {
          console.error("Failed to fetch colors:", error);
          this.colorsData = [];
        } finally {
          this.loading = false;
        }
      } else {
        // Backend: Use server-side pagination and filtering
        try {
          this.loading = true;
          const response = await this.colorsStore.loadColorsPaginated({
            offset: this.filters.pagination.offset,
            limit: this.filters.pagination.limit,
            search: this.filters.searchQuery || undefined,
            sortBy: this.filters.pagination.sortBy,
            sortOrder: this.filters.pagination.sortOrder,
          });

          this.colorsData = response.items;
          this.updateFilter("pagination", {
            ...this.filters.pagination,
            total: response.total,
          });
        } catch (error) {
          console.error("Failed to fetch colors:", error);
          this.colorsData = [];
        } finally {
          this.loading = false;
        }
      }
    },

    applyFiltersAndPagination(): void {
      let filtered = [...this.colorsStore.colors];

      // Search filter
      if (this.filters.searchQuery) {
        const query = this.filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (color) =>
            color.meta.name.toLowerCase().includes(query) ||
            color.spec.hexValue.toLowerCase().includes(query),
        );
      }

      // Sorting
      if (this.filters.pagination.sortBy) {
        const sortBy = this.filters.pagination.sortBy;
        const sortOrder = this.filters.pagination.sortOrder;
        filtered.sort((a: any, b: any) => {
          let aVal, bVal;
          if (sortBy === "name") {
            aVal = a.meta.name;
            bVal = b.meta.name;
          } else if (sortBy === "hexValue") {
            aVal = a.spec.hexValue;
            bVal = b.spec.hexValue;
          } else {
            aVal = a.meta.name;
            bVal = b.meta.name;
          }
          const comparison = aVal.localeCompare(bVal);
          return sortOrder === "desc" ? -comparison : comparison;
        });
      } else {
        // Default sort by name
        filtered.sort((a, b) => a.meta.name.localeCompare(b.meta.name));
      }

      // Update total count
      const total = filtered.length;
      this.updateFilter("pagination", {
        ...this.filters.pagination,
        total,
      });

      // Pagination
      const start = this.filters.pagination.offset;
      const end = start + this.filters.pagination.limit;
      this.colorsData = filtered.slice(start, end);
    },

    handlePaginationUpdate(newPagination: any) {
      this.updateFilter("pagination", newPagination);
      if (isBackendEnabled()) {
        this.fetchColors();
      } else {
        this.applyFiltersAndPagination();
      }
    },

    clearFilters() {
      this.updateFilters({
        searchQuery: "",
        pagination: {
          ...this.filters.pagination,
          offset: 0,
        },
      });
      if (isBackendEnabled()) {
        this.fetchColors();
      } else {
        this.applyFiltersAndPagination();
      }
    },

    selectColor(color: Color) {
      this.editingColorId = color.meta.id;
      this.showFormModal = true;
    },

    editColor(color: Color) {
      this.editingColorId = color.meta.id;
      this.showFormModal = true;
    },

    deleteColorConfirm(color: Color) {
      this.colorToDelete = color;
      this.showConfirmModal = true;
    },

    async handleDeleteColor() {
      if (!this.colorToDelete) return;

      try {
        await this.colorsStore.deleteColor(this.colorToDelete.meta.id);
        this.toast.success("Color deleted successfully");
        await this.fetchColors();
        this.showConfirmModal = false;
        this.colorToDelete = null;
      } catch (error: any) {
        this.toast.error(error.message || "Failed to delete color");
      }
    },

    handleCancelConfirm() {
      this.showConfirmModal = false;
      this.colorToDelete = null;
    },

    closeModal() {
      this.showFormModal = false;
      this.editingColorId = null;
      this.fetchColors();
    },
  },

  watch: {
    isInitialized: {
      immediate: true,
      handler(initialized) {
        if (initialized) {
          this.fetchColors();
        }
      },
    },
    "filters.searchQuery"() {
      this.updateFilter("pagination", {
        ...this.filters.pagination,
        offset: 0,
      });
      if (isBackendEnabled()) {
        this.fetchColors();
      } else {
        this.applyFiltersAndPagination();
      }
    },
  },
});
</script>

<style scoped>
.colors-tab {
  animation: slideIn 0.3s ease;
}

.color-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  border: 2px solid var(--border-light);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
