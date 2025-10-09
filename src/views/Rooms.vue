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

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCampStore } from '@/stores/campStore';
import type { Room } from '@/types/api';
import FilterBar, { type Filter } from '@/components/FilterBar.vue';
import EventsByDate from '@/components/EventsByDate.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import DataTable, { type Column } from '@/components/DataTable.vue';
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

const store = useCampStore();
const selectedRoomId = ref<string | null>(null);
const showModal = ref(false);
const editingRoomId = ref<string | null>(null);

// Confirm modal state
const showConfirmModal = ref(false);
const confirmAction = ref<(() => void) | null>(null);
const equipmentInput = ref('');
const viewMode = ref<'grid' | 'table'>('grid');

// Pagination state
const currentPage = ref(1);
const pageSize = ref(10);

const formData = ref<{
  name: string;
  type: Room['type'];
  capacity: number;
  location: string;
  equipment: string[];
  notes: string;
}>({
  name: '',
  type: 'classroom',
  capacity: 20,
  location: '',
  equipment: [],
  notes: '',
});

// Filter state
const searchQuery = ref('');
const filterType = ref('');
const filterCapacity = ref('');

const roomFilters = computed<Filter[]>(() => [
  {
    model: 'filterType',
    value: filterType.value,
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
    value: filterCapacity.value,
    placeholder: 'All Capacities',
    options: [
      { label: 'Small (< 15)', value: 'small' },
      { label: 'Medium (15-30)', value: 'medium' },
      { label: 'Large (> 30)', value: 'large' },
    ],
  },
]);

const selectedRoom = computed(() => {
  if (!selectedRoomId.value) return null;
  return store.getRoomById(selectedRoomId.value);
});

const roomColumns: Column[] = [
  { key: 'name', label: 'Room Name', width: '200px' },
  { key: 'type', label: 'Type', width: '120px' },
  { key: 'capacity', label: 'Capacity', width: '100px' },
  { key: 'location', label: 'Location', width: '180px' },
  { key: 'equipment', label: 'Equipment', width: '120px' },
  { key: 'usage', label: 'Usage', width: '140px' },
  { key: 'events', label: 'Events', width: '100px' },
  { key: 'actions', label: 'Actions', width: '140px' },
];

const filteredRooms = computed(() => {
  let rooms = store.rooms;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    rooms = rooms.filter(room =>
      room.name.toLowerCase().includes(query) ||
      (room.location && room.location.toLowerCase().includes(query))
    );
  }

  // Type filter
  if (filterType.value) {
    rooms = rooms.filter(room => room.type === filterType.value);
  }

  // Capacity filter
  if (filterCapacity.value) {
    rooms = rooms.filter(room => {
      if (filterCapacity.value === 'small') return room.capacity < 15;
      if (filterCapacity.value === 'medium') return room.capacity >= 15 && room.capacity <= 30;
      if (filterCapacity.value === 'large') return room.capacity > 30;
      return true;
    });
  }

  return rooms;
});

// Reset to page 1 when filters change
watch([searchQuery, filterType, filterCapacity], () => {
  currentPage.value = 1;
});

const clearFilters = () => {
  searchQuery.value = '';
  filterType.value = '';
  filterCapacity.value = '';
};

const formatRoomType = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const RoomTypeIcon = (type: Room['type']) => {
  const iconMap: Record<Room['type'], any> = {
    classroom: BookOpen,
    activity: Target,
    sports: Dumbbell,
    dining: Utensils,
    outdoor: Trees,
    arts: Palette,
  };
  return iconMap[type] || Home;
};

const getRoomTypeColor = (type: Room['type']) => {
  const colors: Record<Room['type'], string> = {
    classroom: '#2196F3',
    activity: '#4CAF50',
    sports: '#FF9800',
    dining: '#795548',
    outdoor: '#8BC34A',
    arts: '#9C27B0',
  };
  return colors[type] || '#757575';
};

const getRoomEvents = (roomId: string) => {
  return store.roomEvents(roomId);
};

const getRoomUsage = (roomId: string) => {
  const roomEvents = store.roomEvents(roomId);
  if (roomEvents.length === 0) return 0;
  
  const room = store.getRoomById(roomId);
  if (!room) return 0;
  
  // Calculate average capacity usage
  const totalUsage = roomEvents.reduce((sum, event) => {
    return sum + ((event.enrolledChildrenIds?.length || 0) / room.capacity) * 100;
  }, 0);
  
  return totalUsage / roomEvents.length;
};

const selectRoom = (roomId: string) => {
  selectedRoomId.value = roomId;
};

const editRoom = () => {
  if (!selectedRoom.value) return;
  
  editingRoomId.value = selectedRoom.value.id;
  formData.value = {
    name: selectedRoom.value.name,
    type: selectedRoom.value.type,
    capacity: selectedRoom.value.capacity,
    location: selectedRoom.value.location || '',
    equipment: selectedRoom.value.equipment || [],
    notes: selectedRoom.value.notes || '',
  };
  equipmentInput.value = (selectedRoom.value.equipment || []).join(', ');
  
  selectedRoomId.value = null;
  showModal.value = true;
};

const saveRoom = async () => {
  const equipment = equipmentInput.value
    .split(',')
    .map(e => e.trim())
    .filter(e => e.length > 0);

  const roomData: Room = {
    id: editingRoomId.value || `room-${Date.now()}`,
    name: formData.value.name,
    type: formData.value.type,
    capacity: formData.value.capacity,
    location: formData.value.location,
    equipment,
    notes: formData.value.notes,
  };

  if (editingRoomId.value) {
    await store.updateRoom(roomData);
  } else {
    await store.addRoom(roomData);
  }

  closeModal();
};

const deleteRoomConfirm = () => {
  if (!selectedRoomId.value) return;
  confirmAction.value = async () => {
    if (selectedRoomId.value) {
      await store.deleteRoom(selectedRoomId.value);
      selectedRoomId.value = null;
    }
  };
  showConfirmModal.value = true;
};

const handleConfirmAction = async () => {
  if (confirmAction.value) {
    await confirmAction.value();
  }
  showConfirmModal.value = false;
  confirmAction.value = null;
};

const handleCancelConfirm = () => {
  showConfirmModal.value = false;
  confirmAction.value = null;
};

const closeModal = () => {
  showModal.value = false;
  editingRoomId.value = null;
  formData.value = {
    name: '',
    type: 'classroom',
    capacity: 20,
    location: '',
    equipment: [],
    notes: '',
  };
  equipmentInput.value = '';
};
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

