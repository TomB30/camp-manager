<template>
  <div class="areas-tab view">
    <LoadingState v-if="!isInitialized" message="Loading areas..." />
    <template v-else>
      <TabHeader
        title="Areas"
        description="Manage physical areas of your camp where activities and events take place."
        action-text="Area"
        @action="showModal = true"
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
        :columns="areaColumns"
        :rows="areasData"
        row-key="meta.id"
        :grid="filters.viewMode === 'grid'"
        :loading="loading"
        :pagination="filters.pagination"
        @update:pagination="
          updateFilter('pagination', $event);
          fetchAreas();
        "
        @row-click="selectArea($event.meta.id)"
      >
        <template #item="{ item }">
          <AreaCard :area="item" @click="selectArea(item.meta.id)" />
        </template>

        <template #empty>
          <EmptyState
            type="empty"
            title="No Areas Yet"
            message="Add your first area to start organizing your camp spaces."
            action-text="Area"
            @action="showModal = true"
            icon-name="Map"
          />
        </template>
      </ServerTable>

      <AreaDetailModal
        v-if="!!selectedAreaId"
        :area="selectedArea"
        @close="selectedAreaId = null"
        @edit="editArea"
        @delete="deleteAreaConfirm"
      />

      <AreaFormModal
        v-if="showModal"
        :area-id="editingAreaId || undefined"
        @close="closeModal"
      />

      <ConfirmModal
        v-if="showConfirmModal"
        title="Delete Area"
        message="Are you sure you want to delete this area?"
        confirm-text="Delete"
        :danger-mode="true"
        @confirm="handleConfirmAction"
        @cancel="handleCancelConfirm"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useAreasStore } from "@/stores";
import { usePageFilters } from "@/composables/usePageFilters";
import type { Area } from "@/generated/api";
import type { QTableColumn } from "quasar";
import { isBackendEnabled } from "@/config/dataSource";
import AreaCard from "@/components/cards/AreaCard.vue";
import FilterBar from "@/components/FilterBar.vue";
import AreaDetailModal from "@/components/modals/AreaDetailModal.vue";
import AreaFormModal from "@/components/modals/AreaFormModal.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import EmptyState from "@/components/EmptyState.vue";
import ServerTable from "@/components/ServerTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import LoadingState from "@/components/LoadingState.vue";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "AreasTab",
  components: {
    AreaCard,
    FilterBar,
    ConfirmModal,
    ServerTable,
    ViewToggle,
    AreaDetailModal,
    AreaFormModal,
    EmptyState,
    TabHeader,
    LoadingState,
  },
  setup() {
    const { filters, updateFilter, updateFilters, isInitialized } =
      usePageFilters("areas", {
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

    const areasStore = useAreasStore();
    const toast = useToast();

    return {
      filters,
      updateFilter,
      updateFilters,
      isInitialized,
      areasStore,
      toast,
    };
  },
  data() {
    return {
      loading: false,
      areasData: [] as Area[],
      showModal: false,
      showConfirmModal: false,
      editingAreaId: null as string | null,
      selectedAreaId: null as string | null,
      confirmAction: null as (() => void) | null,
      areaColumns: [
        {
          name: "name",
          label: "Area Name",
          field: (row: Area) => row.meta.name,
          align: "left" as const,
          sortable: true,
        },
        {
          name: "description",
          label: "Description",
          field: (row: Area) => row.meta.description,
          align: "left" as const,
          format: (value: string | undefined) => value || "No description",
        },
        {
          name: "capacity",
          label: "Capacity",
          field: (row: Area) => row.spec.capacity,
          align: "left" as const,
          format: (value: number | undefined) =>
            value ? value.toString() : "Unlimited",
        },
        {
          name: "equipment",
          label: "Equipment",
          field: (row: Area) => row.spec.equipment,
          align: "left" as const,
          format: (value: string[] | undefined) =>
            value ? value.join(", ") : "No equipment",
        },
      ] as QTableColumn[],
    };
  },
  computed: {
    selectedArea(): Area | null {
      if (!this.selectedAreaId) return null;
      return (
        this.areasData.find((a) => a.meta.id === this.selectedAreaId) || null
      );
    },
  },
  methods: {
    async fetchAreas(): Promise<void> {
      if (!this.isInitialized) return;

      if (!isBackendEnabled()) {
        const response = await this.areasStore.loadAreas();
        this.areasData = Array.isArray(response) ? response : response.items;
      } else {
        try {
          const response = await this.areasStore.loadAreasPaginated({
            offset: this.filters.pagination.offset,
            limit: this.filters.pagination.limit,
            search: this.filters.searchQuery || undefined,
            sortBy: this.filters.pagination.sortBy,
            sortOrder: this.filters.pagination.sortOrder,
          });

          this.areasData = response.items;
          this.updateFilter("pagination", {
            ...this.filters.pagination,
            total: response.total,
          });
        } catch (error) {
          console.error("Failed to fetch areas:", error);
          this.areasData = [];
        }
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
    },

    selectArea(areaId: string) {
      this.selectedAreaId = areaId;
    },

    editArea(area: Area) {
      this.editingAreaId = area.meta.id;
      this.selectedAreaId = null;
      this.showModal = true;
    },

    deleteAreaConfirm() {
      if (!this.selectedAreaId) return;

      this.confirmAction = async () => {
        if (this.selectedAreaId) {
          await this.areasStore.deleteArea(this.selectedAreaId);
          await this.fetchAreas();
          this.toast.success("Area deleted successfully");
          this.selectedAreaId = null;
        }
      };
      this.showConfirmModal = true;
    },

    async handleConfirmAction() {
      if (this.confirmAction) {
        await this.confirmAction();
      }
      this.showConfirmModal = false;
      this.confirmAction = null;
    },

    handleCancelConfirm() {
      this.showConfirmModal = false;
      this.confirmAction = null;
    },

    closeModal() {
      this.showModal = false;
      this.editingAreaId = null;
      this.fetchAreas();
    },
  },
  watch: {
    isInitialized: {
      immediate: true,
      handler(initialized) {
        if (initialized) {
          this.fetchAreas();
        }
      },
    },
    "filters.searchQuery"() {
      this.updateFilter("pagination", {
        ...this.filters.pagination,
        offset: 0,
      });
      this.fetchAreas();
    },
  },
});
</script>
