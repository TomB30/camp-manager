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
      v-model:filter-type="filterType"
      v-model:filter-capacity="filterCapacity"
      :filters="locationFilters"
      :filtered-count="filteredLocations.length"
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
    <div v-else-if="viewMode === 'grid'" class="locations-grid">
      <LocationCard
        v-for="location in filteredLocations"
        :key="location.id"
        :location="location"
        :formatted-type="formatLocationType(location.type)"
        :icon-color="getLocationTypeColor(location.type)"
        :usage-percent="getLocationUsage(location.id)"
        @click="selectLocation(location.id)"
      >
        <template #icon>
          <Icon
            :name="LocationTypeIcon(location.type)"
            :size="24"
            :stroke-width="2"
          />
        </template>
      </LocationCard>
    </div>

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
          <div
            class="location-icon-sm"
            :style="{ background: getLocationTypeColor(item.type) }"
          >
            <Icon
              :name="LocationTypeIcon(item.type)"
              :size="18"
              :stroke-width="2"
            />
          </div>
          <div class="location-name">{{ item.name }}</div>
        </div>
      </template>

      <template #cell-type="{ item }">
        <span class="badge badge-primary badge-sm">{{
          formatLocationType(item.type)
        }}</span>
      </template>

      <template #cell-location="{ item }">
        <span v-if="item.areaId">
          {{ areasStore.getAreaById(item.areaId)?.name || "Unknown" }}
        </span>
        <span v-else class="text-caption">No area</span>
      </template>

      <template #cell-equipment="{ item }">
        <span
          v-if="item.equipment && item.equipment.length > 0"
          class="badge badge-success badge-sm"
        >
          {{ item.equipment.length }} item(s)
        </span>
        <span v-else class="text-caption">None</span>
      </template>

      <template #cell-usage="{ item }">
        <div class="usage-indicator">
          <div class="usage-bar-sm">
            <div
              class="usage-fill-sm"
              :style="{
                width: `${getLocationUsage(item.id)}%`,
                background:
                  getLocationUsage(item.id) > 80
                    ? 'var(--error-color)'
                    : 'var(--success-color)',
              }"
            ></div>
          </div>
          <span class="usage-text"
            >{{ getLocationUsage(item.id).toFixed(0) }}%</span
          >
        </div>
      </template>

      <template #cell-events="{ item }">
        <span class="event-count">{{ getLocationEvents(item.id).length }}</span>
      </template>

      <template #cell-actions="{ item }">
        <BaseButton outline color="grey-8" size="sm" @click.stop="selectLocation(item.id)" label="View Details" />
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
            selectedLocation ? getLocationEvents(selectedLocation.id) : []
          "
          :show-enrollment="true"
          empty-message="No events scheduled"
        />
      </template>
    </LocationDetailModal>

    <!-- Add/Edit Location Modal -->
    <LocationFormModal
      v-if="showModal"
      :is-editing="!!editingLocationId"
      :form-data="formData"
      @close="closeModal"
      @save="saveLocation"
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
import type { Location } from "@/types";
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
import Icon from "../Icon.vue";
import { useToast } from "@/composables/useToast";
import type { IconName } from "../Icon.vue";

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
      formData: {
        name: "",
        type: "classroom" as Location["type"],
        capacity: 20,
        areaId: undefined as string | undefined,
        equipment: [] as string[],
        notes: "",
      },
      searchQuery: "",
      filterType: "",
      filterCapacity: "",
      locationColumns: [
        { key: "name", label: "Location Name", width: "200px" },
        { key: "type", label: "Type", width: "120px" },
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
          model: "filterType",
          value: this.filterType,
          placeholder: "Filter by Type",
          options: [
            { label: "Classroom", value: "classroom" },
            { label: "Outdoor", value: "outdoor" },
            { label: "Sports", value: "sports" },
            { label: "Arts", value: "arts" },
            { label: "Dining", value: "dining" },
          ],
        },
        {
          model: "filterCapacity",
          value: this.filterCapacity,
          placeholder: "Filter by Capacity",
          options: [
            { label: "Small (< 15)", value: "small" },
            { label: "Medium (15-30)", value: "medium" },
            { label: "Large (> 30)", value: "large" },
          ],
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
        locations = locations.filter((location: Location) => {
          const areaName = location.areaId
            ? this.areasStore.getAreaById(location.areaId)?.name
            : undefined;
          return (
            location.name.toLowerCase().includes(query) ||
            (areaName && areaName.toLowerCase().includes(query))
          );
        });
      }

      // Type filter
      if (this.filterType) {
        locations = locations.filter(
          (location: Location) => location.type === this.filterType,
        );
      }

      // Capacity filter
      if (this.filterCapacity) {
        locations = locations.filter((location: Location) => {
          if (this.filterCapacity === "small")
            return location.capacity && location.capacity < 15;
          if (this.filterCapacity === "medium")
            return (
              location.capacity &&
              location.capacity >= 15 &&
              location.capacity <= 30
            );
          if (this.filterCapacity === "large")
            return location.capacity && location.capacity > 30;
          return true;
        });
      }

      return locations;
    },
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    filterType() {
      this.currentPage = 1;
    },
    filterCapacity() {
      this.currentPage = 1;
    },
  },
  methods: {
    clearFilters() {
      this.searchQuery = "";
      this.filterType = "";
      this.filterCapacity = "";
    },
    formatLocationType(type: string): string {
      return type.charAt(0).toUpperCase() + type.slice(1);
    },
    LocationTypeIcon(type: Location["type"]): IconName {
      const iconMap: Record<Location["type"], IconName> = {
        classroom: "BookOpen",
        activity: "Target",
        sports: "Dumbbell",
        dining: "Utensils",
        outdoor: "Trees",
        arts: "Palette",
      };
      return iconMap[type] || "MapPin";
    },
    getLocationTypeColor(type: Location["type"]): string {
      const colors: Record<Location["type"], string> = {
        classroom: "#2196F3",
        activity: "#4CAF50",
        sports: "#FF9800",
        dining: "#795548",
        outdoor: "#8BC34A",
        arts: "#9C27B0",
      };
      return colors[type] || "#757575";
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
          (this.eventsStore.getEventCamperIds(event.id).length /
            (location.capacity || 0)) *
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

      this.editingLocationId = this.selectedLocation.id;
      this.formData = {
        name: this.selectedLocation.name,
        type: this.selectedLocation.type,
        capacity: this.selectedLocation.capacity || 0,
        areaId: this.selectedLocation.areaId,
        equipment: this.selectedLocation.equipment || [],
        notes: this.selectedLocation.notes || "",
      };

      this.selectedLocationId = null;
      this.showModal = true;
    },
    async saveLocation(
      formData: typeof this.formData & { equipment: string[] },
    ) {
      try {
        const locationData: Location = {
          id: this.editingLocationId || `location-${Date.now()}`,
          name: formData.name,
          type: formData.type,
          capacity: formData.capacity,
          areaId: formData.areaId,
          equipment: formData.equipment,
          notes: formData.notes,
        };

        if (this.editingLocationId) {
          await this.locationsStore.updateLocation(locationData);
          this.toast.success("Location updated successfully");
        } else {
          await this.locationsStore.addLocation(locationData);
          this.toast.success("Location added successfully");
        }

        this.closeModal();
      } catch (error: any) {
        this.toast.error(error.message || "Failed to save location");
      }
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
      this.formData = {
        name: "",
        type: "classroom",
        capacity: 20,
        areaId: undefined,
        equipment: [],
        notes: "",
      };
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
  gap: 1.5rem;
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
    gap: 1rem;
  }
}
</style>
