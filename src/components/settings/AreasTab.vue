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
      v-model:filter-type="filterType"
      :filters="areaFilters"
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
        :key="area.id"
        :area="area"
        :format-type="formatAreaType(area.type)"
        :icon-color="getAreaTypeColor(area.type)"
        @click="selectArea(area.id)"
      >
        <template #icon>
          <Icon :name="AreaTypeIcon(area.type)" :size="24" :stroke-width="2" />
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
          <div
            class="area-icon-sm"
            :style="{ background: getAreaTypeColor(item.type) }"
          >
            <Icon
              :name="AreaTypeIcon(item.type)"
              :size="18"
              :stroke-width="2"
            />
          </div>
          <div class="area-name">{{ item.name }}</div>
        </div>
      </template>

      <template #cell-type="{ item }">
        <span class="badge badge-primary badge-sm">{{
          formatAreaType(item.type)
        }}</span>
      </template>

      <template #cell-capacity="{ item }">
        <span v-if="item.capacity">{{ item.capacity }}</span>
        <span v-else class="text-secondary">N/A</span>
      </template>

      <template #cell-equipment="{ item }">
        <span
          v-if="item.equipment && item.equipment.length > 0"
          class="badge badge-success badge-sm"
        >
          {{ item.equipment.length }} item(s)
        </span>
        <span v-else class="text-secondary">None</span>
      </template>

      <template #cell-actions="{ item }">
        <button
          class="btn btn-sm btn-secondary"
          @click.stop="selectArea(item.id)"
        >
          View Details
        </button>
      </template>
    </DataTable>

    <!-- Area Detail Modal -->
    <AreaDetailModal
      :show="!!selectedAreaId"
      :area="selectedArea"
      @close="selectedAreaId = null"
      @edit="editArea"
      @delete="deleteAreaConfirm"
    />

    <!-- Add/Edit Area Modal -->
    <AreaFormModal
      :show="showModal"
      :is-editing="!!editingAreaId"
      :form-data="formData"
      @close="closeModal"
      @save="saveArea"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :show="showConfirmModal"
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
import { useAreasStore } from "@/stores";
import type { Area } from "@/types";
import AreaCard from "@/components/cards/AreaCard.vue";
import FilterBar, { type Filter } from "@/components/FilterBar.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import DataTable from "@/components/DataTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import AreaDetailModal from "@/components/modals/AreaDetailModal.vue";
import AreaFormModal from "@/components/modals/AreaFormModal.vue";
import EmptyState from "@/components/EmptyState.vue";
import Icon from "@/components/Icon.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import { useToast } from "@/composables/useToast";
import type { IconName } from "@/components/Icon.vue";

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
      filterType: "",
      viewMode: "grid" as "grid" | "table",
      currentPage: 1,
      pageSize: 10,
      formData: this.getEmptyFormData(),
      confirmAction: null as (() => void) | null,

      areaColumns: [
        { key: "name", label: "Area Name", sortable: true },
        { key: "type", label: "Type", sortable: true },
        { key: "capacity", label: "Capacity", sortable: true },
        { key: "equipment", label: "Equipment" },
        { key: "actions", label: "", width: "120px" },
      ],
    };
  },
  computed: {
    areaFilters(): Filter[] {
      return [
        {
          model: "filterType",
          value: this.filterType,
          placeholder: "Filter by Type",
          options: [
            { value: "indoor", label: "Indoor" },
            { value: "outdoor", label: "Outdoor" },
            { value: "facility", label: "Facility" },
            { value: "field", label: "Field" },
            { value: "water", label: "Water" },
            { value: "other", label: "Other" },
          ],
        },
      ];
    },

    filteredAreas(): Area[] {
      let filtered = this.areasStore.areas;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (area) =>
            area.name.toLowerCase().includes(query) ||
            area.description?.toLowerCase().includes(query),
        );
      }

      // Type filter
      if (
        this.filterType &&
        this.filterType !== "" &&
        this.filterType !== "all"
      ) {
        filtered = filtered.filter((area) => area.type === this.filterType);
      }

      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    },

    selectedArea(): Area | null {
      if (!this.selectedAreaId) return null;
      return this.areasStore.getAreaById(this.selectedAreaId) || null;
    },
  },
  methods: {
    getEmptyFormData() {
      return {
        name: "",
        description: "",
        type: "indoor" as Area["type"],
        capacity: undefined,
        equipment: [] as string[],
        notes: "",
      };
    },

    selectArea(id: string) {
      this.selectedAreaId = id;
    },

    editArea(area: Area) {
      this.editingAreaId = area.id;
      this.formData = {
        name: area.name,
        description: area.description || "",
        type: area.type,
        capacity: area.capacity,
        equipment: area.equipment || [],
        notes: area.notes || "",
      };
      this.selectedAreaId = null;
      this.showModal = true;
    },

    async saveArea(data: any) {
      try {
        if (this.editingAreaId) {
          // Update existing
          await this.areasStore.updateArea({
            id: this.editingAreaId,
            ...data,
            createdAt:
              this.areasStore.getAreaById(this.editingAreaId)?.createdAt ||
              new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          this.toast.success("Area updated successfully");
        } else {
          // Create new
          await this.areasStore.addArea({
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          this.toast.success("Area added successfully");
        }
        this.closeModal();
      } catch (error: any) {
        this.toast.error(error.message || "Failed to save area");
      }
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
      this.formData = this.getEmptyFormData();
    },

    clearFilters() {
      this.searchQuery = "";
      this.filterType = "";
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

    formatAreaType(type: Area["type"]): string {
      const typeMap: Record<NonNullable<Area["type"]>, string> = {
        indoor: "Indoor",
        outdoor: "Outdoor",
        facility: "Facility",
        field: "Field",
        water: "Water",
        other: "Other",
      };
      return typeMap[type as NonNullable<Area["type"]>] || "";
    },

    getAreaTypeColor(type: Area["type"]): string {
      const colorMap: Record<NonNullable<Area["type"]>, string> = {
        indoor: "#3b82f6",
        outdoor: "#10b981",
        facility: "#6366f1",
        field: "#f59e0b",
        water: "#06b6d4",
        other: "#6b7280",
      };
      return colorMap[type as NonNullable<Area["type"]>] || "#6b7280";
    },

    AreaTypeIcon(type: Area["type"]): IconName {
      const iconMap: Record<NonNullable<Area["type"]>, IconName> = {
        indoor: "Home",
        outdoor: "Trees",
        facility: "Activity",
        field: "Activity",
        water: "Waves",
        other: "MoreHorizontal",
      };
      return iconMap[type as NonNullable<Area["type"]>] || "MapPin";
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
  gap: 1.5rem;
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
