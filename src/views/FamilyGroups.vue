<template>
  <div class="container">
    <div class="family-groups-view">
      <ViewHeader 
        title="Family Groups" 
        tooltip="Family groups are the fundamental organizational units. Each family group is assigned to a sleeping room and has staff members responsible for the group."
      >
        <template #actions>
          <button class="btn btn-primary" @click="showModal = true">+ Create Family Group</button>
        </template>
      </ViewHeader>

      <!-- Search and Filters -->
      <FilterBar
        v-model:searchQuery="searchQuery"
        v-model:filter-sleeping-room="filterSleepingRoom"
        v-model:filter-session="filterSession"
        :filters="familyGroupsFilters"
        :filtered-count="filteredFamilyGroups.length"
        :total-count="store.familyGroups.length"
        search-placeholder="Search family groups..."
        @clear="clearFilters"
      >
        <template #prepend>
          <ViewToggle v-model="viewMode" />
        </template>
      </FilterBar>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="groups-grid">
        <FamilyGroupCard
          v-for="group in filteredFamilyGroups"
          :key="group.id"
          :group="group"
          :campers-count="getCampersCount(group.id)"
          :formatted-date-range="getSessionDateRange(group.sessionId)"
          :sleeping-room-name="getSleepingRoomName(group.sleepingRoomId)"
          @click="selectGroup(group.id)"
        />

        <EmptyState
          v-if="filteredFamilyGroups.length === 0 && store.familyGroups.length === 0"
          type="empty"
          message="No family groups created yet"
          action-text="Create First Group"
          @action="showModal = true"
        >
          <template #icon>
            <Bed :size="64" stroke-width="1.5" />
          </template>
        </EmptyState>

        <EmptyState
          v-if="filteredFamilyGroups.length === 0 && store.familyGroups.length > 0"
          type="no-results"
          title="No Family Groups Found"
          message="No family groups match your current filters. Try adjusting your search criteria."
          action-text="Clear Filters"
          action-button-class="btn-secondary"
          @action="clearFilters"
        />
      </div>

      <!-- Table View -->
      <DataTable
        v-if="viewMode === 'table'"
        :columns="familyGroupColumns"
        :data="filteredFamilyGroups"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        row-key="id"
      >
        <template #cell-name="{ item }">
          <div class="group-name-content">
            <ColorIndicator :color="item.color || '#6366F1'" type="dot" size="md" />
            <div class="group-name-text">{{ item.name }}</div>
          </div>
        </template>
        
        <template #cell-dates="{ item }">
          <div class="dates-content">
            <div>{{ getSessionName(item.sessionId) }}</div>
            <div class="text-xs text-secondary">{{ getSessionDateRange(item.sessionId) }}</div>
          </div>
        </template>
        
        <template #cell-room="{ item }">
          <div class="room-content">
            <Bed :size="14" />
            <span>{{ getSleepingRoomName(item.sleepingRoomId) }}</span>
          </div>
        </template>
        
        <template #cell-staff="{ item }">
          <div class="staff-content">
            <Users :size="14" />
            <span>{{ item.staffMemberIds.length }} staff</span>
          </div>
        </template>
        
        <template #cell-campers="{ item }">
          <span class="camper-count">{{ getCampersCount(item.id) }}</span>
        </template>
        
        <template #cell-actions="{ item }">
          <button class="btn btn-sm btn-secondary" @click.stop="selectGroup(item.id)">
            View Details
          </button>
        </template>
      </DataTable>

      <!-- Family Group Detail Modal -->
      <FamilyGroupDetailModal
        :show="!!selectedGroupId"
        :group="selectedGroup"
        :campers="groupCampers"
        @close="selectedGroupId = null"
        @edit="editGroup"
        @delete="deleteGroupConfirm"
      >
        <template #session-info>
          <div v-if="selectedGroup">
            <span class="badge badge-primary">
              {{ getSessionName(selectedGroup.sessionId) }}
            </span>
            <div class="text-xs text-secondary mt-1">
              {{ getSessionDateRange(selectedGroup.sessionId) }}
            </div>
          </div>
        </template>
        <template #sleeping-room>
          <span class="badge badge-primary">{{ selectedGroup ? getSleepingRoomName(selectedGroup.sleepingRoomId) : '' }}</span>
        </template>
        <template #staff-members>
          <div v-if="selectedGroup && selectedGroup.staffMemberIds.length > 0">
            <div class="flex gap-2 flex-wrap">
              <span 
                v-for="staffId in selectedGroup.staffMemberIds" 
                :key="staffId" 
                class="badge badge-success"
              >
                {{ getStaffMemberName(staffId) }}
              </span>
            </div>
          </div>
          <div v-else class="text-secondary">No staff members assigned</div>
        </template>
        <template #campers-list>
          <div v-if="groupCampers.length > 0" class="campers-list">
            <div 
              v-for="camper in groupCampers" 
              :key="camper.id"
              class="camper-item"
            >
              <div class="camper-avatar-sm">
                {{ camper.firstName.charAt(0) }}{{ camper.lastName.charAt(0) }}
              </div>
              <div class="camper-info">
                <div class="camper-name">{{ camper.firstName }} {{ camper.lastName }}</div>
                <div class="camper-meta text-sm text-secondary">
                  Age {{ camper.age }} • {{ formatGender(camper.gender) }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-secondary">
            No campers in this family group yet.
          </div>
        </template>
      </FamilyGroupDetailModal>

      <!-- Add/Edit Family Group Modal -->
      <FamilyGroupFormModal
        :show="showModal"
        :is-editing="!!editingGroupId"
        :form-data="formData"
        :campers="store.campers"
        :staff-members="store.staffMembers"
        :sleeping-rooms="store.sleepingRooms"
        :family-groups="store.familyGroups"
        :sessions="store.sessions"
        :editing-group-id="editingGroupId"
        @close="closeModal"
        @save="saveGroup"
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
// @ts-nocheck
import { defineComponent } from 'vue';
import { useCampStore } from '@/stores/campStore';
import type { FamilyGroup, Camper } from '@/types/api';
import { conflictDetector } from '@/services/conflicts';
import { useToast } from '@/composables/useToast';
import ViewHeader from '@/components/ViewHeader.vue';
import EmptyState from '@/components/EmptyState.vue';
import ColorIndicator from '@/components/ColorIndicator.vue';
import FamilyGroupCard from '@/components/cards/FamilyGroupCard.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import FilterBar, { type Filter } from '@/components/FilterBar.vue';
import DataTable from '@/components/DataTable.vue';
import ViewToggle from '@/components/ViewToggle.vue';
import InfoTooltip from '@/components/InfoTooltip.vue';
import FamilyGroupDetailModal from '@/components/modals/FamilyGroupDetailModal.vue';
import FamilyGroupFormModal from '@/components/modals/FamilyGroupFormModal.vue';
import { Bed, Users } from 'lucide-vue-next';

export default defineComponent({
  name: 'FamilyGroups',
  components: {
    ViewHeader,
    EmptyState,
    ColorIndicator,
    FamilyGroupCard,
    ConfirmModal,
    FilterBar,
    DataTable,
    ViewToggle,
    InfoTooltip,
    FamilyGroupDetailModal,
    FamilyGroupFormModal,
    Bed,
    Users,
  },
  data() {
    return {
      selectedGroupId: null as string | null,
      showModal: false,
      editingGroupId: null as string | null,
      showConfirmModal: false,
      confirmModalTitle: '',
      confirmModalMessage: '',
      confirmModalDetails: '',
      confirmAction: null as (() => void) | null,
      searchQuery: '',
      filterSleepingRoom: '',
      filterSession: '',
      viewMode: 'grid' as 'grid' | 'table',
      currentPage: 1,
      pageSize: 10,
      formData: {
        name: '',
        description: '',
        sessionId: '',
        sleepingRoomId: '',
        staffMemberIds: [] as string[],
        camperIds: [] as string[],
        color: '#6366F1',
      },
      familyGroupColumns: [
        { key: 'name', label: 'Group Name', width: '180px' },
        { key: 'dates', label: 'Session', width: '200px' },
        { key: 'room', label: 'Sleeping Room', width: '180px' },
        { key: 'staff', label: 'Staff', width: '120px' },
        { key: 'campers', label: 'Campers', width: '100px' },
        { key: 'actions', label: 'Actions', width: '140px' },
      ]
    };
  },
  computed: {
    store(): ReturnType<typeof useCampStore> {
      return useCampStore();
    },
    familyGroupsFilters(): Filter[] {
      return [
        {
          model: 'filterSession',
          value: this.filterSession,
          placeholder: 'Filter by Session',
          options: this.store.sessions.map(session => ({
            label: session.name,
            value: session.id,
          })),
        },
        {
          model: 'filterSleepingRoom',
          value: this.filterSleepingRoom,
          placeholder: 'Filter by Sleeping Room',
          options: this.store.sleepingRooms.map(room => ({
            label: room.name,
            value: room.id,
          })),
        },
      ];
    },
    selectedGroup(): FamilyGroup | null {
      if (!this.selectedGroupId) return null;
      return this.store.getFamilyGroupById(this.selectedGroupId) || null;
    },
    groupCampers(): Camper[] {
      if (!this.selectedGroupId) return [];
      return this.store.getCampersInFamilyGroup(this.selectedGroupId);
    },
    filteredFamilyGroups(): FamilyGroup[] {
      let groups: FamilyGroup[] = this.store.familyGroups;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        groups = groups.filter((group: FamilyGroup) =>
          group.name.toLowerCase().includes(query) ||
          (group.description && group.description.toLowerCase().includes(query))
        );
      }

      // Session filter
      if (this.filterSession) {
        groups = groups.filter((group: FamilyGroup) => 
          group.sessionId === this.filterSession
        );
      }

      // Sleeping room filter
      if (this.filterSleepingRoom) {
        groups = groups.filter((group: FamilyGroup) => 
          group.sleepingRoomId === this.filterSleepingRoom
        );
      }

      return groups;
    },
  },
  mounted() {
    // Check if there's a group ID in the query params
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('id');
    if (groupId) {
      this.selectGroup(groupId);
    }
  },
  methods: {
    clearFilters(): void {
      this.searchQuery = '';
      this.filterSleepingRoom = '';
      this.filterSession = '';
    },
    getCampersCount(groupId: string): number {
      return this.store.getCampersInFamilyGroup(groupId).length;
    },
    getSleepingRoomName(roomId: string): string {
      const room = this.store.getSleepingRoomById(roomId);
      return room?.name || 'Unknown Room';
    },
    getStaffMemberName(staffId: string): string {
      const staff = this.store.getStaffMemberById(staffId);
      return staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown';
    },
    formatGender(gender: string): string {
      return gender.charAt(0).toUpperCase() + gender.slice(1);
    },
    getSessionName(sessionId: string): string {
      const session = this.store.sessions.find(s => s.id === sessionId);
      return session?.name || 'Unknown Session';
    },
    getSessionDateRange(sessionId: string): string {
      const session = this.store.sessions.find(s => s.id === sessionId);
      if (!session) return 'Unknown';
      const startDate = new Date(session.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endDate = new Date(session.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startDate} - ${endDate}`;
    },
    formatDate(dateString: string): string {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },
    getDayCount(startDate: string, endDate: string): number {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    },
    getCamperFullName(camperId: string): string {
      const camper = this.store.getCamperById(camperId);
      return camper ? `${camper.firstName} ${camper.lastName}` : 'Unknown';
    },
    getCamperInitials(camperId: string): string {
      const camper = this.store.getCamperById(camperId);
      return camper ? `${camper.firstName.charAt(0)}${camper.lastName.charAt(0)}` : '??';
    },
    selectGroup(groupId: string): void {
      this.selectedGroupId = groupId;
    },
    editGroup(): void {
      if (!this.selectedGroup) return;
      
      // Get current campers in this family group
      const currentCampers = this.store.getCampersInFamilyGroup(this.selectedGroup.id);
      
      this.editingGroupId = this.selectedGroup.id;
      this.formData = {
        name: this.selectedGroup.name,
        description: this.selectedGroup.description || '',
        sessionId: this.selectedGroup.sessionId,
        sleepingRoomId: this.selectedGroup.sleepingRoomId,
        staffMemberIds: [...this.selectedGroup.staffMemberIds],
        camperIds: currentCampers.map(c => c.id),
        color: this.selectedGroup.color || '#6366F1',
      };
      
      this.selectedGroupId = null;
      this.showModal = true;
    },
    async saveGroup(formData: typeof this.formData): Promise<void> {
      const toast = useToast();
      
      // Validate session selection
      if (!formData.sessionId) {
        toast.error('Please select a session');
        return;
      }
      
      // Validate camper session match
      const invalidCampers = formData.camperIds.filter(camperId => {
        const camper = this.store.getCamperById(camperId);
        return camper && camper.sessionId !== formData.sessionId;
      });
      
      if (invalidCampers.length > 0) {
        toast.error('All campers must be registered for the same session as the family group');
        return;
      }
      
      // Validate room availability
      const validation = conflictDetector.canAssignFamilyGroupToRoomBySession(
        formData.sleepingRoomId,
        formData.sessionId,
        this.store.familyGroups,
        this.editingGroupId || undefined
      );
      
      if (!validation.canAssign) {
        const groupNames = validation.conflictingGroups?.map(g => g.name).join(', ') || 'another group';
        toast.error(`This room is already occupied by ${groupNames} during this session`);
        return;
      }
      
      const groupData: FamilyGroup = {
        id: this.editingGroupId || `family-${Date.now()}`,
        name: formData.name,
        description: formData.description || undefined,
        sessionId: formData.sessionId,
        sleepingRoomId: formData.sleepingRoomId,
        staffMemberIds: formData.staffMemberIds,
        color: formData.color,
        createdAt: this.editingGroupId 
          ? this.store.getFamilyGroupById(this.editingGroupId)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (this.editingGroupId) {
        await this.store.updateFamilyGroup(groupData);
        
        // Update camper assignments
        // First, get all campers currently in this group
        const currentCampers = this.store.getCampersInFamilyGroup(this.editingGroupId);
        const currentCamperIds = currentCampers.map(c => c.id);
        
        // Find campers to remove (were in group, but not in formData)
        const campersToRemove = currentCamperIds.filter(id => !formData.camperIds.includes(id));
        
        // Find campers to add (in formData, but not currently in group)
        const campersToAdd = formData.camperIds.filter(id => !currentCamperIds.includes(id));
        
        // Remove campers from this group (unassign them)
        for (const camperId of campersToRemove) {
          const camper = this.store.getCamperById(camperId);
          if (camper) {
            // Unassign the camper from this family group
            await this.store.updateCamper({
              ...camper,
              familyGroupId: undefined
            });
          }
        }
        
        // Add campers to this group
        for (const camperId of campersToAdd) {
          const camper = this.store.getCamperById(camperId);
          if (camper) {
            await this.store.updateCamper({
              ...camper,
              familyGroupId: this.editingGroupId
            });
          }
        }
      } else {
        await this.store.addFamilyGroup(groupData);
        
        // Assign all selected campers to the new group
        for (const camperId of formData.camperIds) {
          const camper = this.store.getCamperById(camperId);
          if (camper) {
            await this.store.updateCamper({
              ...camper,
              familyGroupId: groupData.id
            });
          }
        }
      }

      toast.success(this.editingGroupId ? 'Family group updated successfully' : 'Family group created successfully');
      this.closeModal();
    },
    deleteGroupConfirm(): void {
      if (!this.selectedGroupId) return;
      
      const camperCount = this.getCampersCount(this.selectedGroupId);
      
      this.confirmModalTitle = 'Delete Family Group';
      this.confirmModalMessage = 'Are you sure you want to delete this family group?';
      this.confirmModalDetails = camperCount > 0 
        ? `This group has ${camperCount} campers. They will need to be reassigned to another family group.`
        : '';
      
      this.confirmAction = async () => {
        if (this.selectedGroupId) {
          await this.store.deleteFamilyGroup(this.selectedGroupId);
          this.selectedGroupId = null;
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
      this.editingGroupId = null;
      this.formData = {
        name: '',
        description: '',
        sessionId: '',
        sleepingRoomId: '',
        staffMemberIds: [],
        camperIds: [],
        color: '#6366F1',
      };
    }
  }
});
</script>

<style scoped>
.family-groups-view {
  max-width: 1400px;
  margin: 0 auto;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-state svg {
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
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
  max-height: 300px;
  overflow-y: auto;
}

.camper-item {
  padding: 0.75rem;
  background: var(--background);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid var(--border-color);
}

.camper-avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.camper-info {
  flex: 1;
}

.camper-name {
  font-weight: 500;
  color: var(--text-primary);
}

.camper-meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Table View Styles */
.group-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.group-name-text {
  font-weight: 500;
  color: var(--text-primary);
}

.dates-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.room-content,
.staff-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
}

.camper-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  background: var(--primary-color);
  color: white;
  border-radius: 14px;
  font-size: 0.875rem;
  font-weight: 600;
}
</style>

