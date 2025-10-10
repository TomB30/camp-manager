<template>
  <div class="container">
    <div class="sleeping-rooms-view">
      <div class="view-header">
        <h2>Sleeping Rooms (Cabins)</h2>
        <div class="header-actions">
          <button class="btn btn-primary" @click="showModal = true">+ Add Sleeping Room</button>
        </div>
      </div>

      <!-- Search and Filters -->
      <FilterBar
        v-model:searchQuery="searchQuery"
        :filters="[]"
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
          <div class="room-icon">
            <Bed :size="32" :stroke-width="2" />
          </div>
          <div class="room-details">
            <h4>{{ room.name }}</h4>
            <div class="room-meta">
              <span class="badge badge-primary">{{ room.beds }} beds</span>
              <span v-if="room.location" class="text-sm text-secondary">
                <MapPin :size="14" class="inline" />
                {{ room.location }}
              </span>
            </div>
            <div v-if="getFamilyGroupsForRoom(room.id).length > 0" class="assigned-groups mt-2">
              <div class="text-xs text-secondary mb-1">Family Groups:</div>
              <div class="flex gap-1 flex-wrap">
                <span 
                  v-for="familyGroup in getFamilyGroupsForRoom(room.id)" 
                  :key="familyGroup.id" 
                  class="badge badge-success badge-sm"
                >
                  {{ familyGroup.name }}
                </span>
              </div>
            </div>
            <div v-else class="text-xs text-secondary mt-2">No family groups assigned</div>
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
          <div class="cabin-name-content">
            <div class="cabin-icon-sm">
              <Bed :size="18" :stroke-width="2" />
            </div>
            <div class="cabin-name">{{ item.name }}</div>
          </div>
        </template>
        
        <template #cell-beds="{ item }">
          <span class="badge badge-primary badge-sm">{{ item.beds }} beds</span>
        </template>
        
        <template #cell-location="{ item }">
          {{ item.location || '—' }}
        </template>
        
        <template #cell-groups="{ item }">
          <div v-if="getFamilyGroupsForRoom(item.id).length > 0" class="flex gap-1 flex-wrap">
            <span 
              v-for="familyGroup in getFamilyGroupsForRoom(item.id)" 
              :key="familyGroup.id" 
              class="badge badge-success badge-sm"
            >
              {{ familyGroup.name }}
            </span>
          </div>
          <span v-else class="text-secondary">None</span>
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
          <div class="modal modal-lg">
            <div class="modal-header">
              <h3>{{ selectedRoom?.name }}</h3>
              <button class="btn btn-icon btn-secondary" @click="selectedRoomId = null">✕</button>
            </div>
            <div class="modal-body">
              <div v-if="selectedRoom">
                <div class="detail-section">
                  <div class="detail-label">Beds</div>
                  <div>
                    <span class="badge badge-primary">{{ selectedRoom.beds }} beds</span>
                  </div>
                </div>

                <div v-if="selectedRoom.location" class="detail-section">
                  <div class="detail-label">Location</div>
                  <div>{{ selectedRoom.location }}</div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">Family Groups</div>
                  <div v-if="getFamilyGroupsForRoom(selectedRoom.id).length > 0">
                    <div class="groups-list">
                      <div 
                        v-for="familyGroup in getFamilyGroupsForRoom(selectedRoom.id)"
                        :key="familyGroup.id"
                        class="group-assignment-item"
                      >
                        <div class="group-info">
                          <div class="font-medium">
                            {{ familyGroup.name }}
                          </div>
                          <div class="text-xs text-secondary">
                            {{ getCampersInFamilyGroup(familyGroup.id).length }} campers
                            <span v-if="familyGroup.staffMemberIds.length > 0">
                              • {{ familyGroup.staffMemberIds.length }} staff
                            </span>
                          </div>
                          <div v-if="familyGroup.description" class="text-xs text-secondary mt-1">
                            {{ familyGroup.description }}
                          </div>
                        </div>
                        <button 
                          class="btn btn-sm btn-secondary"
                          @click="viewFamilyGroup(familyGroup.id)"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-secondary">No family groups assigned to this room</div>
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

                <div class="form-group">
                  <label class="form-label">Number of Beds</label>
                  <input v-model.number="formData.beds" type="number" min="1" max="50" class="form-input" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Location</label>
                  <input v-model="formData.location" type="text" class="form-input" placeholder="e.g., North Wing, Floor 1" />
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

<script lang="ts">
import { defineComponent } from 'vue';
import { useCampStore } from '@/stores/campStore';
import type { SleepingRoom } from '@/types/api';
import FilterBar from '@/components/FilterBar.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import DataTable from '@/components/DataTable.vue';
import { Bed, MapPin } from 'lucide-vue-next';

export default defineComponent({
  name: 'SleepingRooms',
  components: {
    FilterBar,
    ConfirmModal,
    DataTable,
    Bed,
    MapPin
  },
  data() {
    return {
      selectedRoomId: null as string | null,
      showModal: false,
      editingRoomId: null as string | null,
      showConfirmModal: false,
      confirmModalTitle: '',
      confirmModalMessage: '',
      confirmModalDetails: '',
      confirmAction: null as (() => void) | null,
      viewMode: 'grid' as 'grid' | 'table',
      currentPage: 1,
      pageSize: 10,
      formData: {
        name: '',
        beds: 4,
        location: '',
      },
      searchQuery: '',
      roomColumns: [
        { key: 'name', label: 'Cabin Name', width: '250px' },
        { key: 'beds', label: 'Beds', width: '100px' },
        { key: 'location', label: 'Location', width: '250px' },
        { key: 'groups', label: 'Family Groups', width: '250px' },
        { key: 'actions', label: 'Actions', width: '140px' },
      ]
    };
  },
  computed: {
    store() {
      return useCampStore();
    },
    selectedRoom() {
      if (!this.selectedRoomId) return null;
      return this.store.getSleepingRoomById(this.selectedRoomId);
    },
    filteredRooms() {
      let rooms = this.store.sleepingRooms;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        rooms = rooms.filter(room =>
          room.name.toLowerCase().includes(query) ||
          (room.location && room.location.toLowerCase().includes(query))
        );
      }

      return rooms;
    }
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
    }
  },
  methods: {
    clearFilters() {
      this.searchQuery = '';
    },
    getFamilyGroupsForRoom(roomId: string) {
      return this.store.getFamilyGroupsInRoom(roomId);
    },
    getCampersInFamilyGroup(familyGroupId: string) {
      return this.store.getCampersInFamilyGroup(familyGroupId);
    },
    viewFamilyGroup(familyGroupId: string) {
      // Navigate to family groups view (we'll implement this)
      this.$router.push(`/family-groups?id=${familyGroupId}`);
    },
    formatDate(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },
    selectRoom(roomId: string) {
      this.selectedRoomId = roomId;
    },
    editRoom() {
      if (!this.selectedRoom) return;
      
      this.editingRoomId = this.selectedRoom.id;
      this.formData = {
        name: this.selectedRoom.name,
        beds: this.selectedRoom.beds,
        location: this.selectedRoom.location || '',
      };
      
      this.selectedRoomId = null;
      this.showModal = true;
    },
    async saveRoom() {
      const roomData: SleepingRoom = {
        id: this.editingRoomId || `sleeping-${Date.now()}`,
        name: this.formData.name,
        beds: this.formData.beds,
        location: this.formData.location || undefined,
      };

      if (this.editingRoomId) {
        await this.store.updateSleepingRoom(roomData);
      } else {
        await this.store.addSleepingRoom(roomData);
      }

      this.closeModal();
    },
    deleteRoomConfirm() {
      if (!this.selectedRoomId) return;
      
      const familyGroupCount = this.getFamilyGroupsForRoom(this.selectedRoomId).length;
      
      // Setup the confirm modal
      this.confirmModalTitle = 'Delete Sleeping Room';
      this.confirmModalMessage = 'Are you sure you want to delete this sleeping room?';
      this.confirmModalDetails = familyGroupCount > 0 
        ? `This room has ${familyGroupCount} family group(s) assigned. You will need to reassign them to another room.`
        : '';
      
      this.confirmAction = async () => {
        if (this.selectedRoomId) {
          await this.store.deleteSleepingRoom(this.selectedRoomId);
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
        beds: 4,
        location: '',
      };
    }
  }
});
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
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
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
  flex-direction: column;
  gap: 0.5rem;
}

.assigned-groups {
  border-top: 1px solid var(--border-color);
  padding-top: 0.5rem;
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

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-assignment-item {
  padding: 0.75rem;
  background: var(--background);
  border-radius: var(--radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--border-color);
}

.group-info {
  flex: 1;
}

/* Table View Styles */
.cabin-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cabin-icon-sm {
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cabin-name {
  font-weight: 500;
  color: var(--text-primary);
}

.badge-sm {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.modal-lg {
  max-width: 800px;
}
</style>

