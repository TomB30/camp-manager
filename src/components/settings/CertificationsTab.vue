<template>
  <div class="certifications-tab">
    <TabHeader
      title="Staff Certifications"
      description="Manage the certifications available for your staff members. Define which certifications are required and their validity periods."
      action-text="Certification"
      @action="showModal = true"
    >
      <template #action-icon>
        <Icon name="Plus" :size="18" />
      </template>
    </TabHeader>

    <!-- Search and Filters -->
    <FilterBar
      v-model:searchQuery="searchQuery"
      v-model:filter-expiration="filterExpiration"
      :filters="certificationFilters"
      :filtered-count="filteredCertifications.length"
      :total-count="certificationsStore.certifications.length"
      @clear="clearFilters"
    >
      <template #prepend>
        <ViewToggle v-model="viewMode" />
      </template>
    </FilterBar>

    <!-- Empty State -->
    <EmptyState
      v-if="certificationsStore.certifications.length === 0"
      type="empty"
      title="No Certifications Yet"
      message="Add your first certification to start tracking staff qualifications."
      action-text="Certification"
      @action="showModal = true"
      icon-name="Award"
    />

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="certifications-grid">
      <div
        v-for="certification in filteredCertifications"
        :key="certification.id"
        class="certification-card-wrapper"
      >
        <CertificationCard
          :certification="certification"
          @click="selectCertification(certification.id)"
        />
      </div>
    </div>

    <!-- Table View -->
    <DataTable
      v-else-if="viewMode === 'table' && filteredCertifications.length > 0"
      :columns="certificationColumns"
      :data="filteredCertifications"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      row-key="id"
    >
      <template #cell-name="{ item }">
        <div class="certification-name-content">
          <div class="certification-icon-sm">
            <Icon name="Award" :size="18" />
          </div>
          <div>{{ item.name }}</div>
        </div>
      </template>

      <template #cell-expirationRequired="{ item }">
        <span
          class="badge badge-sm"
          :class="item.expirationRequired ? 'badge-warning' : 'badge-success'"
        >
          {{ item.expirationRequired ? "Time-limited" : "Permanent" }}
        </span>
      </template>

      <template #cell-validityPeriodMonths="{ item }">
        <span v-if="item.expirationRequired && item.validityPeriodMonths">
          {{ item.validityPeriodMonths }} months
        </span>
        <span v-else class="text-secondary">N/A</span>
      </template>

      <template #cell-actions="{ item }">
        <button
          class="btn btn-sm btn-secondary"
          @click.stop="selectCertification(item.id)"
        >
          View Details
        </button>
      </template>
    </DataTable>

    <!-- Certification Detail Modal -->
    <CertificationDetailModal
      v-if="!!selectedCertificationId"
      :certification="selectedCertification"
      @close="selectedCertificationId = null"
      @edit="editCertificationFromDetail"
      @delete="deleteCertificationConfirm"
    />

    <!-- Add/Edit Certification Modal -->
    <CertificationFormModal
      v-if="showModal"
      :is-editing="!!editingCertificationId"
      :form-data="formData"
      @close="closeModal"
      @save="saveCertification"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      v-if="showConfirmModal"
      title="Delete Certification"
      message="Are you sure you want to delete this certification?"
      confirm-text="Delete"
      :danger-mode="true"
      @confirm="handleDeleteCertification"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useCertificationsStore } from "@/stores";
import type { Certification } from "@/types";
import Icon from "@/components/Icon.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import CertificationCard from "@/components/cards/CertificationCard.vue";
import CertificationDetailModal from "@/components/modals/CertificationDetailModal.vue";
import CertificationFormModal from "@/components/modals/CertificationFormModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import DataTable from "@/components/DataTable.vue";
import FilterBar, { type Filter } from "@/components/FilterBar.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import EmptyState from "@/components/EmptyState.vue";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "CertificationsTab",
  components: {
    Icon,
    TabHeader,
    CertificationCard,
    CertificationDetailModal,
    CertificationFormModal,
    ConfirmModal,
    DataTable,
    FilterBar,
    ViewToggle,
    EmptyState,
  },
  setup() {
    const certificationsStore = useCertificationsStore();
    const toast = useToast();
    return { certificationsStore, toast };
  },
  data() {
    return {
      showModal: false,
      showConfirmModal: false,
      editingCertificationId: null as string | null,
      selectedCertificationId: null as string | null,
      certificationToDelete: null as string | null,
      searchQuery: "",
      filterExpiration: "",
      viewMode: "grid" as "grid" | "table",
      currentPage: 1,
      pageSize: 10,
      formData: {
        name: "",
        description: "",
        validityPeriodMonths: undefined as number | undefined,
      },

      certificationColumns: [
        { key: "name", label: "Certification Name", sortable: true },
        { key: "expirationRequired", label: "Type", sortable: true },
        {
          key: "validityPeriodMonths",
          label: "Validity Period",
          sortable: true,
        },
        { key: "actions", label: "", width: "120px" },
      ],
    };
  },
  computed: {
    certificationFilters(): Filter[] {
      return [
        {
          model: "filterExpiration",
          value: this.filterExpiration,
          placeholder: "Filter by Type",
          options: [
            { value: "time-limited", label: "Time-limited" },
            { value: "permanent", label: "Permanent" },
          ],
        },
      ];
    },

    filteredCertifications(): Certification[] {
      let filtered = this.certificationsStore.certifications;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (cert) =>
            cert.name.toLowerCase().includes(query) ||
            cert.description?.toLowerCase().includes(query),
        );
      }

      // Expiration filter
      if (this.filterExpiration && this.filterExpiration !== "") {
        if (this.filterExpiration === "time-limited") {
          filtered = filtered.filter(
            (cert) => cert.validityPeriodMonths !== undefined,
          );
        } else if (this.filterExpiration === "permanent") {
          filtered = filtered.filter(
            (cert) => cert.validityPeriodMonths === undefined,
          );
        }
      }

      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    },

    selectedCertification(): Certification | null {
      if (!this.selectedCertificationId) return null;
      return (
        this.certificationsStore.getCertificationById(
          this.selectedCertificationId,
        ) || null
      );
    },
  },
  methods: {
    selectCertification(id: string) {
      this.selectedCertificationId = id;
    },

    editCertificationFromDetail(certification: Certification) {
      this.selectedCertificationId = null;
      this.editCertification(certification);
    },

    editCertification(certification: Certification) {
      this.editingCertificationId = certification.id;
      this.formData = {
        name: certification.name,
        description: certification.description || "",
        validityPeriodMonths: certification.validityPeriodMonths || undefined,
      };
      this.showModal = true;
    },

    deleteCertificationConfirm(id: string) {
      this.certificationToDelete = id;
      this.selectedCertificationId = null;
      this.showConfirmModal = true;
    },

    async handleDeleteCertification() {
      if (!this.certificationToDelete) return;

      try {
        await this.certificationsStore.deleteCertification(
          this.certificationToDelete,
        );
        this.toast.success("Certification deleted successfully");
        this.showConfirmModal = false;
        this.certificationToDelete = null;
      } catch (error: any) {
        this.toast.error(error.message || "Failed to delete certification");
      }
    },

    async saveCertification(data: {
      name: string;
      description: string;
      validityPeriodMonths?: number;
    }) {
      try {
        if (this.editingCertificationId) {
          // Update existing
          const existing = this.certificationsStore.getCertificationById(
            this.editingCertificationId,
          );
          await this.certificationsStore.updateCertification({
            id: this.editingCertificationId,
            name: data.name,
            description: data.description || undefined,
            validityPeriodMonths: data.validityPeriodMonths,
            createdAt: existing?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          this.toast.success("Certification updated successfully");
        } else {
          // Create new
          await this.certificationsStore.addCertification({
            id: crypto.randomUUID(),
            name: data.name,
            description: data.description || undefined,
            validityPeriodMonths: data.validityPeriodMonths || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          this.toast.success("Certification added successfully");
        }
        this.closeModal();
      } catch (error: any) {
        this.toast.error(error.message || "Failed to save certification");
      }
    },

    closeModal() {
      this.showModal = false;
      this.editingCertificationId = null;
      this.formData = {
        name: "",
        description: "",
        validityPeriodMonths: undefined,
      };
    },

    clearFilters() {
      this.searchQuery = "";
      this.filterExpiration = "";
    },
  },
});
</script>

<style scoped>
.certifications-tab {
  animation: slideIn 0.3s ease;
}

.certifications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.certifications-grid .empty-state {
  grid-column: 1 / -1;
}

.certification-card-wrapper {
  position: relative;
}

.card-hover-actions {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.certification-card-wrapper:hover .card-hover-actions {
  opacity: 1;
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

.table-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .controls-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .filters {
    justify-content: space-between;
  }

  .certifications-grid {
    grid-template-columns: 1fr;
  }
}
</style>
