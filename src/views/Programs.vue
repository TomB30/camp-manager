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
          {{ selectedProgram?.name }}
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
          :filters="[]"
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
            :key="program.id"
            :program="program"
            :activities-count="getActivitiesCount(program.id)"
            :staff-count="getStaffCount(program.id)"
            :locations-count="getLocationsCount(program.id)"
            @click="selectProgram(program.id)"
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
              <div class="program-name-text">{{ item.name }}</div>
            </div>
          </template>

          <template #cell-description="{ item }">
            <span>{{ item.description || "No description" }}</span>
          </template>

          <template #cell-activities="{ item }">
            <span class="badge badge-sm badge-primary"
              >{{ getActivitiesCount(item.id) }} activities</span
            >
          </template>

          <template #cell-staff="{ item }">
            <span>{{ getStaffCount(item.id) }} staff</span>
          </template>

          <template #cell-locations="{ item }">
            <span>{{ getLocationsCount(item.id) }} locations</span>
          </template>

          <template #cell-actions="{ item }">
            <BaseButton
              color="grey-8"
              outline
              label="View Details"
              size="sm"
              @click="selectProgram(item.id)"
            />
          </template>
        </DataTable>
      </div>

      <!-- Program Detail View -->
      <div v-if="selectedProgramId && selectedProgram" class="program-detail">
        <div class="detail-header">
          <div class="detail-header-content">
            <div class="flex">
              <div
                class="detail-color-bar"
                :style="{ background: getProgramColor(selectedProgram) }"
              ></div>
              <div class="detail-header-info">
                <h2>{{ selectedProgram.name }}</h2>
                <p
                  v-if="selectedProgram.description"
                  class="detail-description"
                >
                  {{ selectedProgram.description }}
                </p>
              </div>
            </div>
            <div class="detail-header-actions">
              <BaseButton
                color="grey-8"
                outline
                icon="edit"
                label="Edit"
                @click="editProgram(selectedProgram)"
              />
              <BaseButton
                color="negative"
                outline
                icon="delete"
                label="Delete"
                @click="deleteProgramConfirm(selectedProgram)"
              />
            </div>
          </div>
          <div class=""></div>
        </div>

        <!-- Activities Section -->
        <div class="detail-section">
          <div class="section-header">
            <h3>
              <ListChecks :size="20" />
              Activities
            </h3>
            <BaseButton
              color="grey-8"
              outline
              icon="add"
              label="Activity"
              @click="showActivitySelector = true"
            />
          </div>

          <div v-if="programActivities.length > 0" class="activities-list">
            <div
              v-for="activity in programActivities"
              :key="activity.id"
              class="activity-item card"
              @click="viewActivity(activity)"
            >
              <div class="activity-info">
                <h4>{{ activity.name }}</h4>
                <p v-if="activity.description" class="text-caption">
                  {{ activity.description }}
                </p>
              </div>
              <div class="activity-meta">
                <span class="meta-item">
                  <Clock :size="14" />
                  <DurationDisplay :minutes="activity.duration || 0" />
                </span>
                <span v-if="activity.defaultLocationId" class="meta-item">
                  <Home :size="14" />
                  {{ getLocationName(activity.defaultLocationId) }}
                </span>
                <span v-if="activity.defaultCapacity" class="meta-item">
                  <Users :size="14" />
                  {{ activity.defaultCapacity }} max
                </span>
              </div>
            </div>
          </div>

          <div v-else class="empty-section">
            <p>No activities yet. Add activities to create event templates.</p>
          </div>
        </div>

        <!-- Staff Section -->
        <div class="detail-section">
          <div class="section-header">
            <h3>
              <UsersRound :size="20" />
              Staff Members
            </h3>
            <BaseButton
              color="grey-8"
              outline
              icon="add"
              label="Staff Member"
              @click="showStaffSelector = true"
            />
          </div>

          <div v-if="programStaff.length > 0" class="staff-list">
            <EntityListItem
              v-for="staff in programStaff"
              :key="staff.id"
              :first-name="staff.firstName"
              :last-name="staff.lastName"
              :title="`${staff.firstName} ${staff.lastName}`"
              :subtitle="formatRole(staff.roleId)"
              :removable="true"
              @remove="confirmRemoveStaff(staff.id)"
            >
              <template
                v-if="getStaffCertificationNames(staff).length > 0"
                #metadata
              >
                <div class="staff-certifications">
                  <span
                    v-for="cert in getStaffCertificationNames(staff)"
                    :key="cert"
                    class="certification-badge"
                  >
                    {{ cert }}
                  </span>
                </div>
              </template>
            </EntityListItem>
          </div>

          <div v-else class="empty-section">
            <p>No staff members assigned. Add staff to this program.</p>
          </div>
        </div>

        <!-- Locations Section -->
        <div class="detail-section">
          <div class="section-header">
            <h3>
              <Home :size="20" />
              Locations
            </h3>
            <BaseButton
              color="grey-8"
              outline
              icon="add"
              label="Location"
              @click="showLocationSelector = true"
            />
          </div>

          <div v-if="programLocations.length > 0" class="locations-list">
            <EntityListItem
              v-for="location in programLocations"
              :key="location.id"
              :title="location.name"
              :removable="true"
              @remove="confirmRemoveLocation(location.id)"
            >
              <template #avatar>
                <div class="location-icon">
                  <Home :size="24" />
                </div>
              </template>
              <template #metadata>
                <div class="location-meta">
                  <span>{{ formatLocationType(location.type) }}</span>
                  <span>•</span>
                  <span>Capacity: {{ location.capacity }}</span>
                  <span v-if="location.areaId"
                    >• {{ getAreaName(location.areaId) }}</span
                  >
                </div>
              </template>
            </EntityListItem>
          </div>

          <div v-else class="empty-section">
            <p>No locations assigned. Add locations to this program.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ProgramFormModal
      v-if="showProgramModal"
      :program-id="selectedProgramId || undefined"
      @close="closeProgramModal"
    />

    <ActivitySelectorModal
      v-if="showActivitySelector"
      :program-id="selectedProgramId || ''"
      @close="showActivitySelector = false"
      @create-new="handleCreateNewActivity"
      @add-existing="handleAddExistingActivity"
    />

    <ActivityFormModal
      v-if="showActivityModal"
      :activity="editingActivity"
      :activity-id="selectedActivityId || undefined"
      :program-id="selectedProgramId || ''"
      :program-ids="selectedProgram?.id ? [selectedProgram.id] : []"
      @close="closeActivityModal"
      @save="saveActivity"
    />

    <ActivityDetailModal
      v-if="!!selectedActivityId"
      :activity="selectedActivity"
      @close="selectedActivityId = null"
      @edit="editActivity"
      @delete="deleteActivityConfirm"
    />

    <!-- Staff Selector Modal -->
    <BaseModal
      v-if="showStaffSelector"
      title="Assign Staff to Program"
      @close="showStaffSelector = false"
    >
      <template #body>
        <SelectionList
          v-model="programStaffIds"
          :items="staffMembersStore.staffMembers"
          item-type="staff member"
          placeholder="Add a staff member..."
          empty-text="No staff members assigned yet"
          add-button-text="Add"
          mode="multiple"
          :get-label-fn="getStaffLabel"
          :get-initials-fn="getStaffInitials"
          :get-options-fn="getStaffOption"
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
          :items="locationsStore.locations"
          item-type="location"
          placeholder="Add a location..."
          empty-text="No locations assigned yet"
          add-button-text="Add"
          mode="multiple"
          :get-label-fn="getLocationLabel"
          :get-initials-fn="getLocationInitials"
          :get-options-fn="getLocationOption"
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
  useStaffMembersStore,
  useLocationsStore,
  useAreasStore,
  useCertificationsStore,
  useColorsStore,
  useRolesStore,
} from "@/stores";
import { useToast } from "@/composables/useToast";
import type { Program, Activity, StaffMember, Location } from "@/types";
import { Users, UsersRound, Home, Clock, ListChecks } from "lucide-vue-next";
import ViewHeader from "@/components/ViewHeader.vue";
import EmptyState from "@/components/EmptyState.vue";
import EntityListItem from "@/components/EntityListItem.vue";
import ProgramCard from "@/components/cards/ProgramCard.vue";
import BaseModal from "@/components/BaseModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import FilterBar from "@/components/FilterBar.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import DataTable from "@/components/DataTable.vue";
import InfoTooltip from "@/components/InfoTooltip.vue";
import ProgramFormModal from "@/components/modals/ProgramFormModal.vue";
import ActivityFormModal from "@/components/modals/ActivityFormModal.vue";
import ActivityDetailModal from "@/components/modals/ActivityDetailModal.vue";
import ActivitySelectorModal from "@/components/modals/ActivitySelectorModal.vue";
import SelectionList from "@/components/SelectionList.vue";
import type { AutocompleteOption } from "@/components/Autocomplete.vue";
import DurationDisplay from "@/components/DurationDisplay.vue";

export default defineComponent({
  name: "Programs",
  components: {
    ViewHeader,
    EmptyState,
    EntityListItem,
    ProgramCard,
    Users,
    UsersRound,
    Home,
    Clock,
    ListChecks,
    BaseModal,
    ConfirmModal,
    FilterBar,
    ViewToggle,
    DataTable,
    InfoTooltip,
    ProgramFormModal,
    ActivityFormModal,
    ActivityDetailModal,
    ActivitySelectorModal,
    SelectionList,
    DurationDisplay,
  },
  data() {
    return {
      searchQuery: "",
      viewMode: "grid" as "grid" | "table",
      currentPage: 1,
      pageSize: 10,
      selectedProgramId: null as string | null,
      selectedActivityId: null as string | null,
      showProgramModal: false,
      showActivityModal: false,
      showActivitySelector: false,
      showStaffSelector: false,
      showLocationSelector: false,
      showDeleteConfirm: false,
      editingProgram: null as Program | null,
      editingActivity: null as Activity | null,
      deleteTarget: null as {
        type: "program" | "activity" | "staff" | "location";
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
    staffMembersStore() {
      return useStaffMembersStore();
    },
    locationsStore() {
      return useLocationsStore();
    },
    areasStore() {
      return useAreasStore();
    },
    certificationsStore() {
      return useCertificationsStore();
    },
    colorsStore() {
      return useColorsStore();
    },
    rolesStore() {
      return useRolesStore();
    },
    toast() {
      return useToast();
    },
    filteredPrograms() {
      const query = this.searchQuery.toLowerCase().trim();
      if (!query) return this.programsStore.programs;

      return this.programsStore.programs.filter(
        (program) =>
          program.name.toLowerCase().includes(query) ||
          (program.description &&
            program.description.toLowerCase().includes(query)),
      );
    },
    selectedProgram() {
      return this.selectedProgramId
        ? this.programsStore.getProgramById(this.selectedProgramId)
        : null;
    },
    selectedActivity() {
      return this.selectedActivityId
        ? this.activitiesStore.getActivityById(this.selectedActivityId)
        : null;
    },
    programActivities() {
      return this.selectedProgramId
        ? this.activitiesStore.getActivitiesInProgram(this.selectedProgramId)
        : [];
    },
    programStaff(): StaffMember[] {
      if (!this.selectedProgram) return [];
      return (
        this.selectedProgram.staffMemberIds
          ?.map((id: string) => this.staffMembersStore.getStaffMemberById(id))
          .filter((staff: StaffMember | undefined) => staff !== undefined) || []
      );
    },
    programLocations(): Location[] {
      if (!this.selectedProgram) return [];
      return (
        this.selectedProgram.locationIds
          ?.map((id: string) => this.locationsStore.getLocationById(id))
          .filter((location: Location | undefined) => location !== undefined) ||
        []
      );
    },
    availableStaff(): StaffMember[] {
      if (!this.selectedProgram) return [];
      return this.staffMembersStore.staffMembers.filter(
        (staff) =>
          !this.selectedProgram!.staffMemberIds?.includes(staff.id) || false,
      );
    },
    availableLocations(): Location[] {
      if (!this.selectedProgram) return [];
      return this.locationsStore.locations.filter(
        (location) =>
          !this.selectedProgram!.locationIds?.includes(location.id) || false,
      );
    },
    programStaffIds: {
      get(): string[] {
        return this.selectedProgram?.staffMemberIds || ([] as string[]);
      },
      set(value: string[]) {
        if (this.selectedProgram) {
          this.updateProgramStaff(value);
        }
      },
    },
    programLocationIds: {
      get(): string[] {
        return this.selectedProgram?.locationIds || ([] as string[]);
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
        case "activity":
          return "Delete Activity?";
        case "staff":
          return "Remove Staff Member?";
        case "location":
          return "Remove Location?";
        default:
          return "";
      }
    },
    deleteConfirmMessage() {
      if (!this.deleteTarget) return "";
      if (this.deleteTarget.type === "program") {
        const program = this.programsStore.getProgramById(this.deleteTarget.id);
        return `Are you sure you want to delete "${program?.name}"? This will also delete all activities in this program. This action cannot be undone.`;
      } else if (this.deleteTarget.type === "activity") {
        const activity = this.activitiesStore.getActivityById(
          this.deleteTarget.id,
        );
        return `Are you sure you want to delete "${activity?.name}"? This action cannot be undone.`;
      } else if (this.deleteTarget.type === "staff") {
        const staff = this.staffMembersStore.getStaffMemberById(
          this.deleteTarget.id,
        );
        return `Are you sure you want to remove "${staff?.firstName} ${staff?.lastName}" from this program?`;
      } else if (this.deleteTarget.type === "location") {
        const location = this.locationsStore.getLocationById(
          this.deleteTarget.id,
        );
        return `Are you sure you want to remove "${location?.name}" from this program?`;
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
    getProgramColor(program: any): string {
      if (program.colorId) {
        const color = this.colorsStore.getColorById(program.colorId);
        return color?.hexValue || "#6366F1";
      }
      return "#6366F1";
    },
    getActivitiesCount(programId: string) {
      return this.activitiesStore.getActivitiesInProgram(programId).length;
    },
    getStaffCount(programId: string) {
      const program = this.programsStore.getProgramById(programId);
      return program?.staffMemberIds?.length || 0;
    },
    getLocationsCount(programId: string) {
      const program = this.programsStore.getProgramById(programId);
      return program?.locationIds?.length || 0;
    },
    getLocationName(locationId: string) {
      const location = this.locationsStore.getLocationById(locationId);
      return location?.name || "Unknown";
    },
    getAreaName(areaId: string) {
      const area = this.areasStore.getAreaById(areaId);
      return area?.name || "Unknown";
    },
    formatRole(roleId: string) {
      const role = this.rolesStore.getRoleById(roleId);
      return role
        ? role.name.charAt(0).toUpperCase() + role.name.slice(1)
        : "Unknown Role";
    },
    getStaffCertificationNames(staff: any): string[] {
      if (!staff.certificationIds) return [];
      return (
        staff.certificationIds?.map((id: string) => {
          const cert = this.certificationsStore.getCertificationById(id);
          return cert ? cert.name : "";
        }) || []
      ).filter((name: string) => name.length > 0);
    },
    formatLocationType(type: string) {
      return type
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },
    closeProgramModal() {
      this.showProgramModal = false;
      this.editingProgram = null;
    },
    closeActivityModal() {
      this.showActivityModal = false;
      this.editingActivity = null;
    },
    editProgram(program: Program) {
      this.editingProgram = program;
      this.showProgramModal = true;
    },
    deleteProgramConfirm(program: Program) {
      this.deleteTarget = { type: "program", id: program.id };
      this.showDeleteConfirm = true;
    },
    viewActivity(activity: Activity) {
      this.selectedActivityId = activity.id;
    },
    editActivity(activity: Activity) {
      this.editingActivity = activity;
      this.showActivityModal = true;
      this.selectedActivityId = activity.id;
    },
    async handleCreateNewActivity(activity: Activity) {
      try {
        await this.activitiesStore.addActivity(activity);
        this.toast.success("Activity created successfully");
      } catch (error: any) {
        this.toast.error(error.message || "Failed to create activity");
      }
    },
    async handleAddExistingActivity(activityId: string) {
      if (!this.selectedProgramId) return;

      try {
        await this.activitiesStore.addActivityToProgram(
          activityId,
          this.selectedProgramId,
        );
        this.toast.success("Activity added to program successfully");
      } catch (error: any) {
        this.toast.error(error.message || "Failed to add activity to program");
      }
    },
    async saveActivity(activity: Activity) {
      try {
        if (this.editingActivity) {
          await this.activitiesStore.updateActivity(
            this.editingActivity.id,
            activity,
          );
          this.toast.success("Activity updated successfully");
        } else {
          await this.activitiesStore.addActivity(activity);
          this.toast.success("Activity created successfully");
        }
        this.closeActivityModal();
      } catch (error: any) {
        this.toast.error(error.message || "Failed to save activity");
      }
    },
    deleteActivityConfirm(activity: Activity) {
      this.deleteTarget = { type: "activity", id: activity.id };
      this.showDeleteConfirm = true;
      this.selectedActivityId = null;
    },
    confirmRemoveStaff(staffId: string) {
      this.deleteTarget = { type: "staff", id: staffId };
      this.showDeleteConfirm = true;
    },
    confirmRemoveLocation(locationId: string) {
      this.deleteTarget = { type: "location", id: locationId };
      this.showDeleteConfirm = true;
    },
    async removeStaffFromProgram(staffId: string) {
      if (!this.selectedProgram) return;

      const updatedProgram = {
        ...this.selectedProgram,
        staffMemberIds: this.selectedProgram.staffMemberIds?.filter(
          (id: string) => id !== staffId,
        ),
      };

      try {
        await this.programsStore.updateProgram(
          this.selectedProgram.id,
          updatedProgram,
        );
        this.toast.success("Staff member removed from program");
      } catch (error: any) {
        this.toast.error(error.message || "Failed to remove staff member");
      }
    },
    async removeLocationFromProgram(locationId: string) {
      if (!this.selectedProgram) return;

      const updatedProgram = {
        ...this.selectedProgram,
        locationIds: this.selectedProgram.locationIds?.filter(
          (id) => id !== locationId,
        ),
      };

      try {
        await this.programsStore.updateProgram(
          this.selectedProgram.id,
          updatedProgram,
        );
        this.toast.success("Location removed from program");
      } catch (error: any) {
        this.toast.error(error.message || "Failed to remove location");
      }
    },
    async confirmDelete() {
      if (!this.deleteTarget) return;

      try {
        if (this.deleteTarget.type === "program") {
          await this.programsStore.deleteProgram(this.deleteTarget.id);
          this.toast.success("Program deleted successfully");
          this.selectedProgramId = null;
        } else if (this.deleteTarget.type === "activity") {
          await this.activitiesStore.deleteActivity(this.deleteTarget.id);
          this.toast.success("Activity deleted successfully");
        } else if (this.deleteTarget.type === "staff") {
          await this.removeStaffFromProgram(this.deleteTarget.id);
        } else if (this.deleteTarget.type === "location") {
          await this.removeLocationFromProgram(this.deleteTarget.id);
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
    // Staff helper methods
    getStaffLabel(staff: any): string {
      return `${staff.firstName} ${staff.lastName}`;
    },
    getStaffInitials(staff: any): string {
      return `${staff.firstName.charAt(0)}${staff.lastName.charAt(0)}`;
    },
    getStaffOption(staff: any): AutocompleteOption {
      return {
        label: `${staff.firstName} ${staff.lastName} (${this.formatRole(staff.roleId)})`,
        value: staff.id,
      };
    },
    // Location helper methods
    getLocationLabel(location: any): string {
      return `${location.name}`;
    },
    getLocationInitials(location: any): string {
      const words = location.name.split(" ");
      if (words.length >= 2) {
        return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
      }
      return location.name.substring(0, 2).toUpperCase();
    },
    getLocationOption(location: any): AutocompleteOption {
      return {
        label: `${location.name} (${this.formatLocationType(location.type)} • Capacity: ${location.capacity})`,
        value: location.id,
      };
    },
    // Update methods for SelectionList v-model binding
    async updateProgramStaff(staffIds: string[]) {
      if (!this.selectedProgram) return;

      const updatedProgram = {
        ...this.selectedProgram,
        staffMemberIds: staffIds,
      };

      try {
        await this.programsStore.updateProgram(
          this.selectedProgram.id,
          updatedProgram,
        );
        this.toast.success("Staff assignments updated");
      } catch (error: any) {
        this.toast.error(error.message || "Failed to update staff assignments");
      }
    },
    async updateProgramLocations(locationIds: string[]) {
      if (!this.selectedProgram) return;

      const updatedProgram = {
        ...this.selectedProgram,
        locationIds: locationIds,
      };

      try {
        await this.programsStore.updateProgram(
          this.selectedProgram.id,
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
  margin-bottom: 1.5rem;
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

/* Program Detail View */
.program-detail {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-header {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
}

.detail-header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
}

.detail-color-bar {
  width: 6px;
  border-radius: 3px;
  align-self: stretch;
  margin-right: 1.5rem;
}

.detail-header-info h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.detail-description {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.detail-header-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* Detail Sections */
.detail-section {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-light);
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

/* Activities List */
.activities-list {
  display: grid;
  gap: 1rem;
}

.activity-item {
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.activity-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.activity-info h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
}

.activity-info p {
  margin: 0;
  font-size: 0.875rem;
}

.activity-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Staff List */
.staff-list {
  display: grid;
  gap: 1rem;
}

.staff-certifications {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.certification-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: white;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

/* Locations List */
.locations-list {
  display: grid;
  gap: 1rem;
}

.location-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--surface-secondary);
  color: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.location-meta {
  font-size: 0.875rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Empty States */
.empty-section {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-section p {
  margin: 0;
}

@media (max-width: 768px) {
  .programs-grid {
    grid-template-columns: 1fr;
  }

  .detail-header {
    padding: 1.5rem;
  }

  .detail-header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .detail-header-actions {
    flex-direction: column;
  }

  .detail-header-actions .btn {
    width: 100%;
  }
}
</style>
