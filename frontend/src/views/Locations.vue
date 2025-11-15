<template>
  <div class="activity-locations-tab">
    <TabHeader
      title="Locations"
      description="Manage all locations where camp programs and events take place."
      action-text="Location"
      @action="showModal = true"
    >
      <template #action-icon>
        <Icon name="Plus" :size="18" />
      </template>
    </TabHeader>

    <!-- Search and Filters -->
    <FilterBar
      v-model:searchQuery="searchQuery"
      v-model:filter-area="filterArea"
      :filters="locationFilters"
      :filtered-count="filteredLocations.length"
      search-placeholder="Search by location name..."
      :total-count="locationsStore.locations.length"
      @clear="clearFilters"
    >
      <template #prepend>
        <ViewToggle v-model="viewMode" />
      </template>
    </FilterBar>

    <!-- Empty State -->
    <EmptyState
      v-if="locationsStore.locations.length === 0"
      icon-name="MapPin"
      title="No locations configured"
      message="Add your first location to start organizing your camp spaces."
      action-text="Location"
      @action="showModal = true"
    />

    <!-- Grid View -->
    <transition-group
      v-else-if="viewMode === 'grid'"
      name="list"
      tag="div"
      class="locations-grid transition-wrapper"
    >
      <LocationCard
        v-for="location in filteredLocations"
        :key="location.meta.id"
        :location="location"
        @click="selectLocation(location.meta.id)"
      />
    </transition-group>

    <!-- Table View -->
    <DataTable
      v-else
      :columns="locationColumns"
      :data="filteredLocations"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      row-key="id"
    >
      <template #cell-name="{ item }">
        <div class="location-name-content">
          <div class="location-icon-sm" :style="{ background: '#3b82f6' }">
            <Icon name="MapPin" :size="18" :stroke-width="2" />
          </div>
          <div class="location-name">{{ item.meta.name }}</div>
        </div>
      </template>

      <template #cell-location="{ item }">
        <span v-if="item.spec.areaId">
          {{ areasStore.getAreaById(item.spec.areaId)?.meta.name || "Unknown" }}
        </span>
        <span v-else class="text-caption">No area</span>
      </template>

      <template #cell-equipment="{ item }">
        <span
          v-if="item.spec.equipment && item.spec.equipment.length > 0"
          class="badge badge-success badge-sm"
        >
          {{ item.spec.equipment.length }} item(s)
        </span>
        <span v-else class="text-caption">None</span>
      </template>

      <template #cell-usage="{ item }">
        <div class="usage-indicator">
          <div class="usage-bar-sm">
            <div
              class="usage-fill-sm"
              :style="{
                width: `${getLocationUsage(item.meta.id)}%`,
                background:
                  getLocationUsage(item.meta.id) > 80
                    ? 'var(--error-color)'
                    : 'var(--success-color)',
              }"
            ></div>
          </div>
          <span class="usage-text"
            >{{ getLocationUsage(item.meta.id).toFixed(0) }}%</span
          >
        </div>
      </template>

      <template #cell-events="{ item }">
        <span class="event-count">{{
          getLocationEvents(item.meta.id).length
        }}</span>
      </template>

      <template #cell-actions="{ item }">
        <BaseButton
          outline
          color="grey-8"
          size="sm"
          @click="selectLocation(item.meta.id)"
          label="View Details"
        />
      </template>
    </DataTable>

    <!-- Location Detail Modal -->
    <LocationDetailModal
      v-if="!!selectedLocationId"
      :location="selectedLocation"
      @close="selectedLocationId = null"
      @edit="editLocation"
      @delete="deleteLocationConfirm"
    >
      <template #events-list>
        <EventsByDate
          :events="
            selectedLocation ? getLocationEvents(selectedLocation.meta.id) : []
          "
          :show-enrollment="true"
          empty-message="No events scheduled"
        />
      </template>
    </LocationDetailModal>

    <!-- Add/Edit Location Modal -->
    <LocationFormModal
      v-if="showModal"
      :location-id="editingLocationId || undefined"
      @close="closeModal"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      v-if="showConfirmModal"
      title="Delete Location"
      message="Are you sure you want to delete this location?"
      confirm-text="Delete"
      :danger-mode="true"
      @confirm="handleConfirmAction"
      @cancel="handleCancelConfirm"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useLocationsStore, useAreasStore, useEventsStore } from "@/stores";
import type { Area, Location } from "@/generated/api";
import LocationCard from "@/components/cards/LocationCard.vue";
import FilterBar, { type Filter } from "@/components/FilterBar.vue";
import EventsByDate from "@/components/EventsByDate.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import DataTable from "@/components/DataTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import LocationDetailModal from "@/components/modals/LocationDetailModal.vue";
import LocationFormModal from "@/components/modals/LocationFormModal.vue";
import EmptyState from "@/components/EmptyState.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import Icon from "@/components/Icon.vue";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "LocationsTab",
  components: {
    LocationCard,
    FilterBar,
    EventsByDate,
    ConfirmModal,
    DataTable,
    ViewToggle,
    LocationDetailModal,
    LocationFormModal,
    EmptyState,
    TabHeader,
    Icon,
  },
  setup() {
    const locationsStore = useLocationsStore();
    const toast = useToast();
    const areasStore = useAreasStore();
    const eventsStore = useEventsStore();
    return { locationsStore, toast, areasStore, eventsStore };
  },
  data() {
    return {
      selectedLocationId: null as string | null,
      showModal: false,
      editingLocationId: null as string | null,
      showConfirmModal: false,
      confirmAction: null as (() => void) | null,
      viewMode: "grid" as "grid" | "table",
      currentPage: 1,
      pageSize: 10,
      searchQuery: "",
      filterArea: "",
      locationColumns: [
        { key: "name", label: "Location Name", width: "200px" },
        { key: "capacity", label: "Capacity", width: "100px" },
        { key: "location", label: "Area", width: "180px" },
        { key: "equipment", label: "Equipment", width: "120px" },
        { key: "usage", label: "Usage", width: "140px" },
        { key: "events", label: "Events", width: "100px" },
        { key: "actions", label: "Actions", width: "140px" },
      ],
    };
  },
  computed: {
    locationFilters(): Filter[] {
      return [
        {
          model: "filterArea",
          value: this.filterArea,
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
        this.locationsStore.getLocationById(this.selectedLocationId) || null
      );
    },
    filteredLocations(): Location[] {
      let locations: Location[] = this.locationsStore.locations;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        locations = locations.filter((location: Location) =>
          location.meta.name.toLowerCase().includes(query),
        );
      }

      return locations;
    },
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    filterArea() {
      this.currentPage = 1;
    },
  },
  methods: {
    clearFilters() {
      this.searchQuery = "";
      this.filterArea = "";
    },
    getLocationEvents(locationId: string) {
      return this.eventsStore.locationEvents(locationId);
    },
    getLocationUsage(locationId: string): number {
      const locationEvents = this.eventsStore.locationEvents(locationId);
      if (locationEvents.length === 0) return 0;

      const location = this.locationsStore.getLocationById(locationId);
      if (!location) return 0;

      // Calculate average capacity usage
      const totalUsage = locationEvents.reduce((sum, event) => {
        return (
          sum +
          (this.eventsStore.getEventCamperIds(event.meta.id).length /
            (location.spec.capacity || 0)) *
            100
        );
      }, 0);

      return totalUsage / locationEvents.length;
    },
    selectLocation(locationId: string) {
      this.selectedLocationId = locationId;
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
          try {
            await this.locationsStore.deleteLocation(this.selectedLocationId);
            this.toast.success("Location deleted successfully");
            this.selectedLocationId = null;
          } catch (error: any) {
            this.toast.error(error.message || "Failed to delete location");
          }
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
});
</script>

<style scoped>
.activity-locations-tab {
  animation: slideIn 0.3s ease;
}

.locations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 0.5rem;
}

.locations-grid .empty-state {
  grid-column: 1 / -1;
}

.location-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.location-icon-sm {
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.location-name {
  font-weight: 500;
  color: var(--text-primary);
}

.usage-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.usage-bar-sm {
  flex: 1;
  height: 6px;
  background: var(--border-color);
  border-radius: 999px;
  overflow: hidden;
  min-width: 60px;
}

.usage-fill-sm {
  height: 100%;
  transition:
    width 0.3s,
    background 0.3s;
}

.usage-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.event-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: var(--primary-color);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
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

@media (max-width: 768px) {
  .locations-grid {
    grid-template-columns: 1fr;
  }
}
</style>
