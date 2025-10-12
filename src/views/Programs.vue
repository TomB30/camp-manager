<template>
  <div class="container">
    <div class="programs-view">
      <!-- Breadcrumb Navigation -->
      <nav class="breadcrumbs">
        <button 
          class="breadcrumb-item"
          :class="{ active: !selectedProgramId }"
          @click="selectedProgramId = null"
        >
          Programs
        </button>
        <span v-if="selectedProgramId" class="breadcrumb-separator">/</span>
        <span v-if="selectedProgramId" class="breadcrumb-item active">
          {{ selectedProgram?.name }}
        </span>
      </nav>

      <!-- Programs List View -->
      <div v-if="!selectedProgramId">
        <div class="view-header">
          <h2>Programs</h2>
          <div class="header-actions">
            <button class="btn btn-primary" @click="showProgramModal = true">+ Create Program</button>
          </div>
        </div>

        <p class="view-description">
          Programs are collections of activities, staff members, and locations. 
          Create programs to organize your camp's offerings like "Watersports", "Arts & Crafts", or "Adventure Sports".
        </p>

        <!-- Search and Filters -->
        <FilterBar
          v-model:searchQuery="searchQuery"
          :filters="[]"
          :filtered-count="filteredPrograms.length"
          :total-count="store.programs.length"
          search-placeholder="Search programs..."
          @clear="clearFilters"
        >
          <template #prepend>
            <ViewToggle v-model="viewMode" />
          </template>
        </FilterBar>

        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="programs-grid">
          <div 
            v-for="program in filteredPrograms"
            :key="program.id"
            class="program-card card"
            :style="{ borderLeft: `4px solid ${program.color || '#6366F1'}` }"
            @click="selectProgram(program.id)"
          >
            <div class="program-header">
              <h4>{{ program.name }}</h4>
              <div class="program-badge">
                <span class="badge badge-primary">{{ getActivitiesCount(program.id) }} activities</span>
              </div>
            </div>
            
            <p v-if="program.description" class="program-description">{{ program.description }}</p>
            
            <div class="program-stats">
              <span class="stat-item">
                <Users :size="16" />
                {{ getStaffCount(program.id) }} staff
              </span>
              <span class="stat-item">
                <Home :size="16" />
                {{ getLocationsCount(program.id) }} locations
              </span>
            </div>
          </div>

          <div v-if="filteredPrograms.length === 0 && store.programs.length === 0" class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <h3>No Programs Yet</h3>
            <p>Create your first program to organize activities, staff, and locations.</p>
            <button class="btn btn-primary" @click="showProgramModal = true">Create Program</button>
          </div>

          <div v-if="filteredPrograms.length === 0 && store.programs.length > 0" class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <h3>No Programs Found</h3>
            <p>No programs match your search query.</p>
            <button class="btn btn-secondary" @click="clearFilters">Clear Filters</button>
          </div>
        </div>

        <!-- Table View -->
        <DataTable
          v-if="viewMode === 'table'"
          :columns="programColumns"
          :data="filteredPrograms"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          row-key="id"
        >
          <template #cell-name="{ item }">
            <div class="program-name-content">
              <div class="color-indicator" :style="{ background: item.color || '#6366F1' }"></div>
              <div class="program-name-text">{{ item.name }}</div>
            </div>
          </template>
          
          <template #cell-description="{ item }">
            <span class="text-secondary">{{ item.description || 'No description' }}</span>
          </template>
          
          <template #cell-activities="{ item }">
            <span class="badge badge-sm badge-primary">{{ getActivitiesCount(item.id) }} activities</span>
          </template>
          
          <template #cell-staff="{ item }">
            <span>{{ getStaffCount(item.id) }} staff</span>
          </template>
          
          <template #cell-locations="{ item }">
            <span>{{ getLocationsCount(item.id) }} locations</span>
          </template>
          
          <template #cell-actions="{ item }">
            <button class="btn btn-sm btn-secondary" @click.stop="selectProgram(item.id)">
              View Details
            </button>
          </template>
        </DataTable>
      </div>

      <!-- Program Detail View -->
      <div v-if="selectedProgramId && selectedProgram" class="program-detail">
        <div class="detail-header">
          <div class="detail-header-content">
            <div 
              class="detail-color-bar" 
              :style="{ background: selectedProgram.color || '#6366F1' }"
            ></div>
            <div class="detail-header-info">
              <h2>{{ selectedProgram.name }}</h2>
              <p v-if="selectedProgram.description" class="detail-description">
                {{ selectedProgram.description }}
              </p>
            </div>
          </div>
          <div class="detail-header-actions">
            <button class="btn btn-secondary" @click="editProgram(selectedProgram)">
              <Edit :size="18" />
              Edit Program
            </button>
            <button class="btn btn-danger" @click="deleteProgramConfirm(selectedProgram)">
              <Trash2 :size="18" />
              Delete
            </button>
          </div>
        </div>

        <!-- Activities Section -->
        <div class="detail-section">
          <div class="section-header">
            <h3>
              <ListChecks :size="20" />
              Activities
            </h3>
            <button class="btn btn-sm btn-primary" @click="showActivityModal = true">
              + Add Activity
            </button>
          </div>
          
          <div v-if="programActivities.length > 0" class="activities-list">
            <div 
              v-for="activity in programActivities"
              :key="activity.id"
              class="activity-item card"
              @click="viewActivity(activity)"
            >
              <div class="activity-info">
                <h4>{{ activity.name }}</h4>
                <p v-if="activity.description" class="text-secondary">{{ activity.description }}</p>
              </div>
              <div class="activity-meta">
                <span class="meta-item">
                  <Clock :size="14" />
                  {{ activity.durationMinutes }} min
                </span>
                <span v-if="activity.defaultRoomId" class="meta-item">
                  <Home :size="14" />
                  {{ getRoomName(activity.defaultRoomId) }}
                </span>
                <span v-if="activity.defaultCapacity" class="meta-item">
                  <Users :size="14" />
                  {{ activity.defaultCapacity }} max
                </span>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-section">
            <p>No activities yet. Add activities to create event templates.</p>
          </div>
        </div>

        <!-- Staff Section -->
        <div class="detail-section">
          <div class="section-header">
            <h3>
              <UsersRound :size="20" />
              Staff Members
            </h3>
            <button class="btn btn-sm btn-secondary" @click="showStaffSelector = true">
              + Assign Staff
            </button>
          </div>
          
          <div v-if="programStaff.length > 0" class="staff-list">
            <div 
              v-for="staff in programStaff"
              :key="staff.id"
              class="staff-item"
            >
              <div class="staff-avatar">
                {{ staff.firstName.charAt(0) }}{{ staff.lastName.charAt(0) }}
              </div>
              <div class="staff-info">
                <div class="staff-name">{{ staff.firstName }} {{ staff.lastName }}</div>
                <div class="staff-role text-secondary">{{ formatRole(staff.role) }}</div>
                <div v-if="staff.certifications && staff.certifications.length > 0" class="staff-certifications">
                  <span 
                    v-for="cert in staff.certifications" 
                    :key="cert"
                    class="certification-badge"
                  >
                    {{ cert }}
                  </span>
                </div>
              </div>
              <button 
                class="btn btn-sm btn-danger-outline"
                @click.stop="removeStaffFromProgram(staff.id)"
              >
                Remove
              </button>
            </div>
          </div>
          
          <div v-else class="empty-section">
            <p>No staff members assigned. Add staff to this program.</p>
          </div>
        </div>

        <!-- Locations Section -->
        <div class="detail-section">
          <div class="section-header">
            <h3>
              <Home :size="20" />
              Locations
            </h3>
            <button class="btn btn-sm btn-secondary" @click="showLocationSelector = true">
              + Add Location
            </button>
          </div>
          
          <div v-if="programLocations.length > 0" class="locations-list">
            <div 
              v-for="room in programLocations"
              :key="room.id"
              class="location-item"
            >
              <div class="location-info">
                <div class="location-name">{{ room.name }}</div>
                <div class="location-meta text-secondary">
                  <span>{{ formatRoomType(room.type) }}</span>
                  <span>•</span>
                  <span>Capacity: {{ room.capacity }}</span>
                  <span v-if="room.location">• {{ room.location }}</span>
                </div>
              </div>
              <button 
                class="btn btn-sm btn-danger-outline"
                @click.stop="removeLocationFromProgram(room.id)"
              >
                Remove
              </button>
            </div>
          </div>
          
          <div v-else class="empty-section">
            <p>No locations assigned. Add locations to this program.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ProgramFormModal
      :show="showProgramModal"
      :program="editingProgram"
      @close="closeProgramModal"
      @save="saveProgram"
    />

    <ActivityFormModal
      :show="showActivityModal"
      :activity="editingActivity"
      :program-id="selectedProgramId || undefined"
      @close="closeActivityModal"
      @save="saveActivity"
    />

    <ActivityDetailModal
      :show="!!selectedActivityId"
      :activity="selectedActivity"
      @close="selectedActivityId = null"
      @edit="editActivity"
      @delete="deleteActivityConfirm"
    />

    <!-- Staff Selector Modal -->
    <BaseModal
      :show="showStaffSelector"
      title="Assign Staff to Program"
      @close="showStaffSelector = false"
    >
      <template #body>
        <div class="selector-list">
          <div 
            v-for="staff in availableStaff"
            :key="staff.id"
            class="selector-item"
            @click="addStaffToProgram(staff.id)"
          >
            <div class="staff-avatar">
              {{ staff.firstName.charAt(0) }}{{ staff.lastName.charAt(0) }}
            </div>
            <div class="selector-info">
              <div class="selector-name">{{ staff.firstName }} {{ staff.lastName }}</div>
              <div class="selector-meta text-secondary">{{ formatRole(staff.role) }}</div>
            </div>
          </div>
          <div v-if="availableStaff.length === 0" class="empty-section">
            <p>All staff members are already assigned to this program.</p>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-secondary" @click="showStaffSelector = false">Close</button>
      </template>
    </BaseModal>

    <!-- Location Selector Modal -->
    <BaseModal
      :show="showLocationSelector"
      title="Add Location to Program"
      @close="showLocationSelector = false"
    >
      <template #body>
        <div class="selector-list">
          <div 
            v-for="room in availableLocations"
            :key="room.id"
            class="selector-item"
            @click="addLocationToProgram(room.id)"
          >
            <div class="selector-info">
              <div class="selector-name">{{ room.name }}</div>
              <div class="selector-meta text-secondary">
                {{ formatRoomType(room.type) }} • Capacity: {{ room.capacity }}
              </div>
            </div>
          </div>
          <div v-if="availableLocations.length === 0" class="empty-section">
            <p>All locations are already assigned to this program.</p>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-secondary" @click="showLocationSelector = false">Close</button>
      </template>
    </BaseModal>

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :show="showDeleteConfirm"
      :title="deleteConfirmTitle"
      :message="deleteConfirmMessage"
      confirm-text="Delete"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useCampStore } from '@/stores/campStore';
import { useToast } from '@/composables/useToast';
import type { Program, Activity } from '@/types/api';
import { Users, UsersRound, Home, Clock, Edit, Trash2, ListChecks } from 'lucide-vue-next';
import BaseModal from '@/components/BaseModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import FilterBar from '@/components/FilterBar.vue';
import ViewToggle from '@/components/ViewToggle.vue';
import DataTable from '@/components/DataTable.vue';
import ProgramFormModal from '@/components/modals/ProgramFormModal.vue';
import ActivityFormModal from '@/components/modals/ActivityFormModal.vue';
import ActivityDetailModal from '@/components/modals/ActivityDetailModal.vue';

export default defineComponent({
  name: 'Programs',
  components: {
    Users,
    UsersRound,
    Home,
    Clock,
    Edit,
    Trash2,
    ListChecks,
    BaseModal,
    ConfirmModal,
    FilterBar,
    ViewToggle,
    DataTable,
    ProgramFormModal,
    ActivityFormModal,
    ActivityDetailModal,
  },
  data() {
    return {
      searchQuery: '',
      viewMode: 'grid' as 'grid' | 'table',
      currentPage: 1,
      pageSize: 10,
      selectedProgramId: null as string | null,
      selectedActivityId: null as string | null,
      showProgramModal: false,
      showActivityModal: false,
      showStaffSelector: false,
      showLocationSelector: false,
      showDeleteConfirm: false,
      editingProgram: null as Program | null,
      editingActivity: null as Activity | null,
      deleteTarget: null as { type: 'program' | 'activity'; id: string } | null,
      programColumns: [
        { key: 'name', label: 'Program Name', width: '200px' },
        { key: 'description', label: 'Description', width: '250px' },
        { key: 'activities', label: 'Activities', width: '120px' },
        { key: 'staff', label: 'Staff', width: '100px' },
        { key: 'locations', label: 'Locations', width: '100px' },
        { key: 'actions', label: 'Actions', width: '140px' },
      ]
    };
  },
  computed: {
    store() {
      return useCampStore();
    },
    toast() {
      return useToast();
    },
    filteredPrograms() {
      const query = this.searchQuery.toLowerCase().trim();
      if (!query) return this.store.programs;
      
      return this.store.programs.filter(program => 
        program.name.toLowerCase().includes(query) ||
        (program.description && program.description.toLowerCase().includes(query))
      );
    },
    selectedProgram() {
      return this.selectedProgramId 
        ? this.store.getProgramById(this.selectedProgramId) 
        : null;
    },
    selectedActivity() {
      return this.selectedActivityId 
        ? this.store.getActivityById(this.selectedActivityId) 
        : null;
    },
    programActivities() {
      return this.selectedProgramId 
        ? this.store.getActivitiesInProgram(this.selectedProgramId) 
        : [];
    },
    programStaff() {
      if (!this.selectedProgram) return [];
      return this.selectedProgram.staffMemberIds
        .map(id => this.store.getStaffMemberById(id))
        .filter(staff => staff !== undefined);
    },
    programLocations() {
      if (!this.selectedProgram) return [];
      return this.selectedProgram.roomIds
        .map(id => this.store.getRoomById(id))
        .filter(room => room !== undefined);
    },
    availableStaff() {
      if (!this.selectedProgram) return [];
      return this.store.staffMembers.filter(
        staff => !this.selectedProgram!.staffMemberIds.includes(staff.id)
      );
    },
    availableLocations() {
      if (!this.selectedProgram) return [];
      return this.store.rooms.filter(
        room => !this.selectedProgram!.roomIds.includes(room.id)
      );
    },
    deleteConfirmTitle() {
      if (!this.deleteTarget) return '';
      return this.deleteTarget.type === 'program' 
        ? 'Delete Program?' 
        : 'Delete Activity?';
    },
    deleteConfirmMessage() {
      if (!this.deleteTarget) return '';
      if (this.deleteTarget.type === 'program') {
        const program = this.store.getProgramById(this.deleteTarget.id);
        return `Are you sure you want to delete "${program?.name}"? This will also delete all activities in this program. This action cannot be undone.`;
      } else {
        const activity = this.store.getActivityById(this.deleteTarget.id);
        return `Are you sure you want to delete "${activity?.name}"? This action cannot be undone.`;
      }
    },
  },
  methods: {
    clearFilters() {
      this.searchQuery = '';
    },
    selectProgram(id: string) {
      this.selectedProgramId = id;
    },
    getActivitiesCount(programId: string) {
      return this.store.getActivitiesInProgram(programId).length;
    },
    getStaffCount(programId: string) {
      const program = this.store.getProgramById(programId);
      return program?.staffMemberIds.length || 0;
    },
    getLocationsCount(programId: string) {
      const program = this.store.getProgramById(programId);
      return program?.roomIds.length || 0;
    },
    getRoomName(roomId: string) {
      const room = this.store.getRoomById(roomId);
      return room?.name || 'Unknown';
    },
    formatRole(role: string) {
      return role.charAt(0).toUpperCase() + role.slice(1);
    },
    formatRoomType(type: string) {
      return type.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    },
    closeProgramModal() {
      this.showProgramModal = false;
      this.editingProgram = null;
    },
    closeActivityModal() {
      this.showActivityModal = false;
      this.editingActivity = null;
    },
    editProgram(program: Program) {
      this.editingProgram = program;
      this.showProgramModal = true;
    },
    async saveProgram(program: Program) {
      try {
        if (this.editingProgram) {
          await this.store.updateProgram(program);
          this.toast.success('Program updated successfully');
        } else {
          await this.store.addProgram(program);
          this.toast.success('Program created successfully');
        }
        this.closeProgramModal();
      } catch (error: any) {
        this.toast.error(error.message || 'Failed to save program');
      }
    },
    deleteProgramConfirm(program: Program) {
      this.deleteTarget = { type: 'program', id: program.id };
      this.showDeleteConfirm = true;
    },
    viewActivity(activity: Activity) {
      this.selectedActivityId = activity.id;
    },
    editActivity(activity: Activity) {
      this.editingActivity = activity;
      this.showActivityModal = true;
      this.selectedActivityId = null;
    },
    async saveActivity(activity: Activity) {
      try {
        if (this.editingActivity) {
          await this.store.updateActivity(activity);
          this.toast.success('Activity updated successfully');
        } else {
          await this.store.addActivity(activity);
          this.toast.success('Activity created successfully');
        }
        this.closeActivityModal();
      } catch (error: any) {
        this.toast.error(error.message || 'Failed to save activity');
      }
    },
    deleteActivityConfirm(activity: Activity) {
      this.deleteTarget = { type: 'activity', id: activity.id };
      this.showDeleteConfirm = true;
      this.selectedActivityId = null;
    },
    async addStaffToProgram(staffId: string) {
      if (!this.selectedProgram) return;
      
      const updatedProgram = {
        ...this.selectedProgram,
        staffMemberIds: [...this.selectedProgram.staffMemberIds, staffId],
      };
      
      try {
        await this.store.updateProgram(updatedProgram);
        this.toast.success('Staff member added to program');
        this.showStaffSelector = false;
      } catch (error: any) {
        this.toast.error(error.message || 'Failed to add staff member');
      }
    },
    async removeStaffFromProgram(staffId: string) {
      if (!this.selectedProgram) return;
      
      const updatedProgram = {
        ...this.selectedProgram,
        staffMemberIds: this.selectedProgram.staffMemberIds.filter(id => id !== staffId),
      };
      
      try {
        await this.store.updateProgram(updatedProgram);
        this.toast.success('Staff member removed from program');
      } catch (error: any) {
        this.toast.error(error.message || 'Failed to remove staff member');
      }
    },
    async addLocationToProgram(roomId: string) {
      if (!this.selectedProgram) return;
      
      const updatedProgram = {
        ...this.selectedProgram,
        roomIds: [...this.selectedProgram.roomIds, roomId],
      };
      
      try {
        await this.store.updateProgram(updatedProgram);
        this.toast.success('Location added to program');
        this.showLocationSelector = false;
      } catch (error: any) {
        this.toast.error(error.message || 'Failed to add location');
      }
    },
    async removeLocationFromProgram(roomId: string) {
      if (!this.selectedProgram) return;
      
      const updatedProgram = {
        ...this.selectedProgram,
        roomIds: this.selectedProgram.roomIds.filter(id => id !== roomId),
      };
      
      try {
        await this.store.updateProgram(updatedProgram);
        this.toast.success('Location removed from program');
      } catch (error: any) {
        this.toast.error(error.message || 'Failed to remove location');
      }
    },
    async confirmDelete() {
      if (!this.deleteTarget) return;
      
      try {
        if (this.deleteTarget.type === 'program') {
          await this.store.deleteProgram(this.deleteTarget.id);
          this.toast.success('Program deleted successfully');
          this.selectedProgramId = null;
        } else {
          await this.store.deleteActivity(this.deleteTarget.id);
          this.toast.success('Activity deleted successfully');
        }
      } catch (error: any) {
        this.toast.error(error.message || 'Failed to delete');
      } finally {
        this.cancelDelete();
      }
    },
    cancelDelete() {
      this.showDeleteConfirm = false;
      this.deleteTarget = null;
    },
  },
});
</script>

<style scoped>
.programs-view {
  padding: 0;
}

/* Breadcrumbs */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.breadcrumb-item {
  color: var(--text-secondary);
  text-decoration: none;
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  font-size: inherit;
}

.breadcrumb-item:hover {
  background: var(--surface-secondary);
  color: var(--text-primary);
}

.breadcrumb-item.active {
  color: var(--text-primary);
  font-weight: 600;
  background: var(--surface-secondary);
  cursor: default;
}

.breadcrumb-separator {
  color: var(--text-muted);
}

/* View Header */
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.view-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.view-description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

/* Table View Styles */
.program-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.color-indicator {
  width: 4px;
  height: 24px;
  border-radius: 2px;
  flex-shrink: 0;
}

.program-name-text {
  font-weight: 500;
}

/* Programs Grid */
.programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.program-card {
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 1.5rem;
}

.program-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.program-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.program-header h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.program-badge {
  display: flex;
  gap: 0.5rem;
}

.program-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.program-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

/* Program Detail View */
.program-detail {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-header {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
}

.detail-header-content {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.detail-color-bar {
  width: 6px;
  border-radius: 3px;
  flex-shrink: 0;
}

.detail-header-info h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.detail-description {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.detail-header-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* Detail Sections */
.detail-section {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-light);
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

/* Activities List */
.activities-list {
  display: grid;
  gap: 1rem;
}

.activity-item {
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.activity-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.activity-info h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
}

.activity-info p {
  margin: 0;
  font-size: 0.875rem;
}

.activity-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Staff List */
.staff-list {
  display: grid;
  gap: 1rem;
}

.staff-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-secondary);
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.staff-item:hover {
  background: var(--surface-hover);
}

.staff-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--accent-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  flex-shrink: 0;
}

.staff-info {
  flex: 1;
}

.staff-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.staff-role {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.staff-certifications {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.certification-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: var(--accent-light);
  color: var(--accent-color);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

/* Locations List */
.locations-list {
  display: grid;
  gap: 1rem;
}

.location-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--surface-secondary);
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.location-item:hover {
  background: var(--surface-hover);
}

.location-info {
  flex: 1;
}

.location-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.location-meta {
  font-size: 0.875rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Selector Modal */
.selector-list {
  display: grid;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
}

.selector-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-secondary);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.selector-item:hover {
  background: var(--accent-light);
  transform: translateX(4px);
}

.selector-info {
  flex: 1;
}

.selector-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.selector-meta {
  font-size: 0.875rem;
}

/* Empty States */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-state svg {
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  max-width: 400px;
}

.empty-section {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-section p {
  margin: 0;
}

@media (max-width: 768px) {
  .programs-grid {
    grid-template-columns: 1fr;
  }

  .detail-header {
    padding: 1.5rem;
  }

  .detail-header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .detail-header-actions {
    flex-direction: column;
  }

  .detail-header-actions .btn {
    width: 100%;
  }
}
</style>

