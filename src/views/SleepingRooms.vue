<template>
  <div class="container">
    <div class="sleeping-rooms-view">
      <div class="view-header">
        <h2>🛏️ Sleeping Rooms (Cabins)</h2>
        <div class="header-actions">
          <button class="btn btn-primary" @click="showModal = true">+ Add Sleeping Room</button>
        </div>
      </div>

      <!-- Search and Filters -->
      <FilterBar
        v-model:searchQuery="searchQuery"
        v-model:filterGender="filterGender"
        v-model:filterOccupancy="filterOccupancy"
        :filters="sleepingRoomFilters"
        :filtered-count="filteredRooms.length"
        :total-count="store.sleepingRooms.length"
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
          <div class="room-icon" :style="{ background: getGenderColor(room.gender) }">
            {{ getGenderIcon(room.gender) }}
          </div>
          <div class="room-details">
            <h4>{{ room.name }}</h4>
            <div class="room-meta">
              <span class="badge badge-primary">{{ formatGender(room.gender) }}</span>
              <span class="badge badge-success">{{ getAssignedCount(room.id) }}/{{ room.capacity }} beds</span>
            </div>
            <div v-if="room.building" class="room-location text-sm text-secondary mt-1">
              🏠 {{ room.building }}{{ room.floor ? ` - Floor ${room.floor}` : '' }}
            </div>
            <div class="room-usage mt-2">
              <div class="usage-bar">
                <div 
                  class="usage-fill"
                  :style="{ 
                    width: `${getRoomOccupancy(room.id)}%`,
                    background: getRoomOccupancy(room.id) >= 100 ? 'var(--error-color)' : 'var(--success-color)'
                  }"
                ></div>
              </div>
              <div class="text-xs text-secondary mt-1">
                {{ getRoomOccupancy(room.id).toFixed(0) }}% occupied
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-if="viewMode === 'table'" class="cabins-table-container">
        <table class="cabins-table">
          <thead>
            <tr>
              <th>Cabin Name</th>
              <th>Gender</th>
              <th>Occupancy</th>
              <th>Location</th>
              <th>Supervisor</th>
              <th>Amenities</th>
              <th>Usage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="room in filteredRooms"
              :key="room.id"
              class="table-row"
            >
              <td class="cabin-name-cell">
                <div class="cabin-name-content">
                  <div class="cabin-icon-sm" :style="{ background: getGenderColor(room.gender) }">
                    {{ getGenderIcon(room.gender) }}
                  </div>
                  <div class="cabin-name">{{ room.name }}</div>
                </div>
              </td>
              <td>
                <span class="badge badge-primary badge-sm">{{ formatGender(room.gender) }}</span>
              </td>
              <td>
                <span class="occupancy-badge">{{ getAssignedCount(room.id) }}/{{ room.capacity }}</span>
              </td>
              <td class="location-cell">
                {{ room.building || '—' }}{{ room.floor ? `, Floor ${room.floor}` : '' }}
              </td>
              <td>
                <span v-if="room.supervisorId">{{ getSupervisorName(room.supervisorId) }}</span>
                <span v-else class="text-secondary">—</span>
              </td>
              <td>
                <span v-if="room.amenities && room.amenities.length > 0" class="badge badge-success badge-sm">
                  {{ room.amenities.length }} item(s)
                </span>
                <span v-else class="text-secondary">None</span>
              </td>
              <td>
                <div class="usage-indicator">
                  <div class="usage-bar-sm">
                    <div 
                      class="usage-fill-sm"
                      :style="{ 
                        width: `${getRoomOccupancy(room.id)}%`,
                        background: getRoomOccupancy(room.id) >= 100 ? 'var(--error-color)' : 'var(--success-color)'
                      }"
                    ></div>
                  </div>
                  <span class="usage-text">{{ getRoomOccupancy(room.id).toFixed(0) }}%</span>
                </div>
              </td>
              <td>
                <button class="btn btn-sm btn-secondary" @click="selectRoom(room.id)">
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
                  <div class="detail-label">Gender</div>
                  <div>
                    <span class="badge badge-primary">{{ formatGender(selectedRoom.gender) }}</span>
                  </div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">Capacity</div>
                  <div>{{ getAssignedCount(selectedRoom.id) }}/{{ selectedRoom.capacity }} beds occupied</div>
                </div>

                <div v-if="selectedRoom.building" class="detail-section">
                  <div class="detail-label">Location</div>
                  <div>{{ selectedRoom.building }}{{ selectedRoom.floor ? `, Floor ${selectedRoom.floor}` : '' }}</div>
                </div>

                <div v-if="selectedRoom.supervisorId" class="detail-section">
                  <div class="detail-label">Supervisor</div>
                  <div>{{ getSupervisorName(selectedRoom.supervisorId) }}</div>
                </div>

                <div v-if="selectedRoom.amenities && selectedRoom.amenities.length > 0" class="detail-section">
                  <div class="detail-label">Amenities</div>
                  <div class="flex gap-1 flex-wrap">
                    <span v-for="item in selectedRoom.amenities" :key="item" class="badge badge-success">
                      {{ item }}
                    </span>
                  </div>
                </div>

                <div v-if="selectedRoom.notes" class="detail-section">
                  <div class="detail-label">Notes</div>
                  <div>{{ selectedRoom.notes }}</div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">Assigned Campers</div>
                  <div v-if="getRoomCampers(selectedRoom.id).length > 0" class="campers-list">
                    <div 
                      v-for="camper in getRoomCampers(selectedRoom.id)"
                      :key="camper.id"
                      class="camper-item"
                    >
                      <div class="camper-info">
                        <div class="font-medium">
                          {{ camper.firstName }} {{ camper.lastName }}
                        </div>
                        <div class="text-xs text-secondary">Age {{ camper.age }}</div>
                      </div>
                      <button 
                        class="btn btn-sm btn-secondary"
                        @click="unassignCamper(camper.id)"
                      >
                        Unassign
                      </button>
                    </div>
                  </div>
                  <div v-else class="text-secondary">No campers assigned</div>
                </div>

                <!-- Assign campers -->
                <div v-if="getAssignedCount(selectedRoom.id) < selectedRoom.capacity" class="detail-section">
                  <div class="detail-label">Assign Camper</div>
                  <select v-model="camperToAssign" class="form-select" @change="assignCamper">
                    <option value="">Select a camper...</option>
                    <option 
                      v-for="camper in getUnassignedCampers(selectedRoom.gender)"
                      :key="camper.id"
                      :value="camper.id"
                    >
                      {{ camper.firstName }} {{ camper.lastName }} (Age {{ camper.age }})
                    </option>
                  </select>
                </div>
                <div v-else class="detail-section">
                  <div class="badge badge-error">Room is at full capacity</div>
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
              <h3>{{ editingRoomId ? 'Edit Sleeping Room' : 'Add New Sleeping Room' }}</h3>
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
                    <label class="form-label">Gender</label>
                    <select v-model="formData.gender" class="form-select" required>
                      <option value="boys">Boys</option>
                      <option value="girls">Girls</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Capacity (Beds)</label>
                    <input v-model.number="formData.capacity" type="number" min="1" max="20" class="form-input" required />
                  </div>
                </div>

                <div class="grid grid-cols-2">
                  <div class="form-group">
                    <label class="form-label">Building</label>
                    <input v-model="formData.building" type="text" class="form-input" />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Floor</label>
                    <input v-model.number="formData.floor" type="number" min="1" class="form-input" />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Supervisor</label>
                  <select v-model="formData.supervisorId" class="form-select">
                    <option value="">No supervisor assigned</option>
                    <option v-for="member in store.teamMembers" :key="member.id" :value="member.id">
                      {{ member.firstName }} {{ member.lastName }} ({{ member.role }})
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Amenities (comma-separated)</label>
                  <input v-model="amenitiesInput" type="text" class="form-input" placeholder="e.g., Bathroom, Closet, Window" />
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
        :title="confirmModalTitle"
        :message="confirmModalMessage"
        :details="confirmModalDetails"
        confirm-text="Delete"
        :danger-mode="true"
        @confirm="handleConfirmAction"
        @cancel="handleCancelConfirm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCampStore } from '@/stores/campStore';
import type { SleepingRoom } from '@/types/api';
import FilterBar, { type Filter } from '@/components/FilterBar.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';

const store = useCampStore();
const selectedRoomId = ref<string | null>(null);
const showModal = ref(false);
const editingRoomId = ref<string | null>(null);

// Confirm modal state
const showConfirmModal = ref(false);
const confirmModalTitle = ref('');
const confirmModalMessage = ref('');
const confirmModalDetails = ref('');
const confirmAction = ref<(() => void) | null>(null);
const amenitiesInput = ref('');
const camperToAssign = ref('');
const viewMode = ref<'grid' | 'table'>('grid');

const formData = ref<{
  name: string;
  gender: SleepingRoom['gender'];
  capacity: number;
  building: string;
  floor: number | undefined;
  supervisorId: string;
  amenities: string[];
  notes: string;
}>({
  name: '',
  gender: 'boys',
  capacity: 4,
  building: '',
  floor: undefined,
  supervisorId: '',
  amenities: [],
  notes: '',
});

// Filter state
const searchQuery = ref('');
const filterGender = ref('');
const filterOccupancy = ref('');

const sleepingRoomFilters = computed<Filter[]>(() => [
  {
    model: 'filterGender',
    value: filterGender.value,
    placeholder: 'All Genders',
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
    ],
  },
  {
    model: 'filterOccupancy',
    value: filterOccupancy.value,
    placeholder: 'All Occupancy',
    options: [
      { label: 'Available (< 100%)', value: 'available' },
      { label: 'Full (100%)', value: 'full' },
    ],
  },
]);

const selectedRoom = computed(() => {
  if (!selectedRoomId.value) return null;
  return store.getSleepingRoomById(selectedRoomId.value);
});

const filteredRooms = computed(() => {
  let rooms = store.sleepingRooms;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    rooms = rooms.filter(room =>
      room.name.toLowerCase().includes(query) ||
      (room.building && room.building.toLowerCase().includes(query))
    );
  }

  // Gender filter
  if (filterGender.value) {
    // Map "male" to "boys" and "female" to "girls"
    const genderMap: Record<string, SleepingRoom['gender']> = {
      'male': 'boys',
      'female': 'girls'
    };
    const mappedGender = genderMap[filterGender.value];
    if (mappedGender) {
      rooms = rooms.filter(room => room.gender === mappedGender);
    }
  }

  // Occupancy filter
  if (filterOccupancy.value) {
    rooms = rooms.filter(room => {
      const occupancy = getRoomOccupancy(room.id);
      if (filterOccupancy.value === 'available') return occupancy < 100;
      if (filterOccupancy.value === 'full') return occupancy >= 100;
      return true;
    });
  }

  return rooms;
});

const clearFilters = () => {
  searchQuery.value = '';
  filterGender.value = '';
  filterOccupancy.value = '';
};

const formatGender = (gender: string) => {
  return gender.charAt(0).toUpperCase() + gender.slice(1);
};

const getGenderIcon = (gender: SleepingRoom['gender']) => {
  const icons: Record<SleepingRoom['gender'], string> = {
    boys: '👦',
    girls: '👧',
    mixed: '👫',
  };
  return icons[gender] || '🛏️';
};

const getGenderColor = (gender: SleepingRoom['gender']) => {
  const colors: Record<SleepingRoom['gender'], string> = {
    boys: '#3B82F6',
    girls: '#EC4899',
    mixed: '#8B5CF6',
  };
  return colors[gender] || '#64748B';
};

const getRoomCampers = (roomId: string) => {
  return store.campers.filter(camper => camper.sleepingRoomId === roomId);
};

const getAssignedCount = (roomId: string) => {
  return getRoomCampers(roomId).length;
};

const getRoomOccupancy = (roomId: string) => {
  const room = store.getSleepingRoomById(roomId);
  if (!room) return 0;
  return (getAssignedCount(roomId) / room.capacity) * 100;
};

const getSupervisorName = (staffId: string) => {
  const staff = store.getTeamMemberById(staffId);
  return staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown';
};

const getUnassignedCampers = (gender: SleepingRoom['gender']) => {
  return store.campers.filter(camper => {
    // Not assigned to any room
    if (camper.sleepingRoomId) return false;
    
    // Gender restriction (mixed rooms accept all)
    if (gender === 'mixed') return true;
    
    // Simple age-based gender assumption (in real app, would have gender field)
    // For demo, we'll allow all unassigned campers
    return true;
  });
};

const selectRoom = (roomId: string) => {
  selectedRoomId.value = roomId;
  camperToAssign.value = '';
};

const assignCamper = async () => {
  if (!camperToAssign.value || !selectedRoomId.value) return;
  
  const camper = store.getCamperById(camperToAssign.value);
  if (!camper) return;
  
  camper.sleepingRoomId = selectedRoomId.value;
  await store.updateCamper(camper);
  camperToAssign.value = '';
};

const unassignCamper = async (camperId: string) => {
  const camper = store.getCamperById(camperId);
  if (!camper) return;
  
  camper.sleepingRoomId = undefined;
  await store.updateCamper(camper);
};

const editRoom = () => {
  if (!selectedRoom.value) return;
  
  editingRoomId.value = selectedRoom.value.id;
  formData.value = {
    name: selectedRoom.value.name,
    gender: selectedRoom.value.gender,
    capacity: selectedRoom.value.capacity,
    building: selectedRoom.value.building || '',
    floor: selectedRoom.value.floor,
    supervisorId: selectedRoom.value.supervisorId || '',
    amenities: selectedRoom.value.amenities || [],
    notes: selectedRoom.value.notes || '',
  };
  amenitiesInput.value = (selectedRoom.value.amenities || []).join(', ');
  
  selectedRoomId.value = null;
  showModal.value = true;
};

const saveRoom = async () => {
  const amenities = amenitiesInput.value
    .split(',')
    .map(a => a.trim())
    .filter(a => a.length > 0);

  const roomData: SleepingRoom = {
    id: editingRoomId.value || `sleeping-${Date.now()}`,
    name: formData.value.name,
    gender: formData.value.gender,
    capacity: formData.value.capacity,
    building: formData.value.building,
    floor: formData.value.floor,
    supervisorId: formData.value.supervisorId || undefined,
    amenities,
    notes: formData.value.notes,
  };

  if (editingRoomId.value) {
    await store.updateSleepingRoom(roomData);
  } else {
    await store.addSleepingRoom(roomData);
  }

  closeModal();
};

const deleteRoomConfirm = () => {
  if (!selectedRoomId.value) return;
  
  const camperCount = getAssignedCount(selectedRoomId.value);
  
  // Setup the confirm modal
  confirmModalTitle.value = 'Delete Sleeping Room';
  confirmModalMessage.value = 'Are you sure you want to delete this sleeping room?';
  confirmModalDetails.value = camperCount > 0 
    ? `This room has ${camperCount} campers assigned. They will be unassigned.`
    : '';
  
  confirmAction.value = async () => {
    if (selectedRoomId.value) {
      await store.deleteSleepingRoom(selectedRoomId.value);
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
    gender: 'boys',
    capacity: 4,
    building: '',
    floor: undefined,
    supervisorId: '',
    amenities: [],
    notes: '',
  };
  amenitiesInput.value = '';
};
</script>

<style scoped>
.sleeping-rooms-view {
  max-width: 1400px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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

.room-meta {
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

.campers-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.camper-item {
  padding: 0.75rem;
  background: var(--background);
  border-radius: var(--radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Table View Styles */
.cabins-table-container {
  background: var(--card-background);
  border-radius: var(--radius);
  overflow-x: auto;
  box-shadow: var(--shadow);
}

.cabins-table {
  width: 100%;
  border-collapse: collapse;
}

.cabins-table thead {
  background: var(--background);
  border-bottom: 2px solid var(--border-color);
}

.cabins-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.cabins-table tbody tr {
  border-bottom: 1px solid var(--border-color);
  transition: all 0.15s ease;
}

.cabins-table tbody tr:hover {
  background: var(--background);
}

.cabins-table td {
  padding: 1rem;
  font-size: 0.875rem;
}

.cabin-name-cell {
  min-width: 200px;
}

.cabin-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cabin-icon-sm {
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

.cabin-name {
  font-weight: 500;
  color: var(--text-primary);
}

.location-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.occupancy-badge {
  display: inline-flex;
  padding: 0.25rem 0.5rem;
  background: var(--background);
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 600;
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

.badge-sm {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>

