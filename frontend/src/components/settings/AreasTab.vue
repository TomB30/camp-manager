<template>
  <div class="areas-tab">
    <TabHeader
      title="Areas"
      description="Manage all physical areas within your camp - from indoor facilities to outdoor spaces."
      action-text="Area"
      @action="showModal = true"
    >
      <template #action-icon>
        <Icon name="Plus" :size="18" />
      </template>
    </TabHeader>

    <!-- Search and Filters -->
    <FilterBar
      v-model:searchQuery="searchQuery"
      search-placeholder="Search by area name..."
      :filtered-count="filteredAreas.length"
      :total-count="areasStore.areas.length"
      @clear="clearFilters"
    >
      <template #prepend>
        <ViewToggle v-model="viewMode" />
      </template>
    </FilterBar>

    <!-- Empty State -->
    <EmptyState
      v-if="areasStore.areas.length === 0"
      icon-name="Map"
      title="No areas configured"
      message="Add your first area to start organizing your camp spaces."
      action-text="Area"
    />

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="areas-grid">
      <AreaCard
        v-for="area in filteredAreas"
        :key="area.meta.id"
        :area="area"
        @click="selectArea(area.meta.id)"
      >
        <template #icon>
          <Icon name="Map" :size="24" :stroke-width="2" />
        </template>
      </AreaCard>
    </div>

    <!-- Table View -->
    <DataTable
      v-else
      :columns="areaColumns"
      :data="filteredAreas"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      row-key="id"
    >
      <template #cell-name="{ item }">
        <div class="area-name-content">
          <div class="area-icon-sm" :style="{ background: '#3b82f6' }">
            <Icon name="Map" :size="18" :stroke-width="2" />
          </div>
          <div class="area-name">{{ item.meta.name }}</div>
        </div>
      </template>

      <template #cell-capacity="{ item }">
        <span v-if="item.spec.capacity">{{ item.spec.capacity }}</span>
        <span v-else class="text-secondary">N/A</span>
      </template>

      <template #cell-equipment="{ item }">
        <span
          v-if="item.spec.equipment && item.spec.equipment.length > 0"
          class="badge badge-success badge-sm"
        >
          {{ item.spec.equipment.length }} item(s)
        </span>
        <span v-else class="text-caption">None</span>
      </template>

      <template #cell-actions="{ item }">
        <BaseButton
          outline
          color="grey-8"
          size="sm"
          @click="selectArea(item.meta.id)"
          label="View Details"
        />
      </template>
    </DataTable>

    <AreaDetailModal
      v-if="!!selectedAreaId"
      :area="selectedArea"
      @close="selectedAreaId = null"
      @edit="editArea"
      @delete="deleteAreaConfirm"
    />

    <AreaFormModal
      v-if="showModal"
      :area-id="editingAreaId || undefined"
      @close="closeModal"
    />

    <ConfirmModal
      v-if="showConfirmModal"
      title="Delete Area"
      message="Are you sure you want to delete this area?"
      confirm-text="Delete"
      :danger-mode="true"
      @confirm="handleConfirmAction"
      @cancel="handleCancelConfirm"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// Stores
import { useAreasStore } from "@/stores";
// Types
import type { Area } from "@/generated/api";
// Components
import AreaCard from "@/components/cards/AreaCard.vue";
import FilterBar from "@/components/FilterBar.vue";
import AreaDetailModal from "@/components/modals/AreaDetailModal.vue";
import AreaFormModal from "@/components/modals/AreaFormModal.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import EmptyState from "@/components/EmptyState.vue";
import Icon from "@/components/Icon.vue";
import DataTable from "@/components/DataTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
// Composables
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "AreasTab",
  components: {
    AreaCard,
    FilterBar,
    ConfirmModal,
    DataTable,
    ViewToggle,
    AreaDetailModal,
    AreaFormModal,
    EmptyState,
    Icon,
    TabHeader,
  },
  setup() {
    const areasStore = useAreasStore();
    const toast = useToast();
    return { areasStore, toast };
  },
  data() {
    return {
      showModal: false,
      showConfirmModal: false,
      editingAreaId: null as string | null,
      selectedAreaId: null as string | null,
      searchQuery: "",
      viewMode: "grid" as "grid" | "table",
      currentPage: 1,
      pageSize: 10,
      confirmAction: null as (() => void) | null,
      areaColumns: [
        { key: "name", label: "Area Name", sortable: true },
        { key: "capacity", label: "Capacity", sortable: true },
        { key: "equipment", label: "Equipment" },
        { key: "actions", label: "", width: "120px" },
      ],
    };
  },
  computed: {
    filteredAreas(): Area[] {
      const areas = this.areasStore.areas;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return areas.filter((area: Area) =>
          area.meta.name.toLowerCase().includes(query),
        );
      }

      return areas;
    },
    selectedArea(): Area | null {
      if (!this.selectedAreaId) return null;
      return this.areasStore.getAreaById(this.selectedAreaId) || null;
    },
  },
  methods: {
    selectArea(id: string) {
      this.selectedAreaId = id;
    },
    editArea(area: Area) {
      this.editingAreaId = area.meta.id;
      this.selectedAreaId = null;
      this.showModal = true;
    },
    deleteAreaConfirm(id: string) {
      this.confirmAction = () => this.deleteArea(id);
      this.showConfirmModal = true;
      this.selectedAreaId = null;
    },
    async deleteArea(id: string) {
      try {
        await this.areasStore.deleteArea(id);
        this.toast.success("Area deleted successfully");
      } catch (error: any) {
        this.toast.error(error.message || "Failed to delete area");
      }
    },
    closeModal() {
      this.showModal = false;
      this.editingAreaId = null;
    },
    clearFilters() {
      this.searchQuery = "";
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
.areas-tab {
  animation: slideIn 0.3s ease;
}

.areas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.areas-grid .empty-state {
  grid-column: 1 / -1;
}

.area-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.area-icon-sm {
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.area-name {
  font-weight: 500;
  color: var(--text-primary);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .areas-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
