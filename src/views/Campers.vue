<template>
  <div class="container">
    <div class="campers-view">
      <div class="view-header">
        <h2>Campers Management</h2>
        <div class="header-actions">
          <button class="btn btn-primary" @click="showModal = true">+ Add Camper</button>
        </div>
      </div>

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
        <div 
          v-for="camper in filteredCampers"
          :key="camper.id"
          class="camper-card card"
          @click="selectCamper(camper.id)"
        >
          <div class="camper-avatar">
            {{ camper.firstName.charAt(0) }}{{ camper.lastName.charAt(0) }}
          </div>
          <div class="camper-details">
            <h4>{{ camper.firstName }} {{ camper.lastName }}</h4>
            <div class="camper-meta">
              <span class="badge badge-primary">Age {{ camper.age }}</span>
              <span class="badge badge-primary">{{ formatGender(camper.gender) }}</span>
              <span v-if="camper.allergies && camper.allergies.length > 0" class="badge badge-warning">
                {{ camper.allergies.length }} Allergy(ies)
              </span>
            </div>
            <div class="camper-contact text-sm text-secondary mt-1">
              {{ camper.parentContact }}
            </div>
            <div class="camper-events text-sm mt-2">
              <strong>Today's Events:</strong> {{ getCamperTodayEvents(camper.id).length }}
            </div>
          </div>
        </div>
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
            <div class="camper-avatar-sm">
              {{ item.firstName.charAt(0) }}{{ item.lastName.charAt(0) }}
            </div>
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
      <Teleport to="body">
        <div v-if="selectedCamperId" class="modal-overlay" @click.self="selectedCamperId = null">
          <div class="modal">
            <div class="modal-header">
              <h3>{{ selectedCamper?.firstName }} {{ selectedCamper?.lastName }}</h3>
              <button class="btn btn-icon btn-secondary" @click="selectedCamperId = null">✕</button>
            </div>
            <div class="modal-body">
              <div v-if="selectedCamper">
                <div class="detail-section">
                  <div class="detail-label">Age</div>
                  <div>{{ selectedCamper.age }} years old</div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">Parent Contact</div>
                  <div>{{ selectedCamper.parentContact }}</div>
                </div>

                <div v-if="selectedCamper.allergies && selectedCamper.allergies.length > 0" class="detail-section">
                  <div class="detail-label">Allergies</div>
                  <div class="flex gap-1 flex-wrap">
                    <span v-for="allergy in selectedCamper.allergies" :key="allergy" class="badge badge-warning">
                      {{ allergy }}
                    </span>
                  </div>
                </div>

                <div v-if="selectedCamper.medicalNotes" class="detail-section">
                  <div class="detail-label">Medical Notes</div>
                  <div>{{ selectedCamper.medicalNotes }}</div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">Gender</div>
                  <div>
                    <span class="badge badge-primary">{{ formatGender(selectedCamper.gender) }}</span>
                  </div>
                </div>

                <div v-if="selectedCamper.registrationDate" class="detail-section">
                  <div class="detail-label">Registration Date</div>
                  <div>{{ formatDate(selectedCamper.registrationDate) }}</div>
                </div>

                <div class="detail-section">
                  <div class="detail-label">Family Group</div>
                  <div v-if="selectedCamper.familyGroupId && getFamilyGroup(selectedCamper.familyGroupId)">
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
                </div>

                <div class="detail-section">
                  <div class="detail-label">Enrolled Events</div>
                  <EventsByDate 
                    :events="getCamperEvents(selectedCamper.id)"
                    empty-message="No events enrolled"
                  />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-error" @click="deleteCamperConfirm">Delete Camper</button>
              <button class="btn btn-secondary" @click="editCamper">Edit</button>
              <button class="btn btn-secondary" @click="selectedCamperId = null">Close</button>
            </div>
          </div>
        </div>

        <!-- Add/Edit Camper Modal -->
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal">
            <div class="modal-header">
              <h3>{{ editingCamperId ? 'Edit Camper' : 'Add New Camper' }}</h3>
              <button class="btn btn-icon btn-secondary" @click="closeModal">✕</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveCamper">
                <div class="grid grid-cols-2">
                  <div class="form-group">
                    <label class="form-label">First Name</label>
                    <input v-model="formData.firstName" type="text" class="form-input" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Last Name</label>
                    <input v-model="formData.lastName" type="text" class="form-input" required />
                  </div>
                </div>

                <div class="grid grid-cols-2">
                  <div class="form-group">
                    <label class="form-label">Age</label>
                    <input v-model.number="formData.age" type="number" min="5" max="18" class="form-input" required />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Gender</label>
                    <select v-model="formData.gender" class="form-select" required>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Parent Contact (Email/Phone)</label>
                  <input v-model="formData.parentContact" type="text" class="form-input" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Family Group</label>
                  <select v-model="formData.familyGroupId" class="form-select" required>
                    <option value="">Select a family group...</option>
                    <option 
                      v-for="group in store.familyGroups"
                      :key="group.id"
                      :value="group.id"
                    >
                      {{ group.name }} - {{ getSleepingRoomName(group.sleepingRoomId) }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Allergies (comma-separated)</label>
                  <input v-model="allergiesInput" type="text" class="form-input" placeholder="e.g., Peanuts, Dairy" />
                </div>

                <div class="form-group">
                  <label class="form-label">Medical Notes</label>
                  <textarea v-model="formData.medicalNotes" class="form-textarea"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button class="btn btn-primary" @click="saveCamper">
                {{ editingCamperId ? 'Update' : 'Add' }} Camper
              </button>
            </div>
          </div>
        </div>
      </Teleport>

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
import type { Camper } from '@/types/api';
import ConfirmModal from '@/components/ConfirmModal.vue';
import FilterBar, { type Filter } from '@/components/FilterBar.vue';
import EventsByDate from '@/components/EventsByDate.vue';
import DataTable from '@/components/DataTable.vue';
import ViewToggle from '@/components/ViewToggle.vue';

export default defineComponent({
  name: 'Campers',
  components: {
    ConfirmModal,
    FilterBar,
    EventsByDate,
    DataTable,
    ViewToggle
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
    store() {
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
    selectedCamper() {
      if (!this.selectedCamperId) return null;
      return this.store.getCamperById(this.selectedCamperId);
    },
    filteredCampers() {
      let campers = this.store.campers;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        campers = campers.filter(camper =>
          camper.firstName.toLowerCase().includes(query) ||
          camper.lastName.toLowerCase().includes(query) ||
          `${camper.firstName} ${camper.lastName}`.toLowerCase().includes(query)
        );
      }

      // Gender filter
      if (this.filterGender) {
        campers = campers.filter(camper => camper.gender === this.filterGender);
      }

      // Age filter
      if (this.filterAge) {
        const [min, max] = this.filterAge === '15+' 
          ? [15, 999] 
          : this.filterAge.split('-').map(Number);
        campers = campers.filter(camper => camper.age >= min && (max ? camper.age <= max : true));
      }

      return campers;
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
  },

  methods: {
    clearFilters() {
      this.searchQuery = '';
      this.filterGender = '';
      this.filterAge = '';
    },
    getCamperTodayEvents(camperId: string) {
      const today = new Date();
      return this.store.camperEvents(camperId).filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate.toDateString() === today.toDateString();
      });
    },
    getCamperEvents(camperId: string) {
      return this.store.camperEvents(camperId);
    },
    formatDate(dateStr: string): string {
      return format(new Date(dateStr), 'MMMM d, yyyy');
    },
    getSleepingRoomName(roomId: string): string {
      const room = this.store.getSleepingRoomById(roomId);
      return room?.name || 'Unknown Room';
    },
    getFamilyGroup(familyGroupId: string) {
      return this.store.getFamilyGroupById(familyGroupId);
    },
    formatGender(gender: string): string {
      return gender.charAt(0).toUpperCase() + gender.slice(1);
    },
    selectCamper(camperId: string) {
      this.selectedCamperId = camperId;
    },
    editCamper() {
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
    async saveCamper() {
      const allergies = this.allergiesInput
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const camperData: Camper = {
        id: this.editingCamperId || `camper-${Date.now()}`,
        firstName: this.formData.firstName,
        lastName: this.formData.lastName,
        age: this.formData.age,
        gender: this.formData.gender,
        parentContact: this.formData.parentContact,
        allergies,
        medicalNotes: this.formData.medicalNotes,
        familyGroupId: this.formData.familyGroupId || undefined,
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
    deleteCamperConfirm() {
      if (!this.selectedCamperId) return;
      const camper = this.store.getCamperById(this.selectedCamperId);
      if (!camper) return;
      
      this.camperToDelete = {
        id: this.selectedCamperId,
        name: `${camper.firstName} ${camper.lastName}`
      };
      this.showConfirmModal = true;
    },
    async handleConfirmDelete() {
      if (!this.camperToDelete) return;
      
      await this.store.deleteCamper(this.camperToDelete.id);
      this.selectedCamperId = null;
      this.showConfirmModal = false;
      this.camperToDelete = null;
    },
    handleCancelDelete() {
      this.showConfirmModal = false;
      this.camperToDelete = null;
    },
    closeModal() {
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
  }
});
</script>

<style scoped>
.campers-view {
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

.campers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.camper-card {
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  gap: 1rem;
}

.camper-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.camper-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  flex-shrink: 0;
}

.camper-details {
  flex: 1;
  min-width: 0;
}

.camper-details h4 {
  margin-bottom: 0.5rem;
}

.camper-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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


