<template>
  <div class="container">
    <div class="campers-view">
      <ViewHeader title="Campers Management">
        <template #actions>
          <button class="btn btn-primary" @click="showModal = true">+ Add Camper</button>
        </template>
      </ViewHeader>

      <!-- Search and Filters -->
      <FilterBar
        v-model:searchQuery="searchQuery"
        v-model:filterGender="filterGender"
        v-model:filterAge="filterAge"
        :filters="campersFilters"
        :filtered-count="filteredCampers.length"
        :total-count="store.campers.length"
        @clear="clearFilters"
      >
        <template #prepend>
          <ViewToggle v-model="viewMode" />
        </template>
      </FilterBar>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="campers-grid">
        <CamperCard
          v-for="camper in filteredCampers"
          :key="camper.id"
          :camper="camper"
          :formatted-gender="formatGender(camper.gender)"
          :today-events-count="getCamperTodayEvents(camper.id).length"
          @click="selectCamper(camper.id)"
        />
      </div>

      <!-- Table View -->
      <DataTable
        v-if="viewMode === 'table'"
        :columns="camperColumns"
        :data="filteredCampers"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        row-key="id"
      >
        <template #cell-name="{ item }">
          <div class="camper-name-content">
            <AvatarInitials
              :first-name="item.firstName"
              :last-name="item.lastName"
              size="sm"
            />
            <div class="camper-fullname">{{ item.firstName }} {{ item.lastName }}</div>
          </div>
        </template>
        
        <template #cell-gender="{ item }">
          <span class="badge badge-primary badge-sm">{{ formatGender(item.gender) }}</span>
        </template>
        
        <template #cell-allergies="{ item }">
          <span v-if="item.allergies && item.allergies.length > 0" class="badge badge-warning badge-sm">
            {{ item.allergies.length }} allergy(ies)
          </span>
          <span v-else class="text-secondary">None</span>
        </template>
        
        <template #cell-events="{ item }">
          <span class="event-count">{{ getCamperTodayEvents(item.id).length }}</span>
        </template>
        
        <template #cell-actions="{ item }">
          <button class="btn btn-sm btn-secondary" @click.stop="selectCamper(item.id)">
            View Details
          </button>
        </template>
      </DataTable>

      <!-- Camper Detail Modal -->
      <CamperDetailModal
        :show="!!selectedCamperId"
        :camper="selectedCamper"
        @close="selectedCamperId = null"
        @edit="editCamper"
        @delete="deleteCamperConfirm"
      >
        <template #family-group>
          <div v-if="selectedCamper?.familyGroupId && getFamilyGroup(selectedCamper.familyGroupId)">
            <div class="family-group-info">
              <span class="badge" :style="{ background: getFamilyGroup(selectedCamper.familyGroupId)?.color || '#6366F1' }">
                {{ getFamilyGroup(selectedCamper.familyGroupId)?.name }}
              </span>
              <div v-if="getFamilyGroup(selectedCamper.familyGroupId)?.sleepingRoomId" class="text-xs text-secondary mt-1">
                Room: {{ getSleepingRoomName(getFamilyGroup(selectedCamper.familyGroupId)?.sleepingRoomId || '') }}
              </div>
            </div>
          </div>
          <div v-else class="text-secondary">Not assigned to a family group</div>
        </template>
        <template #events>
          <EventsByDate 
            :events="selectedCamper ? getCamperEvents(selectedCamper.id) : []"
            empty-message="No events enrolled"
          />
        </template>
      </CamperDetailModal>

      <!-- Add/Edit Camper Modal -->
      <CamperFormModal
        :show="showModal"
        :is-editing="!!editingCamperId"
        :form-data="formData"
        :family-groups="store.familyGroups"
        @close="closeModal"
        @save="saveCamper"
      />

      <!-- Confirmation Modal -->
      <ConfirmModal
        :show="showConfirmModal"
        title="Delete Camper"
        :message="`Are you sure you want to delete ${camperToDelete?.name}?`"
        details="This action cannot be undone. The camper will be removed from all events and their sleeping room assignment."
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
import type { Camper, FamilyGroup, Event } from '@/types/api';
import ViewHeader from '@/components/ViewHeader.vue';
import AvatarInitials from '@/components/AvatarInitials.vue';
import CamperCard from '@/components/cards/CamperCard.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import FilterBar, { type Filter } from '@/components/FilterBar.vue';
import EventsByDate from '@/components/EventsByDate.vue';
import DataTable from '@/components/DataTable.vue';
import ViewToggle from '@/components/ViewToggle.vue';
import Autocomplete from '@/components/Autocomplete.vue';
import CamperDetailModal from '@/components/modals/CamperDetailModal.vue';
import CamperFormModal from '@/components/modals/CamperFormModal.vue';

export default defineComponent({
  name: 'Campers',
  components: {
    ViewHeader,
    AvatarInitials,
    CamperCard,
    ConfirmModal,
    FilterBar,
    EventsByDate,
    DataTable,
    ViewToggle,
    Autocomplete,
    CamperDetailModal,
    CamperFormModal
  },
  data() {
    return {
      selectedCamperId: null as string | null,
      showModal: false,
      editingCamperId: null as string | null,
      allergiesInput: '',
      viewMode: 'grid' as 'grid' | 'table',
      currentPage: 1,
      pageSize: 10,
      showConfirmModal: false,
      camperToDelete: null as { id: string; name: string } | null,
      formData: {
        firstName: '',
        lastName: '',
        age: 8,
        gender: 'male' as 'male' | 'female',
        parentContact: '',
        allergies: [] as string[],
        medicalNotes: '',
        familyGroupId: '' as string | undefined,
      },
      searchQuery: '',
      filterGender: '',
      filterAge: '',
      camperColumns: [
        { key: 'name', label: 'Name', width: '200px' },
        { key: 'age', label: 'Age', width: '80px' },
        { key: 'gender', label: 'Gender', width: '100px' },
        { key: 'parentContact', label: 'Parent Contact', width: '250px' },
        { key: 'allergies', label: 'Allergies', width: '120px' },
        { key: 'events', label: "Today's Events", width: '120px' },
        { key: 'actions', label: 'Actions', width: '140px' },
      ]
    };
  },
  computed: {
    store(): ReturnType<typeof useCampStore> {
      return useCampStore();
    },
    campersFilters(): Filter[] {
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
          model: 'filterAge',
          value: this.filterAge,
          placeholder: 'All Ages',
          options: [
            { label: '6-8 years', value: '6-8' },
            { label: '9-11 years', value: '9-11' },
            { label: '12-14 years', value: '12-14' },
            { label: '15+ years', value: '15+' },
          ],
        },
      ];
    },
    selectedCamper(): Camper | null {
      if (!this.selectedCamperId) return null;
      return this.store.getCamperById(this.selectedCamperId) || null;
    },
    filteredCampers(): Camper[] {
      let campers: Camper[] = this.store.campers;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        campers = campers.filter((camper: Camper) =>
          camper.firstName.toLowerCase().includes(query) ||
          camper.lastName.toLowerCase().includes(query) ||
          `${camper.firstName} ${camper.lastName}`.toLowerCase().includes(query)
        );
      }

      // Gender filter
      if (this.filterGender) {
        campers = campers.filter((camper: Camper) => camper.gender === this.filterGender);
      }

      // Age filter
      if (this.filterAge) {
        const [min, max] = this.filterAge === '15+' 
          ? [15, 999] 
          : this.filterAge.split('-').map(Number);
        campers = campers.filter((camper: Camper) => camper.age >= min && (max ? camper.age <= max : true));
      }

      return campers;
    }
  },
  methods: {
    clearFilters(): void {
      this.searchQuery = '';
      this.filterGender = '';
      this.filterAge = '';
    },
    getCamperTodayEvents(camperId: string): Event[] {
      const today = new Date();
      return this.store.camperEvents(camperId).filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate.toDateString() === today.toDateString();
      });
    },
    getCamperEvents(camperId: string): Event[] {
      return this.store.camperEvents(camperId);
    },
    formatDate(dateStr: string): string {
      return format(new Date(dateStr), 'MMMM d, yyyy');
    },
    getSleepingRoomName(roomId: string): string {
      const room = this.store.getSleepingRoomById(roomId);
      return room?.name || 'Unknown Room';
    },
    getFamilyGroup(familyGroupId: string): FamilyGroup | null | undefined {
      return this.store.getFamilyGroupById(familyGroupId);
    },
    formatGender(gender: string): string {
      return gender.charAt(0).toUpperCase() + gender.slice(1);
    },
    selectCamper(camperId: string): void {
      this.selectedCamperId = camperId;
    },
    editCamper(): void {
      if (!this.selectedCamper) return;
      
      this.editingCamperId = this.selectedCamper.id;
      this.formData = {
        firstName: this.selectedCamper.firstName,
        lastName: this.selectedCamper.lastName,
        age: this.selectedCamper.age,
        gender: this.selectedCamper.gender,
        parentContact: this.selectedCamper.parentContact,
        allergies: this.selectedCamper.allergies || [],
        medicalNotes: this.selectedCamper.medicalNotes || '',
        familyGroupId: this.selectedCamper.familyGroupId,
      };
      this.allergiesInput = (this.selectedCamper.allergies || []).join(', ');
      
      this.selectedCamperId = null;
      this.showModal = true;
    },
    async saveCamper(formData: typeof this.formData & { allergies: string[] }): Promise<void> {
      const camperData: Camper = {
        id: this.editingCamperId || `camper-${Date.now()}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: formData.age,
        gender: formData.gender,
        parentContact: formData.parentContact,
        allergies: formData.allergies,
        medicalNotes: formData.medicalNotes,
        familyGroupId: formData.familyGroupId || undefined,
        registrationDate: this.editingCamperId 
          ? this.store.getCamperById(this.editingCamperId)?.registrationDate 
          : new Date().toISOString(),
      };

      if (this.editingCamperId) {
        await this.store.updateCamper(camperData);
      } else {
        await this.store.addCamper(camperData);
      }

      this.closeModal();
    },
    deleteCamperConfirm(): void {
      if (!this.selectedCamperId) return;
      const camper = this.store.getCamperById(this.selectedCamperId);
      if (!camper) return;
      
      this.camperToDelete = {
        id: this.selectedCamperId,
        name: `${camper.firstName} ${camper.lastName}`
      };
      this.showConfirmModal = true;
    },
    async handleConfirmDelete(): Promise<void> {
      if (!this.camperToDelete) return;
      
      await this.store.deleteCamper(this.camperToDelete.id);
      this.selectedCamperId = null;
      this.showConfirmModal = false;
      this.camperToDelete = null;
    },
    handleCancelDelete(): void {
      this.showConfirmModal = false;
      this.camperToDelete = null;
    },
    closeModal(): void {
      this.showModal = false;
      this.editingCamperId = null;
      this.formData = {
        firstName: '',
        lastName: '',
        age: 8,
        gender: 'male',
        parentContact: '',
        allergies: [],
        medicalNotes: '',
        familyGroupId: '',
      };
      this.allergiesInput = '';
    }
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    filterGender() {
      this.currentPage = 1;
    },
    filterAge() {
      this.currentPage = 1;
    }
  }
});
</script>

<style scoped>
.campers-view {
  max-width: 1400px;
  margin: 0 auto;
}

.campers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.family-group-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Table View Styles */
/* Table cell custom styles */
.camper-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.camper-fullname {
  font-weight: 500;
  color: var(--text-primary);
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


