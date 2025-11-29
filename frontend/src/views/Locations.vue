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
        search-placeholder="Search by name..."
        @clear="clearFilters"
      >
        <template #filters>
          <div class="row q-gutter-x-sm items-center">
            <BaseSelect
              v-model="filters.areaId"
              :options="areaFilterOptions"
              @update:model-value="
                updateFilter('areaId', $event);
                fetchLocations();
              "
              label="Filter by area"
            />
            <q-input
              clearable
              outlined
              dense
              v-model="filters.capacity"
              type="number"
              placeholder="Filter by capacity"
              @update:model-value="
                updateFilter('capacity', $event);
                fetchLocations();
              "
            />
          </div>
        </template>
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
        @row-click="selectLocation($event.meta.id)"
      >
        <template #item="{ item }">
          <LocationCard
            :location="item"
            @click="selectLocation(item.meta.id)"
          />
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
import type { Location } from "@/generated/api";
import type { QSelectOption, QTableColumn } from "quasar";
import { isBackendEnabled } from "@/config/dataSource";
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
import BaseSelect from "@/components/common/BaseSelect.vue";

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
    BaseSelect,
  },
  setup() {
    const { filters, updateFilter, updateFilters, isInitialized } =
      usePageFilters("locations", {
        searchQuery: "",
        areaId: "",
        capacity: undefined as number | undefined | null | string,
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
          label: "Name",
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
    areaFilterOptions(): QSelectOption[] {
      return this.areasStore.areas.map((area) => ({
        label: area.meta.name,
        value: area.meta.id,
      }));
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
        this.locationsData = Array.isArray(response)
          ? response
          : response.items;
      } else {
        try {
          this.loading = true;
          const filterBy = this.buildFilterBy();
          const response = await this.locationsStore.loadLocationsPaginated({
            offset: this.filters.pagination.offset,
            limit: this.filters.pagination.limit,
            search: this.filters.searchQuery || undefined,
            sortBy: this.filters.pagination.sortBy,
            sortOrder: this.filters.pagination.sortOrder,
            filterBy,
          });

          this.locationsData = response.items;
          this.updateFilter("pagination", {
            ...this.filters.pagination,
            total: response.total,
          });
        } catch (error) {
          console.error("Failed to fetch locations:", error);
          this.locationsData = [];
        } finally {
          this.loading = false;
        }
      }
    },
    buildFilterBy(): string[] {
      const filterBy = [];
      if (this.filters.areaId) {
        filterBy.push(`areaId==${this.filters.areaId}`);
      }
      if (this.filters.capacity) {
        filterBy.push(`capacity>=${this.filters.capacity}`);
      }
      return filterBy;
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

    selectLocation(locationId: string) {
      this.selectedLocationId = locationId;
    },

    getAreaName(areaId: string): string {
      const area = this.areasStore.getAreaById(areaId);
      return area?.meta.name || "-";
    },

    editLocation() {
      if (!this.selectedLocation) return;
      this.editingLocationId = this.selectedLocation.meta.id;
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
      this.fetchLocations();
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
  },
});
</script>
