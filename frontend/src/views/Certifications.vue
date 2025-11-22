<template>
  <div class="certifications-tab view">
    <LoadingState v-if="loading" message="Loading certifications..." />
    <template v-else>
      <TabHeader
        title="Staff Certifications"
        description="Manage the certifications available for your staff members. Define which certifications are required and their validity periods."
        action-text="Certification"
        @action="showModal = true"
      />

      <!-- Search and Filters -->
      <FilterBar
        v-model:searchQuery="searchQuery"
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
      <transition-group
        v-else-if="viewMode === 'grid'"
        name="list"
        tag="div"
        class="certifications-grid transition-wrapper"
      >
        <CertificationCard
          v-for="certification in filteredCertifications"
          :key="certification.meta.id"
          :certification="certification"
          @click="selectCertification(certification.meta.id)"
        />
      </transition-group>

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
            <div>{{ item.meta.name }}</div>
          </div>
        </template>

        <template #cell-actions="{ item }">
          <BaseButton
            outline
            color="grey-8"
            size="sm"
            @click="selectCertification(item.meta.id)"
            label="View Details"
          />
        </template>
      </DataTable>

      <CertificationDetailModal
        v-if="!!selectedCertificationId"
        :certification="selectedCertification"
        @close="selectedCertificationId = null"
        @edit="editCertificationFromDetail"
        @delete="deleteCertificationConfirm"
      />

      <CertificationFormModal
        v-if="showModal"
        :certification-id="editingCertificationId || undefined"
        @close="closeModal"
      />

      <ConfirmModal
        v-if="showConfirmModal"
        title="Delete Certification"
        message="Are you sure you want to delete this certification?"
        confirm-text="Delete"
        :danger-mode="true"
        @confirm="handleDeleteCertification"
        @cancel="showConfirmModal = false"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useCertificationsStore } from "@/stores";
import type { Certification } from "@/generated/api";
import Icon from "@/components/Icon.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import CertificationCard from "@/components/cards/CertificationCard.vue";
import CertificationDetailModal from "@/components/modals/CertificationDetailModal.vue";
import CertificationFormModal from "@/components/modals/CertificationFormModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import DataTable from "@/components/DataTable.vue";
import FilterBar from "@/components/FilterBar.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import EmptyState from "@/components/EmptyState.vue";
import { useToast } from "@/composables/useToast";
import LoadingState from "@/components/LoadingState.vue";

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
    LoadingState,
  },
  setup() {
    const certificationsStore = useCertificationsStore();
    const toast = useToast();
    return { certificationsStore, toast };
  },
  data() {
    return {
      loading: false,
      showModal: false,
      showConfirmModal: false,
      editingCertificationId: null as string | null,
      selectedCertificationId: null as string | null,
      certificationToDelete: null as string | null,
      searchQuery: "",
      viewMode: "grid" as "grid" | "table",
      currentPage: 1,
      pageSize: 10,
      certificationColumns: [
        { key: "name", label: "Certification Name", sortable: true },
        { key: "actions", label: "", width: "120px" },
      ],
    };
  },
  async created() {
    this.loading = true;
    try {
      await this.certificationsStore.loadCertifications();
    } finally {
      this.loading = false;
    }
  },
  computed: {
    filteredCertifications(): Certification[] {
      let filtered = this.certificationsStore.certifications;

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (cert) =>
            cert.meta.name.toLowerCase().includes(query) ||
            cert.meta.description?.toLowerCase().includes(query),
        );
      }

      return filtered.sort((a, b) => a.meta.name.localeCompare(b.meta.name));
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
      this.editingCertificationId = certification.meta.id;
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
    closeModal() {
      this.showModal = false;
      this.editingCertificationId = null;
    },
    clearFilters() {
      this.searchQuery = "";
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
  gap: 0.5rem;
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
