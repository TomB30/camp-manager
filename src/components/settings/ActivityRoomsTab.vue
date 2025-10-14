<template>
  <div class="activity-rooms-tab">
    <TabHeader
      title="Activity Rooms"
      description="Manage all activity rooms where camp programs and events take place."
      action-text="+ Room"
      @action="showModal = true"
    >
      <template #action-icon>
        <Plus :size="18" />
      </template>
    </TabHeader>

    <!-- Search and Filters -->
    <FilterBar
      v-model:searchQuery="searchQuery"
      v-model:filter-type="filterType"
      v-model:filter-capacity="filterCapacity"
      :filters="roomFilters"
      :filtered-count="filteredRooms.length"
      :total-count="store.rooms.length"
      @clear="clearFilters"
    >
      <template #prepend>
        <ViewToggle v-model="viewMode" />
      </template>
    </FilterBar>

    <!-- Empty State -->
    <EmptyState
      v-if="store.rooms.length === 0"
      icon="Home"
      title="No activity rooms configured"
      message="Add your first activity room to start organizing your camp spaces."
    >
      <button class="btn btn-primary" @click="showModal = true">
        <Plus :size="18" />
        Add Your First Room
      </button>
    </EmptyState>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="rooms-grid">
      <RoomCard
        v-for="room in filteredRooms"
        :key="room.id"
        :room="room"
        :formatted-type="formatRoomType(room.type)"
        :icon-color="getRoomTypeColor(room.type)"
        :usage-percent="getRoomUsage(room.id)"
        @click="selectRoom(room.id)"
      >
        <template #icon>
          <component :is="RoomTypeIcon(room.type)" :size="24" :stroke-width="2" />
        </template>
      </RoomCard>
    </div>

    <!-- Table View -->
    <DataTable
      v-else
      :columns="roomColumns"
      :data="filteredRooms"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      row-key="id"
    >
      <template #cell-name="{ item }">
        <div class="room-name-content">
          <div class="room-icon-sm" :style="{ background: getRoomTypeColor(item.type) }">
            <component :is="RoomTypeIcon(item.type)" :size="18" :stroke-width="2" />
          </div>
          <div class="room-name">{{ item.name }}</div>
        </div>
      </template>
      
      <template #cell-type="{ item }">
        <span class="badge badge-primary badge-sm">{{ formatRoomType(item.type) }}</span>
      </template>
      
      <template #cell-location="{ item }">
        <span v-if="item.locationId">
          {{ store.getLocationById(item.locationId)?.name || item.location || 'Unknown' }}
        </span>
        <span v-else-if="item.location">{{ item.location }}</span>
        <span v-else class="text-secondary">No location</span>
      </template>
      
      <template #cell-equipment="{ item }">
        <span v-if="item.equipment && item.equipment.length > 0" class="badge badge-success badge-sm">
          {{ item.equipment.length }} item(s)
        </span>
        <span v-else class="text-secondary">None</span>
      </template>
      
      <template #cell-usage="{ item }">
        <div class="usage-indicator">
          <div class="usage-bar-sm">
            <div 
              class="usage-fill-sm"
              :style="{ 
                width: `${getRoomUsage(item.id)}%`,
                background: getRoomUsage(item.id) > 80 ? 'var(--error-color)' : 'var(--success-color)'
              }"
            ></div>
          </div>
          <span class="usage-text">{{ getRoomUsage(item.id).toFixed(0) }}%</span>
        </div>
      </template>
      
      <template #cell-events="{ item }">
        <span class="event-count">{{ getRoomEvents(item.id).length }}</span>
      </template>
      
      <template #cell-actions="{ item }">
        <button class="btn btn-sm btn-secondary" @click.stop="selectRoom(item.id)">
          View Details
        </button>
      </template>
    </DataTable>

    <!-- Room Detail Modal -->
    <RoomDetailModal
      :show="!!selectedRoomId"
      :room="selectedRoom"
      @close="selectedRoomId = null"
      @edit="editRoom"
      @delete="deleteRoomConfirm"
    >
      <template #events-list>
        <EventsByDate 
          :events="selectedRoom ? getRoomEvents(selectedRoom.id) : []"
          :show-enrollment="true"
          empty-message="No events scheduled"
        />
      </template>
    </RoomDetailModal>

    <!-- Add/Edit Room Modal -->
    <RoomFormModal
      :show="showModal"
      :is-editing="!!editingRoomId"
      :form-data="formData"
      @close="closeModal"
      @save="saveRoom"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :show="showConfirmModal"
      title="Delete Activity Room"
      message="Are you sure you want to delete this room?"
      confirm-text="Delete"
      :danger-mode="true"
      @confirm="handleConfirmAction"
      @cancel="handleCancelConfirm"
    />
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import { defineComponent } from 'vue';
import { useCampStore } from '@/stores/campStore';
import type { Room } from '@/types/api';
import RoomCard from '@/components/cards/RoomCard.vue';
import FilterBar, { type Filter } from '@/components/FilterBar.vue';
import EventsByDate from '@/components/EventsByDate.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import DataTable from '@/components/DataTable.vue';
import ViewToggle from '@/components/ViewToggle.vue';
import RoomDetailModal from '@/components/modals/RoomDetailModal.vue';
import RoomFormModal from '@/components/modals/RoomFormModal.vue';
import EmptyState from '@/components/EmptyState.vue';
import TabHeader from '@/components/settings/TabHeader.vue';
import { 
  BookOpen, 
  Target, 
  Dumbbell, 
  Utensils, 
  Trees, 
  Palette, 
  Home,
  Plus
} from 'lucide-vue-next';
import { useToast } from '@/composables/useToast';

export default defineComponent({
  name: 'ActivityRoomsTab',
  components: {
    RoomCard,
    FilterBar,
    EventsByDate,
    ConfirmModal,
    DataTable,
    ViewToggle,
    RoomDetailModal,
    RoomFormModal,
    EmptyState,
    TabHeader,
    Plus,
  },
  setup() {
    const store = useCampStore();
    const toast = useToast();
    return { store, toast };
  },
  data() {
    return {
      selectedRoomId: null as string | null,
      showModal: false,
      editingRoomId: null as string | null,
      showConfirmModal: false,
      confirmAction: null as (() => void) | null,
      viewMode: 'grid' as 'grid' | 'table',
      currentPage: 1,
      pageSize: 10,
      formData: {
        name: '',
        type: 'classroom' as Room['type'],
        capacity: 20,
        locationId: undefined as string | undefined,
        equipment: [] as string[],
        notes: '',
      },
      searchQuery: '',
      filterType: '',
      filterCapacity: '',
      roomColumns: [
        { key: 'name', label: 'Room Name', width: '200px' },
        { key: 'type', label: 'Type', width: '120px' },
        { key: 'capacity', label: 'Capacity', width: '100px' },
        { key: 'location', label: 'Location', width: '180px' },
        { key: 'equipment', label: 'Equipment', width: '120px' },
        { key: 'usage', label: 'Usage', width: '140px' },
        { key: 'events', label: 'Events', width: '100px' },
        { key: 'actions', label: 'Actions', width: '140px' },
      ]
    };
  },
  computed: {
    roomFilters(): Filter[] {
      return [
        {
          model: 'filterType',
          value: this.filterType,
          placeholder: 'Filter by Type',
          options: [
            { label: 'Classroom', value: 'classroom' },
            { label: 'Outdoor', value: 'outdoor' },
            { label: 'Sports', value: 'sports' },
            { label: 'Arts', value: 'arts' },
            { label: 'Dining', value: 'dining' },
          ],
        },
        {
          model: 'filterCapacity',
          value: this.filterCapacity,
          placeholder: 'Filter by Capacity',
          options: [
            { label: 'Small (< 15)', value: 'small' },
            { label: 'Medium (15-30)', value: 'medium' },
            { label: 'Large (> 30)', value: 'large' },
          ],
        },
      ];
    },
    selectedRoom(): Room | null {
      if (!this.selectedRoomId) return null;
      return this.store.getRoomById(this.selectedRoomId) || null;
    },
    filteredRooms(): Room[] {
      let rooms: Room[] = this.store.rooms;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        rooms = rooms.filter((room: Room) => {
          const locationName = room.locationId 
            ? this.store.getLocationById(room.locationId)?.name 
            : room.location;
          return room.name.toLowerCase().includes(query) ||
            (locationName && locationName.toLowerCase().includes(query));
        });
      }

      // Type filter
      if (this.filterType) {
        rooms = rooms.filter((room: Room) => room.type === this.filterType);
      }

      // Capacity filter
      if (this.filterCapacity) {
        rooms = rooms.filter((room: Room) => {
          if (this.filterCapacity === 'small') return room.capacity < 15;
          if (this.filterCapacity === 'medium') return room.capacity >= 15 && room.capacity <= 30;
          if (this.filterCapacity === 'large') return room.capacity > 30;
          return true;
        });
      }

      return rooms;
    }
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
    }
  },
  methods: {
    clearFilters() {
      this.searchQuery = '';
      this.filterType = '';
      this.filterCapacity = '';
    },
    formatRoomType(type: string): string {
      return type.charAt(0).toUpperCase() + type.slice(1);
    },
    RoomTypeIcon(type: Room['type']) {
      const iconMap: Record<Room['type'], any> = {
        classroom: BookOpen,
        activity: Target,
        sports: Dumbbell,
        dining: Utensils,
        outdoor: Trees,
        arts: Palette,
      };
      return iconMap[type] || Home;
    },
    getRoomTypeColor(type: Room['type']): string {
      const colors: Record<Room['type'], string> = {
        classroom: '#2196F3',
        activity: '#4CAF50',
        sports: '#FF9800',
        dining: '#795548',
        outdoor: '#8BC34A',
        arts: '#9C27B0',
      };
      return colors[type] || '#757575';
    },
    getRoomEvents(roomId: string) {
      return this.store.roomEvents(roomId);
    },
    getRoomUsage(roomId: string): number {
      const roomEvents = this.store.roomEvents(roomId);
      if (roomEvents.length === 0) return 0;
      
      const room = this.store.getRoomById(roomId);
      if (!room) return 0;
      
      // Calculate average capacity usage
      const totalUsage = roomEvents.reduce((sum, event) => {
        return sum + ((event.enrolledCamperIds?.length || 0) / room.capacity) * 100;
      }, 0);
      
      return totalUsage / roomEvents.length;
    },
    selectRoom(roomId: string) {
      this.selectedRoomId = roomId;
    },
    editRoom() {
      if (!this.selectedRoom) return;
      
      this.editingRoomId = this.selectedRoom.id;
      this.formData = {
        name: this.selectedRoom.name,
        type: this.selectedRoom.type,
        capacity: this.selectedRoom.capacity,
        locationId: this.selectedRoom.locationId,
        equipment: this.selectedRoom.equipment || [],
        notes: this.selectedRoom.notes || '',
      };
      
      this.selectedRoomId = null;
      this.showModal = true;
    },
    async saveRoom(formData: typeof this.formData & { equipment: string[] }) {
      try {
        // Get location name for backward compatibility
        const location = formData.locationId 
          ? this.store.getLocationById(formData.locationId)?.name 
          : undefined;

        const roomData: Room = {
          id: this.editingRoomId || `room-${Date.now()}`,
          name: formData.name,
          type: formData.type,
          capacity: formData.capacity,
          location: location,
          locationId: formData.locationId,
          equipment: formData.equipment,
          notes: formData.notes,
        };

        if (this.editingRoomId) {
          await this.store.updateRoom(roomData);
          this.toast.success('Room updated successfully');
        } else {
          await this.store.addRoom(roomData);
          this.toast.success('Room added successfully');
        }

        this.closeModal();
      } catch (error: any) {
        this.toast.error(error.message || 'Failed to save room');
      }
    },
    deleteRoomConfirm() {
      if (!this.selectedRoomId) return;
      this.confirmAction = async () => {
        if (this.selectedRoomId) {
          try {
            await this.store.deleteRoom(this.selectedRoomId);
            this.toast.success('Room deleted successfully');
            this.selectedRoomId = null;
          } catch (error: any) {
            this.toast.error(error.message || 'Failed to delete room');
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
      this.editingRoomId = null;
      this.formData = {
        name: '',
        type: 'classroom',
        capacity: 20,
        locationId: undefined,
        equipment: [],
        notes: '',
      };
    }
  }
});
</script>

<style scoped>
.activity-rooms-tab {
  animation: slideIn 0.3s ease;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.rooms-grid .empty-state {
  grid-column: 1 / -1;
}

.room-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.room-icon-sm {
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.room-name {
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
  transition: width 0.3s, background 0.3s;
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
  .rooms-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>

