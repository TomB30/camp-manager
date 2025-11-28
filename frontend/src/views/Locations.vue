<template>
  <div class="activity-locations-tab view">
    <LoadingState v-if="!isInitialized" message="Loading locations..." />
    <template v-else>
      <TabHeader
        title="Locations"
        description="Manage all locations where camp programs and events take place."
        action-text="Location"
        @action="showModal = true"
      />

      <FilterBar
        v-model:searchQuery="filters.searchQuery"
        v-model:filter-area="filters.filterArea"
        :filters="locationFilters"
        :filtered-count="filters.pagination.total"
        search-placeholder="Search by location name..."
        :total-count="filters.pagination.total"
        @clear="clearFilters"
      >
        <template #prepend>
          <ViewToggle v-model="filters.viewMode" />
        </template>
      </FilterBar>

      <ServerTable
        v-if="isInitialized"
        :columns="locationColumns"
        :rows="locationsData"
        row-key="meta.id"
        :grid="filters.viewMode === 'grid'"
        :loading="loading"
        :pagination="filters.pagination"
        @update:pagination="
          updateFilter('pagination', $event);
          fetchLocations();
        "
        @row-click="selectLocation"
      >
        <template #item="{ item }">
          <LocationCard :location="item" @click="selectLocation(item)" />
        </template>

        <template #empty>
          <EmptyState
            icon-name="MapPin"
            title="No locations configured"
            message="Add your first location to start organizing your camp spaces."
            action-text="Location"
            @action="showModal = true"
          />
        </template>
      </ServerTable>

      <LocationDetailModal
        v-if="!!selectedLocationId"
        :location="selectedLocation"
        @close="selectedLocationId = null"
        @edit="editLocation"
        @delete="deleteLocationConfirm"
      />

      <LocationFormModal
        v-if="showModal"
        :location-id="editingLocationId || undefined"
        @close="closeModal"
      />

      <ConfirmModal
        v-if="showConfirmModal"
        title="Delete Location"
        message="Are you sure you want to delete this location?"
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
import { useLocationsStore, useAreasStore } from "@/stores";
import { usePageFilters } from "@/composables/usePageFilters";
import type { Area, Location } from "@/generated/api";
import type { QTableColumn } from "quasar";
import { isBackendEnabled } from "@/config/dataSource";
import type { Filter } from "@/components/FilterBar.vue";
import LocationCard from "@/components/cards/LocationCard.vue";
import FilterBar from "@/components/FilterBar.vue";
import LocationDetailModal from "@/components/modals/LocationDetailModal.vue";
import LocationFormModal from "@/components/modals/LocationFormModal.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import EmptyState from "@/components/EmptyState.vue";
import ServerTable from "@/components/ServerTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import LoadingState from "@/components/LoadingState.vue";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "ActivityLocationsTab",
  components: {
    LocationCard,
    FilterBar,
    ConfirmModal,
    ServerTable,
    ViewToggle,
    LocationDetailModal,
    LocationFormModal,
    EmptyState,
    TabHeader,
    LoadingState,
  },
  setup() {
    const { filters, updateFilter, updateFilters, isInitialized } = usePageFilters("locations", {
      searchQuery: "",
      filterArea: "",
      viewMode: "grid" as "grid" | "table",
      pagination: {
        offset: 0,
        limit: 20,
        total: 0,
        sortBy: undefined,
        sortOrder: "asc" as "asc" | "desc",
      },
    });

    const locationsStore = useLocationsStore();
    const areasStore = useAreasStore();
    const toast = useToast();

    return {
      filters,
      updateFilter,
      updateFilters,
      isInitialized,
      locationsStore,
      areasStore,
      toast,
    };
  },
  data() {
    return {
      loading: false,
      locationsData: [] as Location[],
      showModal: false,
      showConfirmModal: false,
      editingLocationId: null as string | null,
      selectedLocationId: null as string | null,
      confirmAction: null as (() => void) | null,
      locationColumns: [
        {
          name: "name",
          label: "Location Name",
          field: (row: Location) => row.meta.name,
          align: "left" as const,
          sortable: true,
        },
        {
          name: "areaId",
          label: "Area",
          field: (row: Location) => row.spec.areaId,
          align: "left" as const,
          sortable: true,
          format: (value: string) => this.getAreaName(value),
        },
        {
          name: "capacity",
          label: "Capacity",
          field: (row: Location) => row.spec.capacity,
          align: "left" as const,
          sortable: true,
          format: (value: number | undefined) =>
            value ? value.toString() : "Unlimited",
        },
      ] as QTableColumn[],
    };
  },
  async created() {
    await this.areasStore.loadAreas();
  },
  computed: {
    locationFilters(): Filter[] {
      return [
        {
          model: "filterArea",
          value: this.filters.filterArea,
          placeholder: "Filter by Area",
          options: this.areasStore.areas.map((area: Area) => ({
            label: area.meta.name,
            value: area.meta.id,
          })),
        },
      ];
    },
    selectedLocation(): Location | null {
      if (!this.selectedLocationId) return null;
      return (
        this.locationsData.find((l) => l.meta.id === this.selectedLocationId) ||
        null
      );
    },
  },
  methods: {
    async fetchLocations(): Promise<void> {
      if (!this.isInitialized) return;

      if (!isBackendEnabled()) {
        const response = await this.locationsStore.loadLocations();
        this.locationsData = Array.isArray(response) ? response : response.items;
      } else {
        try {
          const filterBy = this.buildFilterByArray();
          const response = await this.locationsStore.loadLocationsPaginated({
            offset: this.filters.pagination.offset,
            limit: this.filters.pagination.limit,
            search: this.filters.searchQuery || undefined,
            filterBy: filterBy.length > 0 ? filterBy : undefined,
            sortBy: this.filters.pagination.sortBy,
            sortOrder: this.filters.pagination.sortOrder,
          });

          this.locationsData = response.items;
          this.updateFilter("pagination", {
            ...this.filters.pagination,
            total: response.total,
          });
        } catch (error) {
          console.error("Failed to fetch locations:", error);
          this.locationsData = [];
        }
      }
    },

    buildFilterByArray(): string[] {
      const filterBy: string[] = [];

      if (this.filters.filterArea) {
        filterBy.push(`areaId==${this.filters.filterArea}`);
      }

      return filterBy;
    },

    clearFilters() {
      this.updateFilters({
        searchQuery: "",
        filterArea: "",
        pagination: {
          ...this.filters.pagination,
          offset: 0,
        },
      });
    },

    selectLocation(location: Location) {
      this.selectedLocationId = location.meta.id;
    },

    getAreaName(areaId: string): string {
      const area = this.areasStore.getAreaById(areaId);
      return area?.meta.name || "Unknown Area";
    },

    editLocation(location: Location) {
      this.editingLocationId = location.meta.id;
      this.selectedLocationId = null;
      this.showModal = true;
    },

    deleteLocationConfirm() {
      if (!this.selectedLocationId) return;

      this.confirmAction = async () => {
        if (this.selectedLocationId) {
          await this.locationsStore.deleteLocation(this.selectedLocationId);
          await this.fetchLocations();
          this.toast.success("Location deleted successfully");
          this.selectedLocationId = null;
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
      this.editingLocationId = null;
    },
  },
  watch: {
    isInitialized: {
      immediate: true,
      handler(initialized) {
        if (initialized) {
          this.fetchLocations();
        }
      },
    },
    "filters.searchQuery"() {
      this.updateFilter("pagination", {
        ...this.filters.pagination,
        offset: 0,
      });
      this.fetchLocations();
    },
    "filters.filterArea"() {
      this.updateFilter("pagination", {
        ...this.filters.pagination,
        offset: 0,
      });
      this.fetchLocations();
    },
  },
});
</script>
