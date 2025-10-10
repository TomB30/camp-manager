<template>
  <div class="container">
    <div class="groups-view">
      <div class="view-header">
        <h2>Camper Groups</h2>
        <div class="header-actions">
          <button class="btn btn-primary" @click="showModal = true">+ Create Group</button>
        </div>
      </div>

      <p class="view-description">
        Create virtual groups of campers based on criteria like age, gender, or cabin. 
        Use these groups to quickly assign multiple campers to events.
      </p>

      <!-- Groups List -->
      <div class="groups-grid">
        <div 
          v-for="group in store.camperGroups"
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
          
          <div class="group-filters">
            <span v-if="group.filters.gender" class="filter-tag">
              <strong>Gender:</strong> {{ formatGender(group.filters.gender) }}
            </span>
            <span v-if="group.filters.ageMin !== undefined || group.filters.ageMax !== undefined" class="filter-tag">
              <strong>Age:</strong> {{ formatAgeRange(group.filters.ageMin, group.filters.ageMax) }}
            </span>
            <span v-if="group.filters.sleepingRoomIds && group.filters.sleepingRoomIds.length > 0" class="filter-tag">
              <strong>Cabins:</strong> {{ group.filters.sleepingRoomIds.length }} selected
            </span>
            <span v-if="group.filters.hasAllergies !== undefined" class="filter-tag">
              <strong>Allergies:</strong> {{ group.filters.hasAllergies ? 'Has allergies' : 'No allergies' }}
            </span>
          </div>
        </div>

        <div v-if="store.camperGroups.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3>No Groups Yet</h3>
          <p>Create your first camper group to organize and manage campers more efficiently.</p>
          <button class="btn btn-primary" @click="showModal = true">Create Group</button>
        </div>
      </div>

      <!-- Group Detail Modal -->
      <Teleport to="body">
        <div v-if="selectedGroupId" class="modal-overlay" @click.self="selectedGroupId = null">
          <div class="modal modal-large">
            <div class="modal-header">
              <div>
                <h3>{{ selectedGroup?.name }}</h3>
                <p v-if="selectedGroup?.description" class="text-secondary text-sm">
                  {{ selectedGroup.description }}
                </p>
              </div>
              <button class="btn btn-icon btn-secondary" @click="selectedGroupId = null">✕</button>
            </div>
            <div class="modal-body">
              <div v-if="selectedGroup">
                <div class="detail-section">
                  <div class="detail-label">Filter Criteria</div>
                  <div class="group-filters">
                    <span v-if="selectedGroup.filters.gender" class="filter-tag">
                      <strong>Gender:</strong> {{ formatGender(selectedGroup.filters.gender) }}
                    </span>
                    <span v-if="selectedGroup.filters.ageMin !== undefined || selectedGroup.filters.ageMax !== undefined" class="filter-tag">
                      <strong>Age:</strong> {{ formatAgeRange(selectedGroup.filters.ageMin, selectedGroup.filters.ageMax) }}
                    </span>
                    <span v-if="selectedGroup.filters.sleepingRoomIds && selectedGroup.filters.sleepingRoomIds.length > 0" class="filter-tag">
                      <strong>Cabins:</strong> {{ formatSleepingRooms(selectedGroup.filters.sleepingRoomIds) }}
                    </span>
                    <span v-if="selectedGroup.filters.hasAllergies !== undefined" class="filter-tag">
                      <strong>Allergies:</strong> {{ selectedGroup.filters.hasAllergies ? 'Has allergies' : 'No allergies' }}
                    </span>
                    <span v-if="!hasAnyFilters(selectedGroup.filters)" class="text-secondary">
                      No filters applied (all campers)
                    </span>
                  </div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">
                    Matching Campers ({{ groupCampers.length }})
                  </div>
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
                          <span v-if="camper.sleepingRoomId">
                            • {{ getSleepingRoomName(camper.sleepingRoomId) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-secondary">
                    No campers match the current filter criteria.
                  </div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">Metadata</div>
                  <div class="text-sm text-secondary">
                    <div>Created: {{ formatDate(selectedGroup.createdAt) }}</div>
                    <div>Last Updated: {{ formatDate(selectedGroup.updatedAt) }}</div>
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

        <!-- Add/Edit Group Modal -->
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal modal-large">
            <div class="modal-header">
              <h3>{{ editingGroupId ? 'Edit Group' : 'Create New Group' }}</h3>
              <button class="btn btn-icon btn-secondary" @click="closeModal">✕</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveGroup">
                <div class="form-group">
                  <label class="form-label">Group Name *</label>
                  <input v-model="formData.name" type="text" class="form-input" required placeholder="e.g., Junior Campers" />
                </div>

                <div class="form-group">
                  <label class="form-label">Description</label>
                  <textarea 
                    v-model="formData.description" 
                    class="form-textarea" 
                    rows="2"
                    placeholder="Optional description of this group"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label class="form-label">Color</label>
                  <div class="color-picker">
                    <input v-model="formData.color" type="color" class="form-input-color" />
                    <input v-model="formData.color" type="text" class="form-input" placeholder="#6366F1" />
                  </div>
                </div>

                <div class="form-divider">
                  <span>Filter Criteria</span>
                </div>

                <div class="grid grid-cols-2">
                  <div class="form-group">
                    <label class="form-label">Minimum Age</label>
                    <input 
                      v-model.number="formData.filters.ageMin" 
                      type="number" 
                      min="5" 
                      max="18" 
                      class="form-input"
                      placeholder="No minimum"
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Maximum Age</label>
                    <input 
                      v-model.number="formData.filters.ageMax" 
                      type="number" 
                      min="5" 
                      max="18" 
                      class="form-input"
                      placeholder="No maximum"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Gender</label>
                  <select v-model="formData.filters.gender" class="form-select">
                    <option value="">Any gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Sleeping Rooms (Cabins)</label>
                  <div class="checkbox-group">
                    <label 
                      v-for="room in store.sleepingRooms" 
                      :key="room.id"
                      class="checkbox-label"
                    >
                      <input 
                        type="checkbox" 
                        :value="room.id"
                        v-model="formData.filters.sleepingRoomIds"
                      />
                      {{ room.name }} ({{ formatRoomGender(room.gender) }})
                    </label>
                    <div v-if="store.sleepingRooms.length === 0" class="text-sm text-secondary">
                      No sleeping rooms available
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Allergies</label>
                  <select v-model="formData.filters.hasAllergies" class="form-select">
                    <option :value="undefined">Any (with or without allergies)</option>
                    <option :value="true">Has allergies</option>
                    <option :value="false">No allergies</option>
                  </select>
                </div>

                <div class="form-info">
                  <strong>Preview:</strong> {{ getPreviewCount() }} campers match these criteria
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

      <!-- Confirmation Modal -->
      <ConfirmModal
        :show="showConfirmModal"
        title="Delete Group"
        :message="`Are you sure you want to delete the group '${groupToDelete?.name}'?`"
        details="This will not delete any campers, only the group definition."
        confirm-text="Delete"
        :danger-mode="true"
        @confirm="handleConfirmDelete"
        @cancel="handleCancelDelete"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useCampStore } from '@/stores/campStore';
import { format } from 'date-fns';
import type { CamperGroup, CamperGroupFilter } from '@/types/api';
import ConfirmModal from '@/components/ConfirmModal.vue';

export default defineComponent({
  name: 'Groups',
  components: {
    ConfirmModal,
  },
  data() {
    return {
      selectedGroupId: null as string | null,
      showModal: false,
      editingGroupId: null as string | null,
      showConfirmModal: false,
      groupToDelete: null as { id: string; name: string } | null,
      formData: {
        name: '',
        description: '',
        color: '#6366F1',
        filters: {
          ageMin: undefined as number | undefined,
          ageMax: undefined as number | undefined,
          gender: '' as '' | 'male' | 'female',
          sleepingRoomIds: [] as string[],
          hasAllergies: undefined as boolean | undefined,
        },
      },
    };
  },

  computed: {
    store() {
      return useCampStore();
    },
    selectedGroup() {
      if (!this.selectedGroupId) return null;
      return this.store.getCamperGroupById(this.selectedGroupId);
    },
    groupCampers() {
      if (!this.selectedGroupId) return [];
      return this.store.getCampersInGroup(this.selectedGroupId);
    },
  },

  methods: {
    getCampersCount(groupId: string): number {
      return this.store.getCampersInGroup(groupId).length;
    },
    formatGender(gender: string): string {
      return gender.charAt(0).toUpperCase() + gender.slice(1);
    },
    formatRoomGender(gender: string): string {
      return gender.charAt(0).toUpperCase() + gender.slice(1);
    },
    formatAgeRange(min?: number, max?: number): string {
      if (min !== undefined && max !== undefined) {
        return `${min}-${max} years`;
      } else if (min !== undefined) {
        return `${min}+ years`;
      } else if (max !== undefined) {
        return `Up to ${max} years`;
      }
      return 'Any age';
    },
    formatSleepingRooms(roomIds: string[]): string {
      return roomIds
        .map(id => this.store.getSleepingRoomById(id)?.name || 'Unknown')
        .join(', ');
    },
    getSleepingRoomName(roomId: string): string {
      const room = this.store.getSleepingRoomById(roomId);
      return room?.name || 'Unknown Room';
    },
    formatDate(dateStr: string): string {
      return format(new Date(dateStr), 'MMMM d, yyyy h:mm a');
    },
    hasAnyFilters(filters: CamperGroupFilter): boolean {
      return !!(
        filters.ageMin !== undefined ||
        filters.ageMax !== undefined ||
        filters.gender ||
        (filters.sleepingRoomIds && filters.sleepingRoomIds.length > 0) ||
        filters.hasAllergies !== undefined
      );
    },
    getPreviewCount(): number {
      // Create a temporary filter to preview count
      const filters: CamperGroupFilter = {
        ageMin: this.formData.filters.ageMin,
        ageMax: this.formData.filters.ageMax,
        gender: this.formData.filters.gender || undefined,
        sleepingRoomIds: this.formData.filters.sleepingRoomIds.length > 0 
          ? this.formData.filters.sleepingRoomIds 
          : undefined,
        hasAllergies: this.formData.filters.hasAllergies,
      };

      // Use the store's filter logic
      return this.store.campers.filter(camper => {
        if (filters.ageMin !== undefined && camper.age < filters.ageMin) return false;
        if (filters.ageMax !== undefined && camper.age > filters.ageMax) return false;
        if (filters.gender && camper.gender !== filters.gender) return false;
        if (filters.sleepingRoomIds && filters.sleepingRoomIds.length > 0) {
          if (!camper.sleepingRoomId || !filters.sleepingRoomIds.includes(camper.sleepingRoomId)) {
            return false;
          }
        }
        if (filters.hasAllergies !== undefined) {
          const hasAllergies = camper.allergies && camper.allergies.length > 0;
          if (filters.hasAllergies !== hasAllergies) return false;
        }
        return true;
      }).length;
    },
    selectGroup(groupId: string) {
      this.selectedGroupId = groupId;
    },
    editGroup() {
      if (!this.selectedGroup) return;
      
      this.editingGroupId = this.selectedGroup.id;
      this.formData = {
        name: this.selectedGroup.name,
        description: this.selectedGroup.description || '',
        color: this.selectedGroup.color || '#6366F1',
        filters: {
          ageMin: this.selectedGroup.filters.ageMin,
          ageMax: this.selectedGroup.filters.ageMax,
          gender: this.selectedGroup.filters.gender || '',
          sleepingRoomIds: [...(this.selectedGroup.filters.sleepingRoomIds || [])],
          hasAllergies: this.selectedGroup.filters.hasAllergies,
        },
      };
      
      this.selectedGroupId = null;
      this.showModal = true;
    },
    async saveGroup() {
      const filters: CamperGroupFilter = {
        ageMin: this.formData.filters.ageMin,
        ageMax: this.formData.filters.ageMax,
        gender: this.formData.filters.gender || undefined,
        sleepingRoomIds: this.formData.filters.sleepingRoomIds.length > 0 
          ? this.formData.filters.sleepingRoomIds 
          : undefined,
        hasAllergies: this.formData.filters.hasAllergies,
      };

      const groupData: CamperGroup = {
        id: this.editingGroupId || `group-${Date.now()}`,
        name: this.formData.name,
        description: this.formData.description || undefined,
        color: this.formData.color || '#6366F1',
        filters,
        createdAt: this.editingGroupId 
          ? this.store.getCamperGroupById(this.editingGroupId)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (this.editingGroupId) {
        await this.store.updateCamperGroup(groupData);
      } else {
        await this.store.addCamperGroup(groupData);
      }

      this.closeModal();
    },
    deleteGroupConfirm() {
      if (!this.selectedGroupId) return;
      const group = this.store.getCamperGroupById(this.selectedGroupId);
      if (!group) return;
      
      this.groupToDelete = {
        id: this.selectedGroupId,
        name: group.name
      };
      this.showConfirmModal = true;
    },
    async handleConfirmDelete() {
      if (!this.groupToDelete) return;
      
      await this.store.deleteCamperGroup(this.groupToDelete.id);
      this.selectedGroupId = null;
      this.showConfirmModal = false;
      this.groupToDelete = null;
    },
    handleCancelDelete() {
      this.showConfirmModal = false;
      this.groupToDelete = null;
    },
    closeModal() {
      this.showModal = false;
      this.editingGroupId = null;
      this.formData = {
        name: '',
        description: '',
        color: '#6366F1',
        filters: {
          ageMin: undefined,
          ageMax: undefined,
          gender: '',
          sleepingRoomIds: [],
          hasAllergies: undefined,
        },
      };
    }
  }
});
</script>

<style scoped>
.groups-view {
  max-width: 1400px;
  margin: 0 auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.view-description {
  margin-bottom: 2rem;
  color: var(--text-secondary);
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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
  flex: 1;
}

.group-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.group-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--background-secondary);
  border-radius: var(--radius);
  font-size: 0.875rem;
}

.filter-tag strong {
  color: var(--text-secondary);
  font-weight: 500;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state svg {
  margin: 0 auto 1.5rem;
  color: var(--text-secondary);
  opacity: 0.5;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.campers-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
}

.camper-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--background-secondary);
  border-radius: var(--radius);
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
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.camper-info {
  flex: 1;
  min-width: 0;
}

.camper-name {
  font-weight: 500;
  color: var(--text-primary);
}

.camper-meta {
  margin-top: 0.25rem;
}

.modal-large {
  max-width: 700px;
}

.form-divider {
  margin: 1.5rem 0;
  text-align: center;
  position: relative;
}

.form-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border-color);
}

.form-divider span {
  position: relative;
  background: var(--background);
  padding: 0 1rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
}

.color-picker {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.form-input-color {
  width: 60px;
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  cursor: pointer;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  background: var(--background-secondary);
  border-radius: var(--radius);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

.form-info {
  padding: 1rem;
  background: var(--info-bg, #EFF6FF);
  border: 1px solid var(--info-border, #BFDBFE);
  border-radius: var(--radius);
  color: var(--info-text, #1E40AF);
  font-size: 0.875rem;
}

.grid-cols-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
</style>

