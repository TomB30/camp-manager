<template>
  <div class="container">
    <div class="sleeping-rooms-view">
      <div class="view-header">
        <h2>Cabins (Sleeping Rooms)</h2>
        <div class="header-actions">
          <button class="btn btn-primary" @click="showModal = true">+ Add Cabin</button>
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
          <ViewToggle v-model="viewMode" />
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
      <SleepingRoomDetailModal
        :show="!!selectedRoomId"
        :room="selectedRoom"
        :family-groups="selectedRoomFamilyGroups"
        @close="selectedRoomId = null"
        @edit="editRoom"
        @delete="deleteRoomConfirm"
        @view-family-group="viewFamilyGroup"
      />

      <!-- Add/Edit Room Modal -->
      <SleepingRoomFormModal
        :show="showModal"
        :is-editing="!!editingRoomId"
        :form-data="formData"
        @close="closeModal"
        @save="saveRoom"
      />

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
import type { SleepingRoom, FamilyGroup, Camper } from '@/types/api';
import FilterBar from '@/components/FilterBar.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import DataTable from '@/components/DataTable.vue';
import ViewToggle from '@/components/ViewToggle.vue';
import SleepingRoomDetailModal from '@/components/modals/SleepingRoomDetailModal.vue';
import SleepingRoomFormModal from '@/components/modals/SleepingRoomFormModal.vue';
import { Bed, MapPin } from 'lucide-vue-next';

export default defineComponent({
  name: 'SleepingRooms',
  components: {
    FilterBar,
    ConfirmModal,
    DataTable,
    ViewToggle,
    SleepingRoomDetailModal,
    SleepingRoomFormModal,
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
    store(): ReturnType<typeof useCampStore> {
      return useCampStore();
    },
    selectedRoom(): SleepingRoom | null {
      if (!this.selectedRoomId) return null;
      return this.store.getSleepingRoomById(this.selectedRoomId) || null;
    },
    filteredRooms(): SleepingRoom[] {
      let rooms: SleepingRoom[] = this.store.sleepingRooms;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        rooms = rooms.filter((room: SleepingRoom) =>
          room.name.toLowerCase().includes(query) ||
          (room.location && room.location.toLowerCase().includes(query))
        );
      }

      return rooms;
    },
    selectedRoomFamilyGroups(): Array<FamilyGroup> {
      if (!this.selectedRoomId) return [];
      return this.getFamilyGroupsForRoom(this.selectedRoomId).map((fg: FamilyGroup) => ({
        id: fg.id,
        name: fg.name,
        description: fg.description,
        camperCount: this.getCampersInFamilyGroup(fg.id).length,
        staffCount: fg.staffMemberIds.length
      }));
    }
  },
  methods: {
    clearFilters(): void {
      this.searchQuery = '';
    },
    getFamilyGroupsForRoom(roomId: string): FamilyGroup[] {
      return this.store.getFamilyGroupsInRoom(roomId);
    },
    getCampersInFamilyGroup(familyGroupId: string): Camper[] {
      return this.store.getCampersInFamilyGroup(familyGroupId);
    },
    viewFamilyGroup(familyGroupId: string): void {
      // Navigate to family groups view (we'll implement this)
      this.$router.push(`/family-groups?id=${familyGroupId}`);
    },
    formatDate(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },
    selectRoom(roomId: string): void {
      this.selectedRoomId = roomId;
    },
    editRoom(): void {
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
    async saveRoom(formData: typeof this.formData): Promise<void> {
      const roomData: SleepingRoom = {
        id: this.editingRoomId || `sleeping-${Date.now()}`,
        name: formData.name,
        beds: formData.beds,
        location: formData.location || undefined,
      };

      if (this.editingRoomId) {
        await this.store.updateSleepingRoom(roomData);
      } else {
        await this.store.addSleepingRoom(roomData);
      }

      this.closeModal();
    },
    deleteRoomConfirm(): void {
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
    async handleConfirmAction(): Promise<void> {
      if (this.confirmAction) {
        await this.confirmAction();
      }
      this.showConfirmModal = false;
      this.confirmAction = null;
    },
    handleCancelConfirm(): void {
      this.showConfirmModal = false;
      this.confirmAction = null;
    },
    closeModal(): void {
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

