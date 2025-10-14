<template>
  <div class="cabins-tab">
    <TabHeader
      title="Cabins (Sleeping Rooms)"
      description="Manage all sleeping accommodations where campers and family groups will stay during their time at camp."
      action-text="Add Cabin"
      @action="showModal = true"
    >
      <template #action-icon>
        <Plus :size="18" />
      </template>
    </TabHeader>

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

    <!-- Empty State -->
    <EmptyState
      v-if="store.sleepingRooms.length === 0"
      icon="Bed"
      title="No cabins configured"
      message="Add your first cabin to start managing sleeping accommodations for campers."
    >
      <button class="btn btn-primary" @click="showModal = true">
        <Plus :size="18" />
        Add Your First Cabin
      </button>
    </EmptyState>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="rooms-grid">
      <SleepingRoomCard
        v-for="room in filteredRooms"
        :key="room.id"
        :room="room"
        :family-groups="getFamilyGroupsForRoom(room.id)"
        @click="selectRoom(room.id)"
      />
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
        <span v-if="item.locationId">
          {{ store.getLocationById(item.locationId)?.name || item.location || 'Unknown' }}
        </span>
        <span v-else-if="item.location">{{ item.location }}</span>
        <span v-else>—</span>
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
</template>

<script lang="ts">
// @ts-nocheck
import { defineComponent } from 'vue';
import { useCampStore } from '@/stores/campStore';
import type { SleepingRoom, FamilyGroup, Camper } from '@/types/api';
import SleepingRoomCard from '@/components/cards/SleepingRoomCard.vue';
import FilterBar from '@/components/FilterBar.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import DataTable from '@/components/DataTable.vue';
import ViewToggle from '@/components/ViewToggle.vue';
import SleepingRoomDetailModal from '@/components/modals/SleepingRoomDetailModal.vue';
import SleepingRoomFormModal from '@/components/modals/SleepingRoomFormModal.vue';
import EmptyState from '@/components/EmptyState.vue';
import { Bed, Plus } from 'lucide-vue-next';
import TabHeader from '@/components/settings/TabHeader.vue';
import { useToast } from '@/composables/useToast';

export default defineComponent({
  name: 'CabinsTab',
  components: {
    SleepingRoomCard,
    FilterBar,
    ConfirmModal,
    DataTable,
    ViewToggle,
    SleepingRoomDetailModal,
    SleepingRoomFormModal,
    EmptyState,
    Bed,
    Plus,
    TabHeader,
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
        locationId: undefined as string | undefined,
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
    selectedRoomFamilyGroups(): Array<any> {
      if (!this.selectedRoomId) return [];
      return this.getFamilyGroupsForRoom(this.selectedRoomId).map((fg: FamilyGroup) => {
        const session = this.store.sessions.find(s => s.id === fg.sessionId);
        return {
          id: fg.id,
          name: fg.name,
          description: fg.description,
          camperCount: this.getCampersInFamilyGroup(fg.id).length,
          staffCount: fg.staffMemberIds.length,
          sessionId: fg.sessionId,
          sessionName: session?.name || 'Unknown Session',
          sessionDateRange: session 
            ? `${new Date(session.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(session.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
            : 'Unknown'
        };
      });
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
      this.$router.push(`/family-groups?id=${familyGroupId}`);
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
        locationId: this.selectedRoom.locationId,
      };
      
      this.selectedRoomId = null;
      this.showModal = true;
    },
    async saveRoom(formData: typeof this.formData): Promise<void> {
      // Get location name for backward compatibility
      const location = formData.locationId 
        ? this.store.getLocationById(formData.locationId)?.name 
        : undefined;

      const roomData: SleepingRoom = {
        id: this.editingRoomId || `sleeping-${Date.now()}`,
        name: formData.name,
        beds: formData.beds,
        location: location,
        locationId: formData.locationId,
      };

      try {
        if (this.editingRoomId) {
          await this.store.updateSleepingRoom(roomData);
          this.toast.success('Cabin updated successfully');
        } else {
          await this.store.addSleepingRoom(roomData);
          this.toast.success('Cabin added successfully');
        }
        this.closeModal();
      } catch (error: any) {
        this.toast.error(error.message || 'Failed to save cabin');
      }
    },
    deleteRoomConfirm(): void {
      if (!this.selectedRoomId) return;
      
      const familyGroupCount = this.getFamilyGroupsForRoom(this.selectedRoomId).length;
      
      // Setup the confirm modal
      this.confirmModalTitle = 'Delete Cabin';
      this.confirmModalMessage = 'Are you sure you want to delete this cabin?';
      this.confirmModalDetails = familyGroupCount > 0 
        ? `This cabin has ${familyGroupCount} family group(s) assigned. You will need to reassign them to another cabin.`
        : '';
      
      this.confirmAction = async () => {
        if (this.selectedRoomId) {
          try {
            await this.store.deleteSleepingRoom(this.selectedRoomId);
            this.toast.success('Cabin deleted successfully');
            this.selectedRoomId = null;
          } catch (error: any) {
            this.toast.error(error.message || 'Failed to delete cabin');
          }
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
        locationId: undefined,
      };
    }
  }
});
</script>

<style scoped>
.cabins-tab {
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

