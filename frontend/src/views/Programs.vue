<template>
  <div class="view">
    <LoadingState v-if="!isInitialized" message="Loading programs..." />
    <template v-else>
      <!-- Breadcrumb Navigation (only show when inside a program) -->
      <nav v-if="selectedProgramId" class="breadcrumbs">
        <button class="breadcrumb-item" @click="selectedProgramId = null">
          Programs
        </button>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">
          {{ selectedProgram?.meta.name }}
        </span>
      </nav>

      <!-- Programs List View -->
      <div v-if="!selectedProgramId">
        <TabHeader
          title="Programs"
          description="Programs are collections of activities, staff members, and locations. Create programs to organize your camp's offerings like 'Watersports', 'Arts & Crafts', or 'Adventure Sports'."
          action-text="Program"
          @action="showProgramModal = true"
        />
        <!-- Search and Filters -->
        <FilterBar
          v-model:searchQuery="filters.searchQuery"
          search-placeholder="Search by name..."
          @clear="clearFilters"
        >
          <template #prepend>
            <ViewToggle v-model="filters.viewMode" />
          </template>
        </FilterBar>

        <ServerTable
          v-if="isInitialized"
          :columns="programColumns"
          :rows="programsData"
          row-key="meta.id"
          :grid="filters.viewMode === 'grid'"
          :loading="loading"
          :pagination="filters.pagination"
          @update:pagination="
            updateFilter('pagination', $event);
            fetchPrograms();
          "
          @row-click="selectProgram"
        >
          <template #item="{ item }">
            <ProgramCard :program="item" @click="selectProgram(item)" />
          </template>

          <template #cell-name="{ item }">
            <div class="program-name-content">
              <div
                class="color-indicator"
                :style="{ background: getProgramColor(item) }"
              ></div>
              <div class="program-name-text">{{ item.meta.name }}</div>
            </div>
          </template>

          <template #empty>
            <EmptyState
              type="empty"
              title="No Programs Yet"
              message="Create your first program to organize activities, staff, and locations."
              action-text="Program"
              icon-name="Boxes"
              @action="showProgramModal = true"
            />
          </template>
        </ServerTable>
      </div>

      <ProgramDetails
        v-if="selectedProgram"
        :program="selectedProgram"
        @close="selectedProgramId = null"
        @edit="editProgram"
        @delete="deleteProgramConfirm"
        @add-activity="showActivityFormModal = true"
        @add-staff-group="showStaffSelector = true"
        @add-location="showLocationSelector = true"
      />

      <!-- Modals -->
      <ProgramFormModal
        v-if="showProgramModal"
        :program-id="selectedProgramId || undefined"
        @close="closeProgramModal"
      />

      <!-- Staff Selector Modal -->
      <BaseModal
        v-if="showStaffSelector"
        title="Assign Staff Groups to Program"
        @close="showStaffSelector = false"
      >
        <template #body>
          <SelectionList
            v-model="programStaffGroupIds"
            :options="staffGroupsOptions"
            multiple
            label="Select Staff Groups"
            flat
          />
        </template>
        <template #footer>
          <BaseButton
            outline
            color="grey-8"
            @click="showStaffSelector = false"
            label="Close"
          />
        </template>
      </BaseModal>

      <!-- Location Selector Modal -->
      <BaseModal
        v-if="showLocationSelector"
        title="Add Location to Program"
        @close="showLocationSelector = false"
      >
        <template #body>
          <SelectionList
            v-model="programLocationIds"
            :options="locationsOptions"
            multiple
            label="Select Locations"
            flat
          />
        </template>
        <template #footer>
          <BaseButton
            outline
            color="grey-8"
            @click="showLocationSelector = false"
            label="Close"
          />
        </template>
      </BaseModal>

      <!-- Activity Form Modal -->
      <ActivityFormModal
        v-if="showActivityFormModal && selectedProgramId"
        :program-id="selectedProgramId"
        @close="showActivityFormModal = false"
      />

      <!-- Confirm Delete Modal -->
      <ConfirmModal
        v-if="showDeleteConfirm"
        :title="deleteConfirmTitle"
        :message="deleteConfirmMessage"
        confirm-text="Delete"
        danger-mode
        @confirm="confirmDelete"
        @cancel="cancelDelete"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  useProgramsStore,
  useActivitiesStore,
  useLocationsStore,
  useColorsStore,
  useGroupsStore,
} from "@/stores";
import { usePageFilters } from "@/composables/usePageFilters";
import { useToast } from "@/composables/useToast";
import type { Program, ProgramUpdateRequest, Group } from "@/generated/api";
import type { QTableColumn } from "quasar";
import { isBackendEnabled } from "@/config/dataSource";
import EmptyState from "@/components/EmptyState.vue";
import ProgramCard from "@/components/cards/ProgramCard.vue";
import BaseModal from "@/components/BaseModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import FilterBar from "@/components/FilterBar.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import ServerTable from "@/components/ServerTable.vue";
import ProgramFormModal from "@/components/modals/ProgramFormModal.vue";
import type { AutocompleteOption } from "@/components/Autocomplete.vue";
import SelectionList from "@/components/SelectionList.vue";
import ProgramDetails from "@/components/ProgramDetails.vue";
import ActivityFormModal from "@/components/modals/ActivityFormModal.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import LoadingState from "@/components/LoadingState.vue";

export default defineComponent({
  name: "Programs",
  components: {
    EmptyState,
    ProgramCard,
    BaseModal,
    ConfirmModal,
    FilterBar,
    ViewToggle,
    ServerTable,
    ProgramFormModal,
    SelectionList,
    ProgramDetails,
    ActivityFormModal,
    TabHeader,
    LoadingState,
  },
  setup() {
    const { filters, updateFilter, updateFilters, isInitialized } =
      usePageFilters("programs", {
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

    return {
      filters,
      updateFilter,
      updateFilters,
      isInitialized,
    };
  },
  data() {
    return {
      loading: false,
      programsData: [] as Program[],
      selectedProgramId: null as string | null,
      showProgramModal: false,
      showStaffSelector: false,
      showLocationSelector: false,
      showDeleteConfirm: false,
      showActivityFormModal: false,
      deleteTarget: null as {
        type: "program";
        id: string;
      } | null,
      programColumns: [
        {
          name: "name",
          label: "Program Name",
          field: (row: Program) => row.meta.name,
          align: "left" as const,
          sortable: true,
        },
        {
          name: "description",
          label: "Description",
          field: (row: Program) => row.meta.description,
          align: "left" as const,
          format: (value: string | undefined) => value || "No description",
        },
        {
          name: "activities",
          label: "Activities",
          field: (row: Program) => row.meta.id,
          align: "left" as const,
          format: (value: string) =>
            this.getActivitiesCount(value) + " activities",
        },
        {
          name: "staff",
          label: "Staff",
          field: (row: Program) => row.spec.staffGroupIds?.length || 0,
          align: "left" as const,
          format: (value: number) => value + " staff groups",
        },
        {
          name: "locations",
          label: "Locations",
          field: (row: Program) => row.spec.locationIds?.length || 0,
          align: "left" as const,
          format: (value: number) => value + " locations",
        },
      ] as QTableColumn[],
    };
  },
  async created() {
    // Load reference data
    await Promise.all([
      this.activitiesStore.loadActivities(),
      this.locationsStore.loadLocations(),
      this.colorsStore.loadColors(),
      this.groupsStore.loadGroups(),
    ]);
  },
  computed: {
    programsStore() {
      return useProgramsStore();
    },
    activitiesStore() {
      return useActivitiesStore();
    },
    locationsStore() {
      return useLocationsStore();
    },
    colorsStore() {
      return useColorsStore();
    },
    groupsStore() {
      return useGroupsStore();
    },
    toast() {
      return useToast();
    },
    staffGroupsOptions(): AutocompleteOption[] {
      return this.groupsStore.groups
        .filter((group: Group) => (group.spec.staffIds?.length || 0) > 0)
        .filter((group: Group) => (group.spec.camperIds?.length || 0) === 0)
        .map((group) => ({
          label: `${group.meta.name}`,
          value: group.meta.id,
        }));
    },
    locationsOptions(): AutocompleteOption[] {
      return this.locationsStore.locations.map((location) => ({
        label: `${location.meta.name}`,
        value: location.meta.id,
      }));
    },
    selectedProgram(): Program | null {
      return this.selectedProgramId
        ? this.programsStore.getProgramById(this.selectedProgramId) || null
        : null;
    },
    programStaffGroupIds: {
      get(): string[] {
        return this.selectedProgram?.spec.staffGroupIds || ([] as string[]);
      },
      set(value: string[]) {
        if (this.selectedProgram) {
          this.updateProgramStaffGroups(value);
        }
      },
    },
    programLocationIds: {
      get(): string[] {
        return this.selectedProgram?.spec.locationIds || ([] as string[]);
      },
      set(value: string[]) {
        if (this.selectedProgram) {
          this.updateProgramLocations(value);
        }
      },
    },
    deleteConfirmTitle() {
      if (!this.deleteTarget) return "";
      switch (this.deleteTarget.type) {
        case "program":
          return "Delete Program?";
        default:
          return "";
      }
    },
    deleteConfirmMessage() {
      if (!this.deleteTarget) return "";
      if (this.deleteTarget.type === "program") {
        const program = this.programsStore.getProgramById(this.deleteTarget.id);
        return `Are you sure you want to delete "${program?.meta.name}"? This will also delete all activities in this program. This action cannot be undone.`;
      }
      return "";
    },
  },
  methods: {
    async fetchPrograms(): Promise<void> {
      if (!this.isInitialized) return;

      if (!isBackendEnabled()) {
        const response = await this.programsStore.loadPrograms();
        this.programsData = Array.isArray(response) ? response : response.items;
      } else {
        try {
          const response = await this.programsStore.loadProgramsPaginated({
            offset: this.filters.pagination.offset,
            limit: this.filters.pagination.limit,
            search: this.filters.searchQuery || undefined,
            sortBy: this.filters.pagination.sortBy,
            sortOrder: this.filters.pagination.sortOrder,
          });

          this.programsData = response.items;
          this.updateFilter("pagination", {
            ...this.filters.pagination,
            total: response.total,
          });
        } catch (error) {
          console.error("Failed to fetch programs:", error);
          this.programsData = [];
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
    selectProgram(program: Program) {
      this.selectedProgramId = program.meta.id;
    },
    getProgramColor(program: Program): string {
      if (program.spec.colorId) {
        const color = this.colorsStore.getColorById(program.spec.colorId);
        return color?.spec.hexValue || "#6366F1";
      }
      return "#6366F1";
    },
    getActivitiesCount(programId: string) {
      return this.activitiesStore.getActivitiesInProgram(programId).length;
    },
    getStaffGroupsCount(programId: string) {
      const program = this.programsStore.getProgramById(programId);
      return program?.spec.staffGroupIds?.length || 0;
    },
    getLocationsCount(programId: string) {
      const program = this.programsStore.getProgramById(programId);
      return program?.spec.locationIds?.length || 0;
    },
    closeProgramModal() {
      this.showProgramModal = false;
      this.fetchPrograms();
    },
    editProgram(program: Program) {
      this.selectedProgramId = program.meta.id;
      this.showProgramModal = true;
    },
    deleteProgramConfirm(program: Program) {
      this.deleteTarget = { type: "program", id: program.meta.id };
      this.showDeleteConfirm = true;
    },
    async confirmDelete() {
      if (!this.deleteTarget) return;

      try {
        if (this.deleteTarget.type === "program") {
          await this.programsStore.deleteProgram(this.deleteTarget.id);
          this.toast.success("Program deleted successfully");
          this.fetchPrograms();
          this.selectedProgramId = null;
        }
      } catch (error: any) {
        this.toast.error(error.message || "Failed to delete");
      } finally {
        this.cancelDelete();
      }
    },
    cancelDelete() {
      this.showDeleteConfirm = false;
      this.deleteTarget = null;
    },
    // Update methods for SelectionList v-model binding
    async updateProgramStaffGroups(staffGroupIds: string[]) {
      if (!this.selectedProgram) return;

      const updatedProgram: ProgramUpdateRequest = {
        meta: this.selectedProgram.meta,
        spec: {
          ...this.selectedProgram.spec,
          staffGroupIds: staffGroupIds,
        },
      };

      try {
        await this.programsStore.updateProgram(
          this.selectedProgram.meta.id,
          updatedProgram,
        );
        this.toast.success("Staff assignments updated");
        this.fetchPrograms();
      } catch (error: any) {
        this.toast.error(error.message || "Failed to update staff assignments");
      }
    },
    async updateProgramLocations(locationIds: string[]) {
      if (!this.selectedProgram) return;

      const updatedProgram: ProgramUpdateRequest = {
        meta: this.selectedProgram.meta,
        spec: {
          ...this.selectedProgram.spec,
          locationIds: locationIds,
        },
      };

      try {
        await this.programsStore.updateProgram(
          this.selectedProgram.meta.id,
          updatedProgram,
        );
        this.toast.success("Location assignments updated");
        this.fetchPrograms();
      } catch (error: any) {
        this.toast.error(
          error.message || "Failed to update location assignments",
        );
      }
    },
  },
  watch: {
    isInitialized: {
      immediate: true,
      handler(initialized) {
        if (initialized) {
          this.fetchPrograms();
        }
      },
    },
    "filters.searchQuery"() {
      this.updateFilter("pagination", {
        ...this.filters.pagination,
        offset: 0,
      });
      this.fetchPrograms();
    },
  },
});
</script>

<style scoped>
/* Breadcrumbs */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.breadcrumb-item {
  color: var(--text-secondary);
  text-decoration: none;
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  font-size: inherit;
}

.breadcrumb-item:hover {
  background: var(--surface-secondary);
  color: var(--text-primary);
}

.breadcrumb-item.active {
  color: var(--text-primary);
  font-weight: 600;
  background: var(--surface-secondary);
  cursor: default;
}

.breadcrumb-separator {
  color: var(--text-muted);
}

/* View Header */
/* Table View Styles */
.program-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.color-indicator {
  width: 4px;
  height: 24px;
  border-radius: 2px;
  flex-shrink: 0;
}

.program-name-text {
  font-weight: 500;
}

/* Programs Grid */
.programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.5rem;
}

.programs-grid .empty-state {
  grid-column: 1 / -1;
}
</style>
