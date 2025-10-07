<template>
  <div class="container">
    <div class="children-view">
      <div class="view-header">
        <h2>Children Management</h2>
        <div class="header-actions">
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
          <button class="btn btn-primary" @click="showModal = true">+ Add Child</button>
        </div>
      </div>

      <!-- Search and Filters -->
      <FilterBar
        v-model:searchQuery="searchQuery"
        v-model:filterGender="filterGender"
        v-model:filterAge="filterAge"
        v-model:filterSleepingRoom="filterSleepingRoom"
        :filters="childrenFilters"
        :filtered-count="filteredChildren.length"
        :total-count="store.children.length"
        @clear="clearFilters"
      />

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="children-grid">
        <div 
          v-for="child in filteredChildren"
          :key="child.id"
          class="child-card card"
          @click="selectChild(child.id)"
        >
          <div class="child-avatar">
            {{ child.firstName.charAt(0) }}{{ child.lastName.charAt(0) }}
          </div>
          <div class="child-details">
            <h4>{{ child.firstName }} {{ child.lastName }}</h4>
            <div class="child-meta">
              <span class="badge badge-primary">Age {{ child.age }}</span>
              <span class="badge badge-primary">{{ formatGender(child.gender) }}</span>
              <span v-if="child.allergies && child.allergies.length > 0" class="badge badge-warning">
                {{ child.allergies.length }} Allergy(ies)
              </span>
            </div>
            <div class="child-contact text-sm text-secondary mt-1">
              {{ child.parentContact }}
            </div>
            <div class="child-events text-sm mt-2">
              <strong>Today's Events:</strong> {{ getChildTodayEvents(child.id).length }}
            </div>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-if="viewMode === 'table'" class="children-table-container">
        <table class="children-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Cabin</th>
              <th>Parent Contact</th>
              <th>Allergies</th>
              <th>Today's Events</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="child in filteredChildren"
              :key="child.id"
              class="table-row"
            >
              <td class="child-name-cell">
                <div class="child-name-content">
                  <div class="child-avatar-sm">
                    {{ child.firstName.charAt(0) }}{{ child.lastName.charAt(0) }}
                  </div>
                  <div>
                    <div class="child-fullname">{{ child.firstName }} {{ child.lastName }}</div>
                  </div>
                </div>
              </td>
              <td>{{ child.age }}</td>
              <td>
                <span class="badge badge-primary badge-sm">{{ formatGender(child.gender) }}</span>
              </td>
              <td>
                <span v-if="child.sleepingRoomId" class="badge badge-primary badge-sm">
                  {{ getSleepingRoomName(child.sleepingRoomId) }}
                </span>
                <span v-else class="text-secondary">—</span>
              </td>
              <td class="contact-cell">{{ child.parentContact }}</td>
              <td>
                <span v-if="child.allergies && child.allergies.length > 0" class="badge badge-warning badge-sm">
                  {{ child.allergies.length }} allergy(ies)
                </span>
                <span v-else class="text-secondary">None</span>
              </td>
              <td>
                <span class="event-count">{{ getChildTodayEvents(child.id).length }}</span>
              </td>
              <td>
                <button class="btn btn-sm btn-secondary" @click="selectChild(child.id)">
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Child Detail Modal -->
      <Teleport to="body">
        <div v-if="selectedChildId" class="modal-overlay" @click.self="selectedChildId = null">
          <div class="modal">
            <div class="modal-header">
              <h3>{{ selectedChild?.firstName }} {{ selectedChild?.lastName }}</h3>
              <button class="btn btn-icon btn-secondary" @click="selectedChildId = null">✕</button>
            </div>
            <div class="modal-body">
              <div v-if="selectedChild">
                <div class="detail-section">
                  <div class="detail-label">Age</div>
                  <div>{{ selectedChild.age }} years old</div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">Parent Contact</div>
                  <div>{{ selectedChild.parentContact }}</div>
                </div>

                <div v-if="selectedChild.allergies && selectedChild.allergies.length > 0" class="detail-section">
                  <div class="detail-label">Allergies</div>
                  <div class="flex gap-1 flex-wrap">
                    <span v-for="allergy in selectedChild.allergies" :key="allergy" class="badge badge-warning">
                      {{ allergy }}
                    </span>
                  </div>
                </div>

                <div v-if="selectedChild.medicalNotes" class="detail-section">
                  <div class="detail-label">Medical Notes</div>
                  <div>{{ selectedChild.medicalNotes }}</div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">Gender</div>
                  <div>
                    <span class="badge badge-primary">{{ formatGender(selectedChild.gender) }}</span>
                  </div>
                </div>

                <div v-if="selectedChild.registrationDate" class="detail-section">
                  <div class="detail-label">Registration Date</div>
                  <div>{{ formatDate(selectedChild.registrationDate) }}</div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">Sleeping Room Assignment</div>
                  <div v-if="selectedChild.sleepingRoomId">
                    <span class="badge badge-primary">{{ getSleepingRoomName(selectedChild.sleepingRoomId) }}</span>
                  </div>
                  <div v-else class="text-secondary">Not assigned to a cabin</div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">Enrolled Events</div>
                  <div v-if="getChildEvents(selectedChild.id).length > 0" class="events-list">
                    <div 
                      v-for="event in getChildEvents(selectedChild.id)"
                      :key="event.id"
                      class="event-item"
                      :style="{ borderLeftColor: event.color || '#2196F3' }"
                    >
                      <div class="event-item-title">{{ event.title }}</div>
                      <div class="event-item-time text-xs text-secondary">
                        {{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-secondary">No events enrolled</div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-error" @click="deleteChildConfirm">Delete Child</button>
              <button class="btn btn-secondary" @click="editChild">Edit</button>
              <button class="btn btn-secondary" @click="selectedChildId = null">Close</button>
            </div>
          </div>
        </div>

        <!-- Add/Edit Child Modal -->
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal">
            <div class="modal-header">
              <h3>{{ editingChildId ? 'Edit Child' : 'Add New Child' }}</h3>
              <button class="btn btn-icon btn-secondary" @click="closeModal">✕</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveChild">
                <div class="grid grid-cols-2">
                  <div class="form-group">
                    <label class="form-label">First Name</label>
                    <input v-model="formData.firstName" type="text" class="form-input" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Last Name</label>
                    <input v-model="formData.lastName" type="text" class="form-input" required />
                  </div>
                </div>

                <div class="grid grid-cols-2">
                  <div class="form-group">
                    <label class="form-label">Age</label>
                    <input v-model.number="formData.age" type="number" min="5" max="18" class="form-input" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Gender</label>
                    <select v-model="formData.gender" class="form-select" required>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Parent Contact (Email/Phone)</label>
                  <input v-model="formData.parentContact" type="text" class="form-input" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Allergies (comma-separated)</label>
                  <input v-model="allergiesInput" type="text" class="form-input" placeholder="e.g., Peanuts, Dairy" />
                </div>

                <div class="form-group">
                  <label class="form-label">Medical Notes</label>
                  <textarea v-model="formData.medicalNotes" class="form-textarea"></textarea>
                </div>

                <div class="form-group">
                  <label class="form-label">Sleeping Room (Cabin)</label>
                  <select v-model="formData.sleepingRoomId" class="form-select">
                    <option value="">Not assigned</option>
                    <option 
                      v-for="room in getAvailableSleepingRooms(formData.gender)" 
                      :key="room.id" 
                      :value="room.id"
                    >
                      {{ room.name }} ({{ formatRoomGender(room.gender) }})
                    </option>
                  </select>
                  <div v-if="formData.gender && getAvailableSleepingRooms(formData.gender).length === 0" class="text-xs text-secondary mt-1">
                    No cabins available for {{ formData.gender === 'male' ? 'boys' : 'girls' }}
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button class="btn btn-primary" @click="saveChild">
                {{ editingChildId ? 'Update' : 'Add' }} Child
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Confirmation Modal -->
      <ConfirmModal
        :show="showConfirmModal"
        title="Delete Child"
        :message="`Are you sure you want to delete ${childToDelete?.name}?`"
        details="This action cannot be undone. The child will be removed from all events and their sleeping room assignment."
        confirm-text="Delete"
        :danger-mode="true"
        @confirm="handleConfirmDelete"
        @cancel="handleCancelDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCampStore } from '@/stores/campStore';
import { format } from 'date-fns';
import type { Child } from '@/types/api';
import ConfirmModal from '@/components/ConfirmModal.vue';
import FilterBar, { type Filter } from '@/components/FilterBar.vue';

const store = useCampStore();
const selectedChildId = ref<string | null>(null);
const showModal = ref(false);
const editingChildId = ref<string | null>(null);
const allergiesInput = ref('');
const viewMode = ref<'grid' | 'table'>('grid');

// Confirmation modal state
const showConfirmModal = ref(false);
const childToDelete = ref<{ id: string; name: string } | null>(null);

const formData = ref<{
  firstName: string;
  lastName: string;
  age: number;
  gender: 'male' | 'female';
  parentContact: string;
  allergies: string[];
  medicalNotes: string;
  sleepingRoomId: string;
}>({
  firstName: '',
  lastName: '',
  age: 8,
  gender: 'male',
  parentContact: '',
  allergies: [],
  medicalNotes: '',
  sleepingRoomId: '',
});

// Filter state
const searchQuery = ref('');
const filterGender = ref('');
const filterAge = ref('');
const filterSleepingRoom = ref('');

const childrenFilters = computed<Filter[]>(() => [
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
    model: 'filterAge',
    value: filterAge.value,
    placeholder: 'All Ages',
    options: [
      { label: '6-8 years', value: '6-8' },
      { label: '9-11 years', value: '9-11' },
      { label: '12-14 years', value: '12-14' },
      { label: '15+ years', value: '15+' },
    ],
  },
  {
    model: 'filterSleepingRoom',
    value: filterSleepingRoom.value,
    placeholder: 'All Cabins',
    options: [
      { label: 'Unassigned', value: 'unassigned' },
      ...store.sleepingRooms.map(room => ({
        label: room.name,
        value: room.id,
      })),
    ],
  },
]);

const selectedChild = computed(() => {
  if (!selectedChildId.value) return null;
  return store.getChildById(selectedChildId.value);
});

const filteredChildren = computed(() => {
  let children = store.children;

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    children = children.filter(child =>
      child.firstName.toLowerCase().includes(query) ||
      child.lastName.toLowerCase().includes(query) ||
      `${child.firstName} ${child.lastName}`.toLowerCase().includes(query)
    );
  }

  // Gender filter
  if (filterGender.value) {
    children = children.filter(child => child.gender === filterGender.value);
  }

  // Age filter
  if (filterAge.value) {
    const [min, max] = filterAge.value === '15+' 
      ? [15, 999] 
      : filterAge.value.split('-').map(Number);
    children = children.filter(child => child.age >= min && (max ? child.age <= max : true));
  }

  // Sleeping room filter
  if (filterSleepingRoom.value) {
    if (filterSleepingRoom.value === 'unassigned') {
      children = children.filter(child => !child.sleepingRoomId);
    } else {
      children = children.filter(child => child.sleepingRoomId === filterSleepingRoom.value);
    }
  }

  return children;
});

const clearFilters = () => {
  searchQuery.value = '';
  filterGender.value = '';
  filterAge.value = '';
  filterSleepingRoom.value = '';
};

const getChildTodayEvents = (childId: string) => {
  const today = new Date();
  return store.childEvents(childId).filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate.toDateString() === today.toDateString();
  });
};

const getChildEvents = (childId: string) => {
  return store.childEvents(childId);
};

const formatDate = (dateStr: string) => {
  return format(new Date(dateStr), 'MMMM d, yyyy');
};

const formatTime = (dateStr: string) => {
  return format(new Date(dateStr), 'h:mm a');
};

const getSleepingRoomName = (roomId: string) => {
  const room = store.getSleepingRoomById(roomId);
  return room?.name || 'Unknown Room';
};

const formatGender = (gender: string) => {
  return gender.charAt(0).toUpperCase() + gender.slice(1);
};

const formatRoomGender = (gender: string) => {
  return gender.charAt(0).toUpperCase() + gender.slice(1);
};

const getAvailableSleepingRooms = (childGender: 'male' | 'female') => {
  return store.sleepingRooms.filter(room => {
    // Mixed rooms accept all
    if (room.gender === 'mixed') return true;
    
    // Match room gender with child gender
    if (childGender === 'male' && room.gender === 'boys') return true;
    if (childGender === 'female' && room.gender === 'girls') return true;
    
    return false;
  });
};

const selectChild = (childId: string) => {
  selectedChildId.value = childId;
};

const editChild = () => {
  if (!selectedChild.value) return;
  
  editingChildId.value = selectedChild.value.id;
  formData.value = {
    firstName: selectedChild.value.firstName,
    lastName: selectedChild.value.lastName,
    age: selectedChild.value.age,
    gender: selectedChild.value.gender,
    parentContact: selectedChild.value.parentContact,
    allergies: selectedChild.value.allergies || [],
    medicalNotes: selectedChild.value.medicalNotes || '',
    sleepingRoomId: selectedChild.value.sleepingRoomId || '',
  };
  allergiesInput.value = (selectedChild.value.allergies || []).join(', ');
  
  selectedChildId.value = null;
  showModal.value = true;
};

const saveChild = async () => {
  const allergies = allergiesInput.value
    .split(',')
    .map(a => a.trim())
    .filter(a => a.length > 0);

  const childData: Child = {
    id: editingChildId.value || `child-${Date.now()}`,
    firstName: formData.value.firstName,
    lastName: formData.value.lastName,
    age: formData.value.age,
    gender: formData.value.gender,
    parentContact: formData.value.parentContact,
    allergies,
    medicalNotes: formData.value.medicalNotes,
    sleepingRoomId: formData.value.sleepingRoomId || undefined,
    registrationDate: editingChildId.value 
      ? store.getChildById(editingChildId.value)?.registrationDate 
      : new Date().toISOString(),
  };

  if (editingChildId.value) {
    await store.updateChild(childData);
  } else {
    await store.addChild(childData);
  }

  closeModal();
};

const deleteChildConfirm = () => {
  if (!selectedChildId.value) return;
  const child = store.getChildById(selectedChildId.value);
  if (!child) return;
  
  childToDelete.value = {
    id: selectedChildId.value,
    name: `${child.firstName} ${child.lastName}`
  };
  showConfirmModal.value = true;
};

const handleConfirmDelete = async () => {
  if (!childToDelete.value) return;
  
  await store.deleteChild(childToDelete.value.id);
  selectedChildId.value = null;
  showConfirmModal.value = false;
  childToDelete.value = null;
};

const handleCancelDelete = () => {
  showConfirmModal.value = false;
  childToDelete.value = null;
};

const closeModal = () => {
  showModal.value = false;
  editingChildId.value = null;
  formData.value = {
    firstName: '',
    lastName: '',
    age: 8,
    gender: 'male',
    parentContact: '',
    allergies: [],
    medicalNotes: '',
    sleepingRoomId: '',
  };
  allergiesInput.value = '';
};
</script>

<style scoped>
.children-view {
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

.children-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.child-card {
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  gap: 1rem;
}

.child-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.child-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  flex-shrink: 0;
}

.child-details {
  flex: 1;
  min-width: 0;
}

.child-details h4 {
  margin-bottom: 0.5rem;
}

.child-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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
.children-table-container {
  background: var(--card-background);
  border-radius: var(--radius);
  overflow-x: auto;
  box-shadow: var(--shadow);
}

.children-table {
  width: 100%;
  border-collapse: collapse;
}

.children-table thead {
  background: var(--background);
  border-bottom: 2px solid var(--border-color);
}

.children-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.children-table tbody tr {
  border-bottom: 1px solid var(--border-color);
  transition: all 0.15s ease;
}

.children-table tbody tr:hover {
  background: var(--background);
}

.children-table td {
  padding: 1rem;
  font-size: 0.875rem;
}

.child-name-cell {
  min-width: 200px;
}

.child-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.child-avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.child-fullname {
  font-weight: 500;
  color: var(--text-primary);
}

.contact-cell {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
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

