<template>
  <div class="container">
    <div class="certifications-view">
      <ViewHeader title="Certification Management">
        <template #actions>
          <button class="btn btn-primary" @click="showModal = true">+ Add Certification</button>
        </template>
      </ViewHeader>

      <!-- Search and Filters -->
      <FilterBar
        v-model:searchQuery="searchQuery"
        v-model:filter-expiration="filterExpiration"
        :filters="certificationFilters"
        :filtered-count="filteredCertifications.length"
        :total-count="store.certifications.length"
        @clear="clearFilters"
      >
        <template #prepend>
          <ViewToggle v-model="viewMode" />
        </template>
      </FilterBar>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="certifications-grid">
        <CertificationCard
          v-for="certification in filteredCertifications"
          :key="certification.id"
          :certification="certification"
          @click="selectCertification(certification.id)"
        />
      </div>

      <!-- Table View -->
      <DataTable
        v-if="viewMode === 'table'"
        :columns="certificationColumns"
        :data="filteredCertifications"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        row-key="id"
      >
        <template #cell-name="{ item }">
          <div class="certification-name-content">
            <div class="certification-icon-sm">
              <Award :size="18" :stroke-width="2" />
            </div>
            <div class="certification-name">{{ item.name }}</div>
          </div>
        </template>
        
        <template #cell-expirationRequired="{ item }">
          <span class="badge badge-sm" :class="item.expirationRequired ? 'badge-warning' : 'badge-success'">
            {{ item.expirationRequired ? 'Time-limited' : 'Permanent' }}
          </span>
        </template>
        
        <template #cell-validityPeriodMonths="{ item }">
          <span v-if="item.expirationRequired && item.validityPeriodMonths">
            {{ item.validityPeriodMonths }} months
          </span>
          <span v-else class="text-secondary">N/A</span>
        </template>
        
        <template #cell-actions="{ item }">
          <button class="btn btn-sm btn-secondary" @click.stop="selectCertification(item.id)">
            View Details
          </button>
        </template>
      </DataTable>

      <!-- Certification Detail Modal -->
      <CertificationDetailModal
        :show="!!selectedCertificationId"
        :certification="selectedCertification"
        @close="selectedCertificationId = null"
        @edit="editCertification"
        @delete="deleteCertificationConfirm"
      />

      <!-- Add/Edit Certification Modal -->
      <CertificationFormModal
        :show="showModal"
        :is-editing="!!editingCertificationId"
        :form-data="formData"
        @close="closeModal"
        @save="saveCertification"
      />

      <!-- Confirm Delete Modal -->
      <ConfirmModal
        :show="showConfirmModal"
        title="Delete Certification"
        message="Are you sure you want to delete this certification?"
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
import type { Certification } from '@/types/api';
import ViewHeader from '@/components/ViewHeader.vue';
import CertificationCard from '@/components/cards/CertificationCard.vue';
import FilterBar, { type Filter } from '@/components/FilterBar.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import DataTable from '@/components/DataTable.vue';
import ViewToggle from '@/components/ViewToggle.vue';
import CertificationDetailModal from '@/components/modals/CertificationDetailModal.vue';
import CertificationFormModal from '@/components/modals/CertificationFormModal.vue';
import { Award } from 'lucide-vue-next';
import { useToast } from '@/composables/useToast';

export default defineComponent({
  name: 'Certifications',
  components: {
    ViewHeader,
    CertificationCard,
    FilterBar,
    ConfirmModal,
    DataTable,
    ViewToggle,
    CertificationDetailModal,
    CertificationFormModal,
    Award,
  },
  setup() {
    const store = useCampStore();
    const toast = useToast();
    return { store, toast };
  },
  data() {
    return {
      showModal: false,
      showConfirmModal: false,
      editingCertificationId: null as string | null,
      selectedCertificationId: null as string | null,
      searchQuery: '',
      filterExpiration: '',
      viewMode: 'grid' as 'grid' | 'table',
      currentPage: 1,
      pageSize: 10,
      formData: this.getEmptyFormData(),
      confirmAction: null as (() => void) | null,
      
      certificationColumns: [
        { key: 'name', label: 'Certification Name', sortable: true },
        { key: 'expirationRequired', label: 'Type', sortable: true },
        { key: 'validityPeriodMonths', label: 'Validity Period', sortable: true },
        { key: 'actions', label: '', width: '120px' },
      ],
    };
  },
  computed: {
    certificationFilters(): Filter[] {
      return [
        {
          model: 'filterExpiration',
          value: this.filterExpiration,
          placeholder: 'Filter by Type',
          options: [
            { value: 'time-limited', label: 'Time-limited' },
            { value: 'permanent', label: 'Permanent' },
          ],
        },
      ];
    },

    filteredCertifications(): Certification[] {
      let filtered = this.store.certifications;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter((cert) =>
          cert.name.toLowerCase().includes(query) ||
          cert.description?.toLowerCase().includes(query)
        );
      }

      // Expiration filter
      if (this.filterExpiration && this.filterExpiration !== '' && this.filterExpiration !== 'all') {
        if (this.filterExpiration === 'time-limited') {
          filtered = filtered.filter((cert) => cert.expirationRequired);
        } else if (this.filterExpiration === 'permanent') {
          filtered = filtered.filter((cert) => !cert.expirationRequired);
        }
      }

      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    },

    selectedCertification(): Certification | null {
      if (!this.selectedCertificationId) return null;
      return this.store.getCertificationById(this.selectedCertificationId);
    },
  },
  methods: {
    getEmptyFormData() {
      return {
        name: '',
        description: '',
        expirationRequired: false,
        validityPeriodMonths: undefined,
      };
    },

    selectCertification(id: string) {
      this.selectedCertificationId = id;
    },

    editCertification(certification: Certification) {
      this.editingCertificationId = certification.id;
      this.formData = {
        name: certification.name,
        description: certification.description || '',
        expirationRequired: certification.expirationRequired,
        validityPeriodMonths: certification.validityPeriodMonths,
      };
      this.selectedCertificationId = null;
      this.showModal = true;
    },

    async saveCertification(data: any) {
      try {
        if (this.editingCertificationId) {
          // Update existing
          await this.store.updateCertification({
            id: this.editingCertificationId,
            ...data,
            createdAt: this.store.getCertificationById(this.editingCertificationId)?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          this.toast.success('Certification updated successfully');
        } else {
          // Create new
          await this.store.addCertification({
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          this.toast.success('Certification added successfully');
        }
        this.closeModal();
      } catch (error: any) {
        this.toast.error(error.message || 'Failed to save certification');
      }
    },

    deleteCertificationConfirm(id: string) {
      this.confirmAction = () => this.deleteCertification(id);
      this.showConfirmModal = true;
      this.selectedCertificationId = null;
    },

    async deleteCertification(id: string) {
      try {
        await this.store.deleteCertification(id);
        this.toast.success('Certification deleted successfully');
      } catch (error: any) {
        this.toast.error(error.message || 'Failed to delete certification');
      }
    },

    closeModal() {
      this.showModal = false;
      this.editingCertificationId = null;
      this.formData = this.getEmptyFormData();
    },

    clearFilters() {
      this.searchQuery = '';
      this.filterExpiration = '';
    },

    handleConfirmAction() {
      if (this.confirmAction) {
        this.confirmAction();
        this.confirmAction = null;
      }
      this.showConfirmModal = false;
    },

    handleCancelConfirm() {
      this.confirmAction = null;
      this.showConfirmModal = false;
    },
  },
});
</script>

<style scoped>
.certifications-view {
  padding: 0;
}

.certifications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.certification-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.certification-icon-sm {
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  background: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.certification-name {
  font-weight: 500;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .certifications-view {
    padding: 1rem 0;
  }

  .certifications-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>

