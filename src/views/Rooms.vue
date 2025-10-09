<template>
  <div class="container">
    <div class="rooms-view">
      <div class="view-header">
        <h2>Room Management</h2>
        <div class="header-actions">
          <button class="btn btn-primary" @click="showModal = true">+ Add Room</button>
        </div>
      </div>

      <!-- Search and Filters -->
      <FilterBar
        v-model:searchQuery="searchQuery"
        v-model:filterType="filterType"
        v-model:filterCapacity="filterCapacity"
        :filters="roomFilters"
        :filtered-count="filteredRooms.length"
        :total-count="store.rooms.length"
        @clear="clearFilters"
      >
        <template #prepend>
          <div class="view-toggle">
            <button 
              class="btn btn-sm" 
              :class="{ 'btn-primary': viewMode === 'grid', 'btn-secondary': viewMode !== 'grid' }"
              @click="viewMode = 'grid'"
              title="Grid View"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button 
              class="btn btn-sm" 
              :class="{ 'btn-primary': viewMode === 'table', 'btn-secondary': viewMode !== 'table' }"
              @click="viewMode = 'table'"
              title="Table View"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </template>
      </FilterBar>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="rooms-grid">
        <div 
          v-for="room in filteredRooms"
          :key="room.id"
          class="room-card card"
          @click="selectRoom(room.id)"
        >
          <div class="room-icon" :style="{ background: getRoomTypeColor(room.type) }">
            <component :is="RoomTypeIcon(room.type)" :size="24" :stroke-width="2" />
          </div>
          <div class="room-details">
            <h4>{{ room.name }}</h4>
            <div class="room-type">
              <span class="badge badge-primary">{{ formatRoomType(room.type) }}</span>
              <span class="badge badge-success">Capacity: {{ room.capacity }}</span>
            </div>
            <div v-if="room.location" class="room-location text-sm text-secondary mt-1">
              <MapPin :size="14" class="inline" />
              {{ room.location }}
            </div>
            <div class="room-usage mt-2">
              <div class="usage-bar">
                <div 
                  class="usage-fill"
                  :style="{ 
                    width: `${getRoomUsage(room.id)}%`,
                    background: getRoomUsage(room.id) > 80 ? 'var(--error-color)' : 'var(--success-color)'
                  }"
                ></div>
              </div>
              <div class="text-xs text-secondary mt-1">
                {{ getRoomUsage(room.id).toFixed(0) }}% average usage
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <DataTable
        v-if="viewMode === 'table'"
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
      <Teleport to="body">
        <div v-if="selectedRoomId" class="modal-overlay" @click.self="selectedRoomId = null">
          <div class="modal">
            <div class="modal-header">
              <h3>{{ selectedRoom?.name }}</h3>
              <button class="btn btn-icon btn-secondary" @click="selectedRoomId = null">✕</button>
            </div>
            <div class="modal-body">
              <div v-if="selectedRoom">
                <div class="detail-section">
                  <div class="detail-label">Type</div>
                  <div>
                    <span class="badge badge-primary">{{ formatRoomType(selectedRoom.type) }}</span>
                  </div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">Capacity</div>
                  <div>{{ selectedRoom.capacity }} people</div>
                </div>

                <div v-if="selectedRoom.location" class="detail-section">
                  <div class="detail-label">Location</div>
                  <div>{{ selectedRoom.location }}</div>
                </div>

                <div v-if="selectedRoom.equipment && selectedRoom.equipment.length > 0" class="detail-section">
                  <div class="detail-label">Equipment</div>
                  <div class="flex gap-1 flex-wrap">
                    <span v-for="item in selectedRoom.equipment" :key="item" class="badge badge-success">
                      {{ item }}
                    </span>
                  </div>
                </div>

                <div v-if="selectedRoom.notes" class="detail-section">
                  <div class="detail-label">Notes</div>
                  <div>{{ selectedRoom.notes }}</div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">Scheduled Events</div>
                  <EventsByDate 
                    :events="getRoomEvents(selectedRoom.id)"
                    :show-enrollment="true"
                    empty-message="No events scheduled"
                  />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-error" @click="deleteRoomConfirm">Delete Room</button>
              <button class="btn btn-secondary" @click="editRoom">Edit</button>
              <button class="btn btn-secondary" @click="selectedRoomId = null">Close</button>
            </div>
          </div>
        </div>

        <!-- Add/Edit Room Modal -->
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal">
            <div class="modal-header">
              <h3>{{ editingRoomId ? 'Edit Room' : 'Add New Room' }}</h3>
              <button class="btn btn-icon btn-secondary" @click="closeModal">✕</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveRoom">
                <div class="form-group">
                  <label class="form-label">Room Name</label>
                  <input v-model="formData.name" type="text" class="form-input" required />
                </div>

                <div class="grid grid-cols-2">
                  <div class="form-group">
                    <label class="form-label">Type</label>
                    <select v-model="formData.type" class="form-select" required>
                      <option value="classroom">Classroom</option>
                      <option value="activity">Activity</option>
                      <option value="sports">Sports</option>
                      <option value="dining">Dining</option>
                      <option value="outdoor">Outdoor</option>
                      <option value="arts">Arts</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Capacity</label>
                    <input v-model.number="formData.capacity" type="number" min="1" class="form-input" required />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Location</label>
                  <input v-model="formData.location" type="text" class="form-input" />
                </div>

                <div class="form-group">
                  <label class="form-label">Equipment (comma-separated)</label>
                  <input v-model="equipmentInput" type="text" class="form-input" placeholder="e.g., Projector, Tables, Chairs" />
                </div>

                <div class="form-group">
                  <label class="form-label">Notes</label>
                  <textarea v-model="formData.notes" class="form-textarea"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button class="btn btn-primary" @click="saveRoom">
                {{ editingRoomId ? 'Update' : 'Add' }} Room
              </button>
            </div>
          </div>
        </div>
      </Teleport>

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
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useCampStore } from '@/stores/campStore';
import type { Room } from '@/types/api';
import FilterBar, { type Filter } from '@/components/FilterBar.vue';
import EventsByDate from '@/components/EventsByDate.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import DataTable from '@/components/DataTable.vue';
import { 
  BookOpen, 
  Target, 
  Dumbbell, 
  Utensils, 
  Trees, 
  Palette, 
  Home,
  MapPin 
} from 'lucide-vue-next';

export default defineComponent({
  name: 'Rooms',
  components: {
    FilterBar,
    EventsByDate,
    ConfirmModal,
    DataTable,
    BookOpen,
    Target,
    Dumbbell,
    Utensils,
    Trees,
    Palette,
    Home,
    MapPin
  },
  data() {
    return {
      selectedRoomId: null as string | null,
      showModal: false,
      editingRoomId: null as string | null,
      showConfirmModal: false,
      confirmAction: null as (() => void) | null,
      equipmentInput: '',
      viewMode: 'grid' as 'grid' | 'table',
      currentPage: 1,
      pageSize: 10,
      formData: {
        name: '',
        type: 'classroom' as Room['type'],
        capacity: 20,
        location: '',
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
    store() {
      return useCampStore();
    },
    roomFilters(): Filter[] {
      return [
        {
          model: 'filterType',
          value: this.filterType,
          placeholder: 'All Types',
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
          placeholder: 'All Capacities',
          options: [
            { label: 'Small (< 15)', value: 'small' },
            { label: 'Medium (15-30)', value: 'medium' },
            { label: 'Large (> 30)', value: 'large' },
          ],
        },
      ];
    },
    selectedRoom() {
      if (!this.selectedRoomId) return null;
      return this.store.getRoomById(this.selectedRoomId);
    },
    filteredRooms() {
      let rooms = this.store.rooms;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        rooms = rooms.filter(room =>
          room.name.toLowerCase().includes(query) ||
          (room.location && room.location.toLowerCase().includes(query))
        );
      }

      // Type filter
      if (this.filterType) {
        rooms = rooms.filter(room => room.type === this.filterType);
      }

      // Capacity filter
      if (this.filterCapacity) {
        rooms = rooms.filter(room => {
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
        location: this.selectedRoom.location || '',
        equipment: this.selectedRoom.equipment || [],
        notes: this.selectedRoom.notes || '',
      };
      this.equipmentInput = (this.selectedRoom.equipment || []).join(', ');
      
      this.selectedRoomId = null;
      this.showModal = true;
    },
    async saveRoom() {
      const equipment = this.equipmentInput
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);

      const roomData: Room = {
        id: this.editingRoomId || `room-${Date.now()}`,
        name: this.formData.name,
        type: this.formData.type,
        capacity: this.formData.capacity,
        location: this.formData.location,
        equipment,
        notes: this.formData.notes,
      };

      if (this.editingRoomId) {
        await this.store.updateRoom(roomData);
      } else {
        await this.store.addRoom(roomData);
      }

      this.closeModal();
    },
    deleteRoomConfirm() {
      if (!this.selectedRoomId) return;
      this.confirmAction = async () => {
        if (this.selectedRoomId) {
          await this.store.deleteRoom(this.selectedRoomId);
          this.selectedRoomId = null;
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
        location: '',
        equipment: [],
        notes: '',
      };
      this.equipmentInput = '';
    }
  }
});
</script>


<style scoped>
.rooms-view {
  max-width: 1400px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 2px;
  background: var(--background);
}

.view-toggle .btn {
  padding: 0.5rem;
  border-radius: calc(var(--radius) - 2px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.room-card {
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  gap: 1rem;
}

.room-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.room-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.room-details {
  flex: 1;
  min-width: 0;
}

.room-details h4 {
  margin-bottom: 0.5rem;
}

.room-type {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.usage-bar {
  height: 8px;
  background: var(--border-color);
  border-radius: 999px;
  overflow: hidden;
}

.usage-fill {
  height: 100%;
  transition: width 0.3s, background 0.3s;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-item {
  padding: 0.75rem;
  background: var(--background);
  border-radius: var(--radius);
  border-left: 4px solid var(--primary-color);
}

.event-item-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

/* Table View Styles */
/* Table cell custom styles */
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
  font-size: 1.25rem;
  flex-shrink: 0;
}

.room-name {
  font-weight: 500;
  color: var(--text-primary);
}

.location-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.badge-sm {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>

