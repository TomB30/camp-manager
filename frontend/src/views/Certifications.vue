<template>
  <div class="certifications-tab view">
    <LoadingState v-if="!isInitialized" message="Loading certifications..." />
    <template v-else>
      <TabHeader
        title="Certifications"
        description="Manage qualifications and credentials that staff members can hold, such as first aid, lifeguard, or activity-specific certifications."
        action-text="Certification"
        @action="showModal = true"
      />

      <FilterBar
        v-model:searchQuery="filters.searchQuery"
        :filtered-count="filters.pagination.total"
        :total-count="filters.pagination.total"
        @clear="clearFilters"
      >
        <template #prepend>
          <ViewToggle v-model="filters.viewMode" />
        </template>
      </FilterBar>

      <ServerTable
        v-if="isInitialized"
        :columns="certificationColumns"
        :rows="certificationsData"
        row-key="meta.id"
        :grid="filters.viewMode === 'grid'"
        :loading="loading"
        :pagination="filters.pagination"
        @update:pagination="
          updateFilter('pagination', $event);
          fetchCertifications();
        "
        @row-click="selectCertification"
      >
        <template #item="{ item }">
          <CertificationCard :certification="item" @click="selectCertification(item)" />
        </template>

        <template #empty>
          <EmptyState
            type="empty"
            title="No Certifications Yet"
            message="Add your first certification to track staff qualifications and credentials."
            action-text="Certification"
            @action="showModal = true"
            icon-name="Award"
          />
        </template>
      </ServerTable>

      <CertificationDetailModal
        v-if="!!selectedCertificationId"
        :certification="selectedCertification"
        @close="selectedCertificationId = null"
        @edit="editCertification"
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
        @confirm="handleConfirmAction"
        @cancel="handleCancelConfirm"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useCertificationsStore } from "@/stores";
import { usePageFilters } from "@/composables/usePageFilters";
import type { Certification } from "@/generated/api";
import type { QTableColumn } from "quasar";
import { isBackendEnabled } from "@/config/dataSource";
import CertificationCard from "@/components/cards/CertificationCard.vue";
import FilterBar from "@/components/FilterBar.vue";
import CertificationDetailModal from "@/components/modals/CertificationDetailModal.vue";
import CertificationFormModal from "@/components/modals/CertificationFormModal.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import EmptyState from "@/components/EmptyState.vue";
import ServerTable from "@/components/ServerTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import LoadingState from "@/components/LoadingState.vue";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "CertificationsTab",
  components: {
    CertificationCard,
    FilterBar,
    ConfirmModal,
    ServerTable,
    ViewToggle,
    CertificationDetailModal,
    CertificationFormModal,
    EmptyState,
    TabHeader,
    LoadingState,
  },
  setup() {
    const { filters, updateFilter, updateFilters, isInitialized } = usePageFilters("certifications", {
      searchQuery: "",
      viewMode: "grid" as "grid" | "table",
      pagination: {
        offset: 0,
        limit: 20,
        total: 0,
        sortBy: undefined,
        sortOrder: "asc" as "asc" | "desc",
      },
    });

    const certificationsStore = useCertificationsStore();
    const toast = useToast();

    return {
      filters,
      updateFilter,
      updateFilters,
      isInitialized,
      certificationsStore,
      toast,
    };
  },
  data() {
    return {
      loading: false,
      certificationsData: [] as Certification[],
      showModal: false,
      showConfirmModal: false,
      editingCertificationId: null as string | null,
      selectedCertificationId: null as string | null,
      confirmAction: null as (() => void) | null,
      certificationColumns: [
        {
          name: "name",
          label: "Certification Name",
          field: (row: Certification) => row.meta.name,
          align: "left" as const,
          sortable: true,
        },
        {
          name: "description",
          label: "Description",
          field: (row: Certification) => row.meta.description,
          align: "left" as const,
          format: (value: string | undefined) => value || "No description",
        },
      ] as QTableColumn[],
    };
  },
  computed: {
    selectedCertification(): Certification | null {
      if (!this.selectedCertificationId) return null;
      return (
        this.certificationsData.find((c) => c.meta.id === this.selectedCertificationId) ||
        null
      );
    },
  },
  methods: {
    async fetchCertifications(): Promise<void> {
      if (!this.isInitialized) return;

      if (!isBackendEnabled()) {
        const response = await this.certificationsStore.loadCertifications();
        this.certificationsData = Array.isArray(response) ? response : response.items;
      } else {
        try {
          const response = await this.certificationsStore.loadCertificationsPaginated({
            offset: this.filters.pagination.offset,
            limit: this.filters.pagination.limit,
            search: this.filters.searchQuery || undefined,
            sortBy: this.filters.pagination.sortBy,
            sortOrder: this.filters.pagination.sortOrder,
          });

          this.certificationsData = response.items;
          this.updateFilter("pagination", {
            ...this.filters.pagination,
            total: response.total,
          });
        } catch (error) {
          console.error("Failed to fetch certifications:", error);
          this.certificationsData = [];
        }
      }
    },

    clearFilters() {
      this.updateFilters({
        searchQuery: "",
        pagination: {
          ...this.filters.pagination,
          offset: 0,
        },
      });
    },

    selectCertification(certification: Certification) {
      this.selectedCertificationId = certification.meta.id;
    },

    editCertification(certification: Certification) {
      this.editingCertificationId = certification.meta.id;
      this.selectedCertificationId = null;
      this.showModal = true;
    },

    deleteCertificationConfirm() {
      if (!this.selectedCertificationId) return;

      this.confirmAction = async () => {
        if (this.selectedCertificationId) {
          await this.certificationsStore.deleteCertification(
            this.selectedCertificationId
          );
          await this.fetchCertifications();
          this.toast.success("Certification deleted successfully");
          this.selectedCertificationId = null;
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
      this.editingCertificationId = null;
    },
  },
  watch: {
    isInitialized: {
      immediate: true,
      handler(initialized) {
        if (initialized) {
          this.fetchCertifications();
        }
      },
    },
    "filters.searchQuery"() {
      this.updateFilter("pagination", {
        ...this.filters.pagination,
        offset: 0,
      });
      this.fetchCertifications();
    },
  },
});
</script>
