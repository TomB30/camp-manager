<template>
  <div class="container">
    <div class="view">
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
        <ViewHeader
          title="Programs"
          tooltip="Programs are collections of activities, staff members, and locations. Create programs to organize your camp's offerings like 'Watersports', 'Arts & Crafts', or 'Adventure Sports'."
        >
          <template #actions>
            <BaseButton
              @click="showProgramModal = true"
              label="Program"
              icon="add"
              color="primary"
            />
          </template>
        </ViewHeader>

        <!-- Search and Filters -->
        <FilterBar
          v-model:searchQuery="searchQuery"
          :filtered-count="filteredPrograms.length"
          :total-count="programsStore.programs.length"
          search-placeholder="Search programs..."
          @clear="clearFilters"
        >
          <template #prepend>
            <ViewToggle v-model="viewMode" />
          </template>
        </FilterBar>

        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="programs-grid">
          <ProgramCard
            v-for="program in filteredPrograms"
            :key="program.meta.id"
            :program="program"
            @click="selectProgram(program.meta.id)"
          />

          <EmptyState
            v-if="
              filteredPrograms.length === 0 &&
              programsStore.programs.length === 0
            "
            type="empty"
            title="No Programs Yet"
            message="Create your first program to organize activities, staff, and locations."
            action-text="Program"
            icon-name="Boxes"
            @action="showProgramModal = true"
          />

          <EmptyState
            v-if="
              filteredPrograms.length === 0 && programsStore.programs.length > 0
            "
            type="no-results"
            title="No Programs Found"
            message="No programs match your search query."
            action-text="Clear Filters"
            action-button-class="btn-secondary"
            @action="clearFilters"
            icon-name="Boxes"
            hide-action-icon
          />
        </div>

        <!-- Table View -->
        <DataTable
          v-if="viewMode === 'table'"
          :columns="programColumns"
          :data="filteredPrograms"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          row-key="id"
        >
          <template #cell-name="{ item }">
            <div class="program-name-content">
              <div
                class="color-indicator"
                :style="{ background: getProgramColor(item) }"
              ></div>
              <div class="program-name-text">{{ item.meta.name }}</div>
            </div>
          </template>

          <template #cell-description="{ item }">
            <span>{{ item.meta.description || "No description" }}</span>
          </template>

          <template #cell-activities="{ item }">
            <span class="badge badge-sm badge-primary"
              >{{ getActivitiesCount(item.meta.id) }} activities</span
            >
          </template>

          <template #cell-staff="{ item }">
            <span>{{ getStaffGroupsCount(item.meta.id) }} staff groups</span>
          </template>

          <template #cell-locations="{ item }">
            <span>{{ getLocationsCount(item.meta.id) }} locations</span>
          </template>

          <template #cell-actions="{ item }">
            <BaseButton
              color="grey-8"
              outline
              label="View Details"
              size="sm"
              @click="selectProgram(item.meta.id)"
            />
          </template>
        </DataTable>
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
    </div>

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
import { useToast } from "@/composables/useToast";
import type { Program, ProgramUpdateRequest, Group } from "@/generated/api";
import ViewHeader from "@/components/ViewHeader.vue";
import EmptyState from "@/components/EmptyState.vue";
import ProgramCard from "@/components/cards/ProgramCard.vue";
import BaseModal from "@/components/BaseModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import FilterBar from "@/components/FilterBar.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import DataTable from "@/components/DataTable.vue";
import ProgramFormModal from "@/components/modals/ProgramFormModal.vue";
import type { AutocompleteOption } from "@/components/Autocomplete.vue";
import SelectionList from "@/components/SelectionList.vue";
import ProgramDetails from "@/components/ProgramDetails.vue";
import ActivityFormModal from "@/components/modals/ActivityFormModal.vue";
export default defineComponent({
  name: "Programs",
  components: {
    ViewHeader,
    EmptyState,
    ProgramCard,
    BaseModal,
    ConfirmModal,
    FilterBar,
    ViewToggle,
    DataTable,
    ProgramFormModal,
    SelectionList,
    ProgramDetails,
    ActivityFormModal,
  },
  data() {
    return {
      searchQuery: "",
      viewMode: "grid" as "grid" | "table",
      currentPage: 1,
      pageSize: 10,
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
        { key: "name", label: "Program Name", width: "200px" },
        { key: "description", label: "Description", width: "250px" },
        { key: "activities", label: "Activities", width: "120px" },
        { key: "staff", label: "Staff", width: "100px" },
        { key: "locations", label: "Locations", width: "100px" },
        { key: "actions", label: "Actions", width: "140px" },
      ],
    };
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
    filteredPrograms() {
      const query = this.searchQuery.toLowerCase().trim();
      if (!query) return this.programsStore.programs;

      return this.programsStore.programs.filter(
        (program) =>
          program.meta.name.toLowerCase().includes(query) ||
          (program.meta.description &&
            program.meta.description.toLowerCase().includes(query)),
      );
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
    clearFilters() {
      this.searchQuery = "";
    },
    selectProgram(id: string) {
      this.selectedProgramId = id;
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
      } catch (error: any) {
        this.toast.error(
          error.message || "Failed to update location assignments",
        );
      }
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
  gap: 1rem;
}

.programs-grid .empty-state {
  grid-column: 1 / -1;
}
</style>
