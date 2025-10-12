<template>
  <div class="container">
    <div class="groups-view">
      <ViewHeader 
        title="Camper Groups" 
        tooltip="Create virtual groups of campers based on criteria like age, gender, or cabin. Use these groups to quickly assign multiple campers to events."
      >
        <template #actions>
          <button class="btn btn-primary" @click="showModal = true">+ Create Group</button>
        </template>
      </ViewHeader>

      <!-- Search and Filters -->
      <FilterBar
        v-model:searchQuery="searchQuery"
        v-model:filter-gender="filterGender"
        v-model:filter-age-range="filterAgeRange"
        :filters="groupsFilters"
        :filtered-count="filteredGroups.length"
        :total-count="store.camperGroups.length"
        search-placeholder="Search groups..."
        @clear="clearFilters"
      >
        <template #prepend>
          <ViewToggle v-model="viewMode" />
        </template>
      </FilterBar>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="groups-grid">
        <GroupCard
          v-for="group in filteredGroups"
          :key="group.id"
          :group="group"
          :campers-count="getCampersCount(group.id)"
          @click="selectGroup(group.id)"
        >
          <template #filters>
            <span v-if="group.filters.gender" class="filter-tag">
              <strong>Gender:</strong> {{ formatGender(group.filters.gender) }}
            </span>
            <span v-if="group.filters.ageMin !== undefined || group.filters.ageMax !== undefined" class="filter-tag">
              <strong>Age:</strong> {{ formatAgeRange(group.filters.ageMin, group.filters.ageMax) }}
            </span>
            <span v-if="group.filters.hasAllergies !== undefined" class="filter-tag">
              <strong>Allergies:</strong> {{ group.filters.hasAllergies ? 'Has allergies' : 'No allergies' }}
            </span>
          </template>
        </GroupCard>

        <EmptyState
          v-if="filteredGroups.length === 0 && store.camperGroups.length === 0"
          type="empty"
          title="No Groups Yet"
          message="Create your first camper group to organize and manage campers more efficiently."
          action-text="Create Group"
          @action="showModal = true"
        >
          <template #icon>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </template>
        </EmptyState>

        <EmptyState
          v-if="filteredGroups.length === 0 && store.camperGroups.length > 0"
          type="no-results"
          title="No Groups Found"
          message="No groups match your current filters. Try adjusting your search criteria."
          action-text="Clear Filters"
          action-button-class="btn-secondary"
          @action="clearFilters"
        />
      </div>

      <!-- Table View -->
      <DataTable
        v-if="viewMode === 'table'"
        :columns="groupColumns"
        :data="filteredGroups"
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
        
        <template #cell-description="{ item }">
          <span class="text-secondary">{{ item.description || 'No description' }}</span>
        </template>
        
        <template #cell-criteria="{ item }">
          <div class="criteria-tags">
            <span v-if="item.filters.gender" class="badge badge-sm badge-primary">
              {{ formatGender(item.filters.gender) }}
            </span>
            <span v-if="item.filters.ageMin !== undefined || item.filters.ageMax !== undefined" class="badge badge-sm badge-primary">
              {{ formatAgeRange(item.filters.ageMin, item.filters.ageMax) }}
            </span>
            <span v-if="item.filters.hasAllergies !== undefined" class="badge badge-sm badge-warning">
              {{ item.filters.hasAllergies ? 'Allergies' : 'No allergies' }}
            </span>
            <span v-if="!hasAnyFilters(item.filters)" class="text-secondary text-sm">All campers</span>
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

      <!-- Group Detail Modal -->
      <GroupDetailModal
        :show="!!selectedGroupId"
        :group="selectedGroup"
        :campers="groupCampers"
        @close="selectedGroupId = null"
        @edit="editGroup"
        @delete="deleteGroupConfirm"
      >
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
            No campers match the current filter criteria.
          </div>
        </template>
      </GroupDetailModal>

      <!-- Add/Edit Group Modal -->
      <GroupFormModal
        :show="showModal"
        :is-editing="!!editingGroupId"
        :form-data="formData"
        :preview-count="getPreviewCount()"
        :family-groups="store.familyGroups"
        :campers="store.campers"
        @close="closeModal"
        @save="saveGroup"
      />

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
import type { CamperGroup, CamperGroupFilter, Camper } from '@/types/api';
import ViewHeader from '@/components/ViewHeader.vue';
import EmptyState from '@/components/EmptyState.vue';
import ColorIndicator from '@/components/ColorIndicator.vue';
import GroupCard from '@/components/cards/GroupCard.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import ColorPicker from '@/components/ColorPicker.vue';
import FilterBar, { type Filter } from '@/components/FilterBar.vue';
import DataTable from '@/components/DataTable.vue';
import ViewToggle from '@/components/ViewToggle.vue';
import Autocomplete from '@/components/Autocomplete.vue';
import InfoTooltip from '@/components/InfoTooltip.vue';
import GroupDetailModal from '@/components/modals/GroupDetailModal.vue';
import GroupFormModal from '@/components/modals/GroupFormModal.vue';

export default defineComponent({
  name: 'Groups',
  components: {
    ViewHeader,
    EmptyState,
    ColorIndicator,
    GroupCard,
    ConfirmModal,
    ColorPicker,
    FilterBar,
    DataTable,
    ViewToggle,
    Autocomplete,
    InfoTooltip,
    GroupDetailModal,
    GroupFormModal,
  },
  data() {
    return {
      selectedGroupId: null as string | null,
      showModal: false,
      editingGroupId: null as string | null,
      showConfirmModal: false,
      groupToDelete: null as { id: string; name: string } | null,
      searchQuery: '',
      filterGender: '',
      filterAgeRange: '',
      viewMode: 'grid' as 'grid' | 'table',
      currentPage: 1,
      pageSize: 10,
      formData: {
        name: '',
        description: '',
        color: '#6366F1',
        filters: {
          ageMin: undefined as number | undefined,
          ageMax: undefined as number | undefined,
          gender: '' as '' | 'male' | 'female',
          hasAllergies: undefined as boolean | undefined,
        },
        familyGroupIds: [] as string[],
      },
      groupColumns: [
        { key: 'name', label: 'Group Name', width: '200px' },
        { key: 'description', label: 'Description', width: '250px' },
        { key: 'criteria', label: 'Filter Criteria', width: '250px' },
        { key: 'campers', label: 'Campers', width: '100px' },
        { key: 'actions', label: 'Actions', width: '140px' },
      ]
    };
  },

  computed: {
    store(): ReturnType<typeof useCampStore> {
      return useCampStore();
    },
    groupsFilters(): Filter[] {
      return [
        {
          model: 'filterGender',
          value: this.filterGender,
          placeholder: 'All Genders',
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ],
        },
        {
          model: 'filterAgeRange',
          value: this.filterAgeRange,
          placeholder: 'All Age Ranges',
          options: [
            { label: '6-8 years', value: '6-8' },
            { label: '9-11 years', value: '9-11' },
            { label: '12-14 years', value: '12-14' },
            { label: '15+ years', value: '15+' },
          ],
        },
      ];
    },
    selectedGroup(): CamperGroup | null {
      if (!this.selectedGroupId) return null;
      return this.store.getCamperGroupById(this.selectedGroupId) || null;
    },
    groupCampers(): Camper[] {
      if (!this.selectedGroupId) return [];
      return this.store.getCampersInGroup(this.selectedGroupId);
    },
    filteredGroups(): CamperGroup[] {
      let groups: CamperGroup[] = this.store.camperGroups;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        groups = groups.filter((group: CamperGroup) =>
          group.name.toLowerCase().includes(query) ||
          (group.description && group.description.toLowerCase().includes(query))
        );
      }

      // Gender filter
      if (this.filterGender) {
        groups = groups.filter((group: CamperGroup) => 
          group.filters.gender === this.filterGender
        );
      }

      // Age range filter
      if (this.filterAgeRange) {
        const [min, max] = this.filterAgeRange === '15+' 
          ? [15, 999] 
          : this.filterAgeRange.split('-').map(Number);
        
        groups = groups.filter((group: CamperGroup) => {
          // Check if the group's age range overlaps with the filter
          const groupMin = group.filters.ageMin ?? 0;
          const groupMax = group.filters.ageMax ?? 999;
          return !(groupMax < min || groupMin > max);
        });
      }

      return groups;
    },
  },

  methods: {
    clearFilters(): void {
      this.searchQuery = '';
      this.filterGender = '';
      this.filterAgeRange = '';
    },
    getCampersCount(groupId: string): number {
      return this.store.getCampersInGroup(groupId).length;
    },
    formatGender(gender: string): string {
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
    formatDate(dateStr: string): string {
      return format(new Date(dateStr), 'MMMM d, yyyy h:mm a');
    },
    hasAnyFilters(filters: CamperGroupFilter): boolean {
      return !!(
        filters.ageMin !== undefined ||
        filters.ageMax !== undefined ||
        filters.gender ||
        filters.hasAllergies !== undefined
      );
    },
    getPreviewCount(): number {
      // Determine base set of campers to filter
      let baseCampers: Camper[];
      
      if (this.formData.familyGroupIds && this.formData.familyGroupIds.length > 0) {
        // If family groups are selected, only consider campers from those family groups
        baseCampers = this.store.campers.filter(camper => 
          camper.familyGroupId && this.formData.familyGroupIds.includes(camper.familyGroupId)
        );
      } else {
        // If no family groups selected, consider all campers
        baseCampers = this.store.campers;
      }

      // Create a temporary filter to preview count
      const filters: CamperGroupFilter = {
        ageMin: this.formData.filters.ageMin,
        ageMax: this.formData.filters.ageMax,
        gender: this.formData.filters.gender || undefined,
        hasAllergies: this.formData.filters.hasAllergies,
      };

      // Apply filters to the base set of campers
      return baseCampers.filter(camper => {
        if (filters.ageMin !== undefined && camper.age < filters.ageMin) return false;
        if (filters.ageMax !== undefined && camper.age > filters.ageMax) return false;
        if (filters.gender && camper.gender !== filters.gender) return false;
        if (filters.hasAllergies !== undefined) {
          const hasAllergies = camper.allergies && camper.allergies.length > 0;
          if (filters.hasAllergies !== hasAllergies) return false;
        }
        return true;
      }).length;
    },
    selectGroup(groupId: string): void {
      this.selectedGroupId = groupId;
    },
    editGroup(): void {
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
          hasAllergies: this.selectedGroup.filters.hasAllergies,
        },
        familyGroupIds: this.selectedGroup.familyGroupIds || [],
      };
      
      this.selectedGroupId = null;
      this.showModal = true;
    },
    async saveGroup(formData: typeof this.formData): Promise<void> {
      const filters: CamperGroupFilter = {
        ageMin: formData.filters.ageMin,
        ageMax: formData.filters.ageMax,
        gender: formData.filters.gender || undefined,
        hasAllergies: formData.filters.hasAllergies,
      };

      const groupData: CamperGroup = {
        id: this.editingGroupId || `group-${Date.now()}`,
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color || '#6366F1',
        filters,
        familyGroupIds: formData.familyGroupIds.length > 0 ? formData.familyGroupIds : undefined,
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
    deleteGroupConfirm(): void {
      if (!this.selectedGroupId) return;
      const group = this.store.getCamperGroupById(this.selectedGroupId);
      if (!group) return;
      
      this.groupToDelete = {
        id: this.selectedGroupId,
        name: group.name
      };
      this.showConfirmModal = true;
    },
    async handleConfirmDelete(): Promise<void> {
      if (!this.groupToDelete) return;
      
      await this.store.deleteCamperGroup(this.groupToDelete.id);
      this.selectedGroupId = null;
      this.showConfirmModal = false;
      this.groupToDelete = null;
    },
    handleCancelDelete(): void {
      this.showConfirmModal = false;
      this.groupToDelete = null;
    },
    closeModal(): void {
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
          hasAllergies: undefined,
        },
        familyGroupIds: [],
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

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
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

.criteria-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.badge-sm {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
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

