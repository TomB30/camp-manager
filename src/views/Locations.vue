<template>
  <div class="container">
    <div class="locations-view">
      <ViewHeader title="Location Management">
        <template #actions>
          <button class="btn btn-primary" @click="showModal = true">+ Add Location</button>
        </template>
      </ViewHeader>

      <!-- Search and Filters -->
      <FilterBar
        v-model:searchQuery="searchQuery"
        v-model:filter-type="filterType"
        :filters="locationFilters"
        :filtered-count="filteredLocations.length"
        :total-count="store.locations.length"
        @clear="clearFilters"
      >
        <template #prepend>
          <ViewToggle v-model="viewMode" />
        </template>
      </FilterBar>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="locations-grid">
        <LocationCard
          v-for="location in filteredLocations"
          :key="location.id"
          :location="location"
          :format-type="formatLocationType(location.type)"
          :icon-color="getLocationTypeColor(location.type)"
          @click="selectLocation(location.id)"
        >
          <template #icon>
            <component :is="LocationTypeIcon(location.type)" :size="24" :stroke-width="2" />
          </template>
        </LocationCard>
      </div>

      <!-- Table View -->
      <DataTable
        v-if="viewMode === 'table'"
        :columns="locationColumns"
        :data="filteredLocations"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        row-key="id"
      >
        <template #cell-name="{ item }">
          <div class="location-name-content">
            <div class="location-icon-sm" :style="{ background: getLocationTypeColor(item.type) }">
              <component :is="LocationTypeIcon(item.type)" :size="18" :stroke-width="2" />
            </div>
            <div class="location-name">{{ item.name }}</div>
          </div>
        </template>
        
        <template #cell-type="{ item }">
          <span class="badge badge-primary badge-sm">{{ formatLocationType(item.type) }}</span>
        </template>
        
        <template #cell-capacity="{ item }">
          <span v-if="item.capacity">{{ item.capacity }}</span>
          <span v-else class="text-secondary">N/A</span>
        </template>
        
        <template #cell-equipment="{ item }">
          <span v-if="item.equipment && item.equipment.length > 0" class="badge badge-success badge-sm">
            {{ item.equipment.length }} item(s)
          </span>
          <span v-else class="text-secondary">None</span>
        </template>
        
        <template #cell-actions="{ item }">
          <button class="btn btn-sm btn-secondary" @click.stop="selectLocation(item.id)">
            View Details
          </button>
        </template>
      </DataTable>

      <!-- Location Detail Modal -->
      <LocationDetailModal
        :show="!!selectedLocationId"
        :location="selectedLocation"
        @close="selectedLocationId = null"
        @edit="editLocation"
        @delete="deleteLocationConfirm"
      />

      <!-- Add/Edit Location Modal -->
      <LocationFormModal
        :show="showModal"
        :is-editing="!!editingLocationId"
        :form-data="formData"
        @close="closeModal"
        @save="saveLocation"
      />

      <!-- Confirm Delete Modal -->
      <ConfirmModal
        :show="showConfirmModal"
        title="Delete Location"
        message="Are you sure you want to delete this location?"
        confirm-text="Delete"
        :danger-mode="true"
        @confirm="handleConfirmAction"
        @cancel="handleCancelConfirm"
      />
    </div>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import { defineComponent } from 'vue';
import { useCampStore } from '@/stores/campStore';
import type { Location } from '@/types/api';
import ViewHeader from '@/components/ViewHeader.vue';
import LocationCard from '@/components/cards/LocationCard.vue';
import FilterBar, { type Filter } from '@/components/FilterBar.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import DataTable from '@/components/DataTable.vue';
import ViewToggle from '@/components/ViewToggle.vue';
import LocationDetailModal from '@/components/modals/LocationDetailModal.vue';
import LocationFormModal from '@/components/modals/LocationFormModal.vue';
import { MapPin, Home, TreesIcon as Trees, Activity, Waves, MoreHorizontal } from 'lucide-vue-next';
import { useToast } from '@/composables/useToast';

export default defineComponent({
  name: 'Locations',
  components: {
    ViewHeader,
    LocationCard,
    FilterBar,
    ConfirmModal,
    DataTable,
    ViewToggle,
    LocationDetailModal,
    LocationFormModal,
    MapPin,
  },
  setup() {
    const store = useCampStore();
    const toast = useToast();
    return { store, toast };
  },
  data() {
    return {
      showModal: false,
      showConfirmModal: false,
      editingLocationId: null as string | null,
      selectedLocationId: null as string | null,
      searchQuery: '',
      filterType: '',
      viewMode: 'grid' as 'grid' | 'table',
      currentPage: 1,
      pageSize: 10,
      formData: this.getEmptyFormData(),
      confirmAction: null as (() => void) | null,
      
      locationColumns: [
        { key: 'name', label: 'Location Name', sortable: true },
        { key: 'type', label: 'Type', sortable: true },
        { key: 'capacity', label: 'Capacity', sortable: true },
        { key: 'equipment', label: 'Equipment' },
        { key: 'actions', label: '', width: '120px' },
      ],
    };
  },
  computed: {
    locationFilters(): Filter[] {
      return [
        {
          model: 'filterType',
          value: this.filterType,
          placeholder: 'Filter by Type',
          options: [
            { value: 'indoor', label: 'Indoor' },
            { value: 'outdoor', label: 'Outdoor' },
            { value: 'facility', label: 'Facility' },
            { value: 'field', label: 'Field' },
            { value: 'water', label: 'Water' },
            { value: 'other', label: 'Other' },
          ],
        },
      ];
    },

    filteredLocations(): Location[] {
      let filtered = this.store.locations;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter((location) =>
          location.name.toLowerCase().includes(query) ||
          location.description?.toLowerCase().includes(query)
        );
      }

      // Type filter
      if (this.filterType && this.filterType !== '' && this.filterType !== 'all') {
        filtered = filtered.filter((location) => location.type === this.filterType);
      }

      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    },

    selectedLocation(): Location | null {
      if (!this.selectedLocationId) return null;
      return this.store.getLocationById(this.selectedLocationId);
    },
  },
  methods: {
    getEmptyFormData() {
      return {
        name: '',
        description: '',
        type: 'indoor' as Location['type'],
        capacity: undefined,
        equipment: [] as string[],
        notes: '',
      };
    },

    selectLocation(id: string) {
      this.selectedLocationId = id;
    },

    editLocation(location: Location) {
      this.editingLocationId = location.id;
      this.formData = {
        name: location.name,
        description: location.description || '',
        type: location.type,
        capacity: location.capacity,
        equipment: location.equipment || [],
        notes: location.notes || '',
      };
      this.selectedLocationId = null;
      this.showModal = true;
    },

    async saveLocation(data: any) {
      try {
        if (this.editingLocationId) {
          // Update existing
          await this.store.updateLocation({
            id: this.editingLocationId,
            ...data,
            createdAt: this.store.getLocationById(this.editingLocationId)?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          this.toast.success('Location updated successfully');
        } else {
          // Create new
          await this.store.addLocation({
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          this.toast.success('Location added successfully');
        }
        this.closeModal();
      } catch (error: any) {
        this.toast.error(error.message || 'Failed to save location');
      }
    },

    deleteLocationConfirm(id: string) {
      this.confirmAction = () => this.deleteLocation(id);
      this.showConfirmModal = true;
      this.selectedLocationId = null;
    },

    async deleteLocation(id: string) {
      try {
        await this.store.deleteLocation(id);
        this.toast.success('Location deleted successfully');
      } catch (error: any) {
        this.toast.error(error.message || 'Failed to delete location');
      }
    },

    closeModal() {
      this.showModal = false;
      this.editingLocationId = null;
      this.formData = this.getEmptyFormData();
    },

    clearFilters() {
      this.searchQuery = '';
      this.filterType = '';
    },

    handleConfirmAction() {
      if (this.confirmAction) {
        this.confirmAction();
        this.confirmAction = null;
      }
      this.showConfirmModal = false;
    },

    handleCancelConfirm() {
      this.confirmAction = null;
      this.showConfirmModal = false;
    },

    formatLocationType(type: Location['type']): string {
      const typeMap: Record<Location['type'], string> = {
        indoor: 'Indoor',
        outdoor: 'Outdoor',
        facility: 'Facility',
        field: 'Field',
        water: 'Water',
        other: 'Other',
      };
      return typeMap[type] || type;
    },

    getLocationTypeColor(type: Location['type']): string {
      const colorMap: Record<Location['type'], string> = {
        indoor: '#3b82f6',
        outdoor: '#10b981',
        facility: '#6366f1',
        field: '#f59e0b',
        water: '#06b6d4',
        other: '#6b7280',
      };
      return colorMap[type] || '#6b7280';
    },

    LocationTypeIcon(type: Location['type']) {
      const iconMap: Record<Location['type'], any> = {
        indoor: Home,
        outdoor: Trees,
        facility: Activity,
        field: Activity,
        water: Waves,
        other: MoreHorizontal,
      };
      return iconMap[type] || MapPin;
    },
  },
});
</script>

<style scoped>
.locations-view {
  padding: 0;
}

.locations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
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
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.location-name {
  font-weight: 500;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .locations-view {
    padding: 1rem 0;
  }

  .locations-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>

