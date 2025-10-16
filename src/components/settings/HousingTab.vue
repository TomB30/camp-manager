<template>
  <div class="cabins-tab">
    <TabHeader
      title="Housing"
      description="Manage all sleeping accommodations where campers and family groups will stay during their time at camp."
      action-text="Room"
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
      :total-count="store.housingRooms.length"
      @clear="clearFilters"
    >
      <template #prepend>
        <ViewToggle v-model="viewMode" />
      </template>
    </FilterBar>

    <!-- Empty State -->
    <EmptyState
      v-if="store.housingRooms.length === 0"
      icon="Bed"
      title="No housing configured"
      message="Add your first room to start managing sleeping accommodations for campers."
      action-text="+ Room"
      @action="showModal = true"
    >
      <button class="btn btn-primary" @click="showModal = true">
        <Plus :size="18" />
        Add Your First Room
      </button>
    </EmptyState>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="rooms-grid">
      <HousingRoomCard
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
        <span v-if="item.areaId">
          {{ store.getAreaById(item.areaId)?.name || 'Unknown' }}
        </span>
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
    <HousingRoomDetailModal
      :show="!!selectedRoomId"
      :room="selectedRoom"
      :family-groups="selectedRoomFamilyGroups"
      @close="selectedRoomId = null"
      @edit="editRoom"
      @delete="deleteRoomConfirm"
      @view-family-group="viewFamilyGroup"
    />

    <!-- Add/Edit Room Modal -->
    <HousingRoomFormModal
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
import type { HousingRoom, FamilyGroup, Camper } from '@/types/api';
import HousingRoomCard from '@/components/cards/HousingRoomCard.vue';
import FilterBar from '@/components/FilterBar.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import DataTable from '@/components/DataTable.vue';
import ViewToggle from '@/components/ViewToggle.vue';
import HousingRoomDetailModal from '@/components/modals/HousingRoomDetailModal.vue';
import HousingRoomFormModal from '@/components/modals/HousingRoomFormModal.vue';
import EmptyState from '@/components/EmptyState.vue';
import { Bed, Plus } from 'lucide-vue-next';
import TabHeader from '@/components/settings/TabHeader.vue';
import { useToast } from '@/composables/useToast';

export default defineComponent({
  name: 'HousingTab',
  components: {
    HousingRoomCard,
    FilterBar,
    ConfirmModal,
    DataTable,
    ViewToggle,
    HousingRoomDetailModal,
    HousingRoomFormModal,
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
        areaId: undefined as string | undefined,
      },
      searchQuery: '',
      roomColumns: [
        { key: 'name', label: 'Room Name', width: '250px' },
        { key: 'beds', label: 'Beds', width: '100px' },
        { key: 'location', label: 'Area', width: '250px' },
        { key: 'groups', label: 'Family Groups', width: '250px' },
        { key: 'actions', label: 'Actions', width: '140px' },
      ]
    };
  },
  computed: {
    selectedRoom(): HousingRoom | null {
      if (!this.selectedRoomId) return null;
      return this.store.getHousingRoomById(this.selectedRoomId) || null;
    },
    filteredRooms(): HousingRoom[] {
      let rooms: HousingRoom[] = this.store.housingRooms;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        rooms = rooms.filter((room: HousingRoom) => {
          const areaName = room.areaId 
            ? this.store.getAreaById(room.areaId)?.name 
            : undefined;
          return room.name.toLowerCase().includes(query) ||
            (areaName && areaName.toLowerCase().includes(query));
        });
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
    getFamilyGroupsForRoom(housingRoomId: string): FamilyGroup[] {
      return this.store.getFamilyGroupsInRoom(housingRoomId);
    },
    getCampersInFamilyGroup(familyGroupId: string): Camper[] {
      return this.store.getCampersInFamilyGroup(familyGroupId);
    },
    viewFamilyGroup(familyGroupId: string): void {
      this.$router.push(`/family-groups?id=${familyGroupId}`);
    },
    selectRoom(housingRoomId: string): void {
      this.selectedRoomId = housingRoomId;
    },
    editRoom(): void {
      if (!this.selectedRoom) return;
      
      this.editingRoomId = this.selectedRoom.id;
      this.formData = {
        name: this.selectedRoom.name,
        beds: this.selectedRoom.beds,
        areaId: this.selectedRoom.areaId,
      };
      
      this.selectedRoomId = null;
      this.showModal = true;
    },
    async saveRoom(formData: typeof this.formData): Promise<void> {
      const roomData: HousingRoom = {
        id: this.editingRoomId || `housing-${Date.now()}`,
        name: formData.name,
        beds: formData.beds,
        areaId: formData.areaId,
      };

      try {
        if (this.editingRoomId) {
          await this.store.updateHousingRoom(roomData);
          this.toast.success('Room updated successfully');
        } else {
          await this.store.addHousingRoom(roomData);
          this.toast.success('Room added successfully');
        }
        this.closeModal();
      } catch (error: any) {
        this.toast.error(error.message || 'Failed to save room');
      }
    },
    deleteRoomConfirm(): void {
      if (!this.selectedRoomId) return;
      
      const familyGroupCount = this.getFamilyGroupsForRoom(this.selectedRoomId).length;
      
      // Setup the confirm modal
      this.confirmModalTitle = 'Delete Room';
      this.confirmModalMessage = 'Are you sure you want to delete this room?';
      this.confirmModalDetails = familyGroupCount > 0 
        ? `This room has ${familyGroupCount} family group(s) assigned. You will need to reassign them to another room.`
        : '';
      
      this.confirmAction = async () => {
        if (this.selectedRoomId) {
          try {
            await this.store.deleteHousingRoom(this.selectedRoomId);
            this.toast.success('Room deleted successfully');
            this.selectedRoomId = null;
          } catch (error: any) {
            this.toast.error(error.message || 'Failed to delete room');
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
        areaId: undefined,
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

