<template>
  <div class="container">
    <div class="family-groups-view">
      <div class="view-header">
        <h2>Family Groups</h2>
        <div class="header-actions">
          <button class="btn btn-primary" @click="showModal = true">+ Create Family Group</button>
        </div>
      </div>

      <p class="view-description">
        Family groups are the fundamental organizational units. Each family group is assigned to a sleeping room and has staff members responsible for the group.
      </p>

      <!-- Search and Filters -->
      <FilterBar
        v-model:searchQuery="searchQuery"
        v-model:filterSleepingRoom="filterSleepingRoom"
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
        <div 
          v-for="group in filteredFamilyGroups"
          :key="group.id"
          class="group-card card"
          :style="{ borderLeft: `4px solid ${group.color || '#6366F1'}` }"
          @click="selectGroup(group.id)"
        >
          <div class="group-header">
            <h4>{{ group.name }}</h4>
            <span class="badge badge-primary">{{ getCampersCount(group.id) }} campers</span>
          </div>
          
          <p v-if="group.description" class="group-description">{{ group.description }}</p>
          
          <div class="group-dates">
            <span class="text-xs text-secondary">
              📅 {{ formatDate(group.startDate) }} - {{ formatDate(group.endDate) }}
            </span>
          </div>
          
          <div class="group-info mt-2">
            <div class="info-row">
              <Bed :size="16" />
              <span>{{ getSleepingRoomName(group.sleepingRoomId) }}</span>
            </div>
            <div v-if="group.staffMemberIds.length > 0" class="info-row">
              <Users :size="16" />
              <span>{{ group.staffMemberIds.length }} staff member(s)</span>
            </div>
          </div>
        </div>

        <div v-if="filteredFamilyGroups.length === 0 && store.familyGroups.length === 0" class="empty-state">
          <Bed :size="64" stroke-width="1.5" />
          <p>No family groups created yet</p>
          <button class="btn btn-primary" @click="showModal = true">Create First Group</button>
        </div>

        <div v-if="filteredFamilyGroups.length === 0 && store.familyGroups.length > 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <h3>No Family Groups Found</h3>
          <p>No family groups match your current filters. Try adjusting your search criteria.</p>
          <button class="btn btn-secondary" @click="clearFilters">Clear Filters</button>
        </div>
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
            <div class="color-indicator" :style="{ background: item.color || '#6366F1' }"></div>
            <div class="group-name-text">{{ item.name }}</div>
          </div>
        </template>
        
        <template #cell-dates="{ item }">
          <div class="dates-content">
            <div>{{ formatDate(item.startDate) }}</div>
            <div class="text-xs text-secondary">to {{ formatDate(item.endDate) }}</div>
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
      <Teleport to="body">
        <div v-if="selectedGroupId" class="modal-overlay" @click.self="selectedGroupId = null">
          <div class="modal modal-lg">
            <div class="modal-header">
              <h3>{{ selectedGroup?.name }}</h3>
              <button class="btn btn-icon btn-secondary" @click="selectedGroupId = null">✕</button>
            </div>
            <div class="modal-body">
              <div v-if="selectedGroup">
                <div class="detail-section">
                  <div class="detail-label">Description</div>
                  <div>{{ selectedGroup.description || 'No description provided' }}</div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">Dates</div>
                  <div>
                    <span class="badge badge-primary">
                      {{ formatDate(selectedGroup.startDate) }} - {{ formatDate(selectedGroup.endDate) }}
                    </span>
                    <div class="text-xs text-secondary mt-1">
                      {{ getDayCount(selectedGroup.startDate, selectedGroup.endDate) }} days
                    </div>
                  </div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">Sleeping Room</div>
                  <div>
                    <span class="badge badge-primary">{{ getSleepingRoomName(selectedGroup.sleepingRoomId) }}</span>
                  </div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">Staff Members</div>
                  <div v-if="selectedGroup.staffMemberIds.length > 0">
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
                </div>

                <div class="detail-section">
                  <div class="detail-label">Campers ({{ groupCampers.length }})</div>
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
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-error" @click="deleteGroupConfirm">Delete Group</button>
              <button class="btn btn-secondary" @click="editGroup">Edit</button>
              <button class="btn btn-secondary" @click="selectedGroupId = null">Close</button>
            </div>
          </div>
        </div>

        <!-- Add/Edit Family Group Modal -->
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal">
            <div class="modal-header">
              <h3>{{ editingGroupId ? 'Edit Family Group' : 'Create New Family Group' }}</h3>
              <button class="btn btn-icon btn-secondary" @click="closeModal">✕</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveGroup">
                <div class="form-group">
                  <label class="form-label">Group Name</label>
                  <input v-model="formData.name" type="text" class="form-input" required placeholder="e.g., Eagles Family" />
                </div>

                <div class="form-group">
                  <label class="form-label">Description</label>
                  <textarea v-model="formData.description" class="form-textarea" placeholder="Optional description..."></textarea>
                </div>

                <div class="grid grid-cols-2">
                  <div class="form-group">
                    <label class="form-label">Start Date</label>
                    <input v-model="formData.startDate" type="date" class="form-input" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">End Date</label>
                    <input v-model="formData.endDate" type="date" class="form-input" required />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Campers in this Group</label>
                  <div class="campers-selection">
                    <div v-if="formData.camperIds.length > 0" class="selected-campers">
                      <div 
                        v-for="camperId in formData.camperIds"
                        :key="camperId"
                        class="selected-camper-item"
                      >
                        <div class="camper-info-sm">
                          <div class="camper-avatar-xs">
                            {{ getCamperInitials(camperId) }}
                          </div>
                          <span>{{ getCamperFullName(camperId) }}</span>
                        </div>
                        <button 
                          type="button"
                          class="btn-remove"
                          @click="removeCamper(camperId)"
                          title="Remove camper"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div v-else class="text-sm text-secondary mb-2">
                      No campers assigned yet
                    </div>
                    
                    <div class="add-camper-section">
                      <Autocomplete
                        v-model="selectedCamperToAdd"
                        :options="availableCampersOptions"
                        placeholder="Add a camper..."
                      />
                      <button 
                        type="button"
                        class="btn btn-sm btn-primary"
                        @click="addCamper"
                        :disabled="!selectedCamperToAdd"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Staff Members</label>
                  <div class="checkbox-group">
                    <label 
                      v-for="staff in store.staffMembers" 
                      :key="staff.id"
                      class="checkbox-label"
                    >
                      <input 
                        type="checkbox" 
                        :value="staff.id"
                        v-model="formData.staffMemberIds"
                        class="checkbox-input"
                      />
                      <span>{{ staff.firstName }} {{ staff.lastName }} ({{ staff.role }})</span>
                    </label>
                    <div v-if="store.staffMembers.length === 0" class="text-sm text-secondary">
                      No staff members available
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Sleeping Room</label>
                  <div v-if="totalPeople > 0" class="capacity-info mb-2">
                    <span class="badge badge-primary">
                      {{ totalPeople }} {{ totalPeople === 1 ? 'person' : 'people' }} 
                      ({{ formData.camperIds.length }} {{ formData.camperIds.length === 1 ? 'camper' : 'campers' }}
                      + {{ formData.staffMemberIds.length }} staff)
                    </span>
                  </div>
                  <Autocomplete
                    v-model="formData.sleepingRoomId"
                    :options="sleepingRoomOptions"
                    placeholder="Select a sleeping room..."
                    :required="true"
                  />
                  <div v-if="formData.sleepingRoomId && getSelectedRoom() && !canFitInRoom(getSelectedRoom())" class="capacity-warning">
                    ⚠️ This room may not have enough beds for all campers and staff
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Group Color</label>
                  <ColorPicker v-model="formData.color" />
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button class="btn btn-primary" @click="saveGroup">
                {{ editingGroupId ? 'Update' : 'Create' }} Group
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
import type { FamilyGroup } from '@/types/api';
import ConfirmModal from '@/components/ConfirmModal.vue';
import ColorPicker from '@/components/ColorPicker.vue';
import FilterBar, { type Filter } from '@/components/FilterBar.vue';
import DataTable from '@/components/DataTable.vue';
import ViewToggle from '@/components/ViewToggle.vue';
import Autocomplete from '@/components/Autocomplete.vue';
import { Bed, Users } from 'lucide-vue-next';

export default defineComponent({
  name: 'FamilyGroups',
  components: {
    ConfirmModal,
    ColorPicker,
    FilterBar,
    DataTable,
    ViewToggle,
    Autocomplete,
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
      viewMode: 'grid' as 'grid' | 'table',
      currentPage: 1,
      pageSize: 10,
      formData: {
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        sleepingRoomId: '',
        staffMemberIds: [] as string[],
        camperIds: [] as string[],
        color: '#6366F1',
      },
      selectedCamperToAdd: '',
      familyGroupColumns: [
        { key: 'name', label: 'Group Name', width: '180px' },
        { key: 'dates', label: 'Dates', width: '200px' },
        { key: 'room', label: 'Sleeping Room', width: '180px' },
        { key: 'staff', label: 'Staff', width: '120px' },
        { key: 'campers', label: 'Campers', width: '100px' },
        { key: 'actions', label: 'Actions', width: '140px' },
      ]
    };
  },
  computed: {
    store() {
      return useCampStore();
    },
    availableCampersOptions() {
      return this.availableCampers.map(camper => ({
        label: `${camper.firstName} ${camper.lastName} (Age ${camper.age})`,
        value: camper.id
      }));
    },
    sleepingRoomOptions() {
      return this.store.sleepingRooms.map(room => ({
        label: `${room.name} (${room.beds} beds)${this.canFitInRoom(room) ? '' : ' - Not enough beds'}`,
        value: room.id,
        disabled: !this.canFitInRoom(room)
      }));
    },
    familyGroupsFilters(): Filter[] {
      return [
        {
          model: 'filterSleepingRoom',
          value: this.filterSleepingRoom,
          placeholder: 'All Sleeping Rooms',
          options: this.store.sleepingRooms.map(room => ({
            label: room.name,
            value: room.id,
          })),
        },
      ];
    },
    selectedGroup() {
      if (!this.selectedGroupId) return null;
      return this.store.getFamilyGroupById(this.selectedGroupId);
    },
    groupCampers() {
      if (!this.selectedGroupId) return [];
      return this.store.getCampersInFamilyGroup(this.selectedGroupId);
    },
    availableCampers() {
      // Get campers not already in the form's camper list
      return this.store.campers.filter(c => !this.formData.camperIds.includes(c.id));
    },
    totalPeople() {
      return this.formData.camperIds.length + this.formData.staffMemberIds.length;
    },
    filteredFamilyGroups() {
      let groups = this.store.familyGroups;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        groups = groups.filter(group =>
          group.name.toLowerCase().includes(query) ||
          (group.description && group.description.toLowerCase().includes(query))
        );
      }

      // Sleeping room filter
      if (this.filterSleepingRoom) {
        groups = groups.filter(group => 
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
    clearFilters() {
      this.searchQuery = '';
      this.filterSleepingRoom = '';
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
    addCamper() {
      if (this.selectedCamperToAdd && !this.formData.camperIds.includes(this.selectedCamperToAdd)) {
        this.formData.camperIds.push(this.selectedCamperToAdd);
        this.selectedCamperToAdd = '';
      }
    },
    removeCamper(camperId: string) {
      const index = this.formData.camperIds.indexOf(camperId);
      if (index > -1) {
        this.formData.camperIds.splice(index, 1);
      }
    },
    canFitInRoom(room: any) {
      if (!room) return false;
      return room.beds >= this.totalPeople;
    },
    getSelectedRoom() {
      return this.store.getSleepingRoomById(this.formData.sleepingRoomId);
    },
    selectGroup(groupId: string) {
      this.selectedGroupId = groupId;
    },
    editGroup() {
      if (!this.selectedGroup) return;
      
      // Get current campers in this family group
      const currentCampers = this.store.getCampersInFamilyGroup(this.selectedGroup.id);
      
      this.editingGroupId = this.selectedGroup.id;
      this.formData = {
        name: this.selectedGroup.name,
        description: this.selectedGroup.description || '',
        startDate: this.selectedGroup.startDate.split('T')[0], // Convert ISO to YYYY-MM-DD
        endDate: this.selectedGroup.endDate.split('T')[0],
        sleepingRoomId: this.selectedGroup.sleepingRoomId,
        staffMemberIds: [...this.selectedGroup.staffMemberIds],
        camperIds: currentCampers.map(c => c.id),
        color: this.selectedGroup.color || '#6366F1',
      };
      
      this.selectedGroupId = null;
      this.showModal = true;
    },
    async saveGroup() {
      const groupData: FamilyGroup = {
        id: this.editingGroupId || `family-${Date.now()}`,
        name: this.formData.name,
        description: this.formData.description || undefined,
        startDate: new Date(this.formData.startDate).toISOString(),
        endDate: new Date(this.formData.endDate).toISOString(),
        sleepingRoomId: this.formData.sleepingRoomId,
        staffMemberIds: this.formData.staffMemberIds,
        color: this.formData.color,
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
        const campersToRemove = currentCamperIds.filter(id => !this.formData.camperIds.includes(id));
        
        // Find campers to add (in formData, but not currently in group)
        const campersToAdd = this.formData.camperIds.filter(id => !currentCamperIds.includes(id));
        
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
        for (const camperId of this.formData.camperIds) {
          const camper = this.store.getCamperById(camperId);
          if (camper) {
            await this.store.updateCamper({
              ...camper,
              familyGroupId: groupData.id
            });
          }
        }
      }

      this.closeModal();
    },
    deleteGroupConfirm() {
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
      this.editingGroupId = null;
      this.selectedCamperToAdd = '';
      this.formData = {
        name: '',
        description: '',
        startDate: '',
        endDate: '',
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

.view-description {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.group-card {
  cursor: pointer;
  transition: all 0.15s ease;
}

.group-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.75rem;
}

.group-header h4 {
  margin: 0;
}

.group-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
}

.group-dates {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
}

.group-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
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

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius);
  transition: background 0.15s ease;
}

.checkbox-label:hover {
  background: var(--background);
}

.checkbox-input {
  cursor: pointer;
}

.modal-lg {
  max-width: 800px;
}

.campers-selection {
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 0.75rem;
  background: var(--background);
}

.selected-campers {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.selected-camper-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  transition: background 0.15s ease;
}

.selected-camper-item:hover {
  background: var(--surface);
}

.camper-info-sm {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.camper-avatar-xs {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.btn-remove {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: var(--error-color, #ef4444);
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  padding: 0;
  line-height: 1;
}

.btn-remove:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.add-camper-section {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.add-camper-section .form-select {
  flex: 1;
}

.add-camper-section .btn {
  flex-shrink: 0;
}

.capacity-info {
  margin-bottom: 0.5rem;
}

.capacity-warning {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  border-radius: var(--radius);
  color: #92400E;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
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

