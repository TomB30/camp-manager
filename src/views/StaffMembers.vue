<template>
  <div class="container">
    <div class="staff-view">
      <ViewHeader title="Staff Management">
        <template #actions>
          <BaseButton
            color="primary"
            @click="showModal = true"
            label="Staff Member"
            icon="add"
          />
        </template>
      </ViewHeader>

      <!-- Search and Filters -->
      <FilterBar
        v-model:searchQuery="searchQuery"
        v-model:filter-role="filterRole"
        v-model:filter-certification="filterCertification"
        v-model:filter-program="filterProgram"
        :filters="staffFilters"
        :filtered-count="filteredMembers.length"
        :total-count="staffMembersStore.staffMembers.length"
        @clear="clearFilters"
      >
        <template #prepend>
          <ViewToggle v-model="viewMode" />
        </template>
      </FilterBar>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="staff-grid">
        <StaffCard
          v-for="member in filteredMembers"
          :key="member.id"
          :member="member"
          :formatted-role="formatRole(member.roleId)"
          @click="selectMember(member.id)"
        />

        <EmptyState
          v-if="
            filteredMembers.length === 0 &&
            staffMembersStore.staffMembers.length === 0
          "
          type="empty"
          title="No Staff Members Yet"
          message="Add your first staff member to start building your camp team and managing assignments."
          action-text="Staff Member"
          @action="showModal = true"
          icon-name="Users"
        />

        <EmptyState
          v-if="
            filteredMembers.length === 0 &&
            staffMembersStore.staffMembers.length > 0
          "
          type="no-results"
          title="No Staff Members Found"
          message="No staff members match your current filters. Try adjusting your search criteria."
          action-text="Clear Filters"
          action-button-class="btn-secondary"
          @action="clearFilters"
          icon-name="Users"
          hide-action-icon
        />
      </div>

      <!-- Table View -->
      <DataTable
        v-if="viewMode === 'table'"
        :columns="memberColumns"
        :data="filteredMembers"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        row-key="id"
      >
        <template #cell-name="{ item }">
          <div class="member-name-content">
            <AvatarInitials
              :first-name="item.firstName"
              :last-name="item.lastName"
              size="sm"
            />
            <div class="member-fullname">
              {{ item.firstName }} {{ item.lastName }}
            </div>
          </div>
        </template>

        <template #cell-role="{ item }">
          <span class="badge badge-primary badge-sm">{{
            formatRole(item.role)
          }}</span>
        </template>

        <template #cell-certifications="{ item }">
          <span
            v-if="item.certificationIds && item.certificationIds.length > 0"
            class="badge badge-success badge-sm"
          >
            {{ item.certificationIds.length }} cert(s)
          </span>
          <span v-else class="text-caption">None</span>
        </template>

        <template #cell-events="{ item }">
          <span class="event-count">{{ getMemberEvents(item.id).length }}</span>
        </template>

        <template #cell-actions="{ item }">
          <BaseButton
            outline
            color="grey-8"
            size="sm"
            @click.stop="selectMember(item.id)"
            label="View Details"
          />
        </template>
      </DataTable>

      <!-- Member Detail Modal -->
      <StaffMemberDetailModal
        v-if="!!selectedMemberId"
        :member="selectedMember"
        @close="selectedMemberId = null"
        @edit="editMember"
        @delete="deleteMemberConfirm"
      >
        <template #manager-info>
          <div>
            <span class="badge badge-success">{{
              selectedMember ? getManagerName(selectedMember.managerId) : ""
            }}</span>
          </div>
        </template>
        <template #direct-reports>
          <div
            v-if="
              selectedMember && getDirectReports(selectedMember.id).length > 0
            "
            class="flex gap-1 flex-wrap"
          >
            <span
              v-for="report in getDirectReports(selectedMember.id)"
              :key="report.id"
              class="badge badge-primary"
            >
              {{ report.firstName }} {{ report.lastName }}
            </span>
          </div>
          <div v-else class="text-caption">No direct reports</div>
        </template>
        <template #events-list>
          <EventsByDate
            :events="selectedMember ? getMemberEvents(selectedMember.id) : []"
            :show-location="true"
            :get-location-name="getLocationName"
            empty-message="No events assigned"
          />
        </template>
      </StaffMemberDetailModal>

      <!-- Add/Edit Member Modal -->
      <StaffMemberFormModal
        v-if="showModal"
        :is-editing="!!editingMemberId"
        :form-data="formData"
        :staff-members="staffMembersStore.staffMembers"
        :current-member-id="editingMemberId || ''"
        @close="closeModal"
        @save="saveMember"
      />

      <!-- Confirm Delete Modal -->
      <ConfirmModal
        v-if="showConfirmModal"
        title="Delete Staff Member"
        message="Are you sure you want to delete this staff member?"
        details="They will be removed from all events."
        confirm-text="Delete"
        :danger-mode="true"
        @confirm="handleConfirmAction"
        @cancel="handleCancelConfirm"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  useStaffMembersStore,
  useCertificationsStore,
  useProgramsStore,
  useEventsStore,
  useAreasStore,
  useRolesStore,
} from "@/stores";
import type { StaffMember, Event } from "@/types";
import ViewHeader from "@/components/ViewHeader.vue";
import AvatarInitials from "@/components/AvatarInitials.vue";
import StaffCard from "@/components/cards/StaffCard.vue";
import FilterBar, { type Filter } from "@/components/FilterBar.vue";
import EventsByDate from "@/components/EventsByDate.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import DataTable from "@/components/DataTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import Autocomplete, {
  AutocompleteOption,
} from "@/components/Autocomplete.vue";
import EmptyState from "@/components/EmptyState.vue";
import StaffMemberDetailModal from "@/components/modals/StaffMemberDetailModal.vue";
import StaffMemberFormModal from "@/components/modals/StaffMemberFormModal.vue";

export default defineComponent({
  name: "StaffMembers",
  components: {
    ViewHeader,
    AvatarInitials,
    StaffCard,
    FilterBar,
    EventsByDate,
    ConfirmModal,
    DataTable,
    ViewToggle,
    Autocomplete,
    EmptyState,
    StaffMemberDetailModal,
    StaffMemberFormModal,
  },
  data() {
    return {
      selectedMemberId: null as string | null,
      showModal: false,
      editingMemberId: null as string | null,
      viewMode: "grid" as "grid" | "table",
      expandedMembers: new Set<string>(),
      currentPage: 1,
      pageSize: 10,
      showConfirmModal: false,
      confirmAction: null as (() => void) | null,
      formData: {
        firstName: "",
        lastName: "",
        roleId: "" as StaffMember["roleId"],
        email: "",
        phone: "",
        certificationIds: [] as string[],
        managerId: "",
      },
      searchQuery: "",
      filterRole: "",
      filterCertification: "",
      filterProgram: "",
      memberColumns: [
        { key: "name", label: "Name", width: "200px" },
        { key: "role", label: "Role", width: "140px" },
        { key: "email", label: "Email", width: "200px" },
        { key: "phone", label: "Phone", width: "150px" },
        { key: "certifications", label: "Certifications", width: "140px" },
        { key: "events", label: "Events", width: "100px" },
        { key: "actions", label: "Actions", width: "140px" },
      ],
    };
  },
  computed: {
    staffMembersStore() {
      return useStaffMembersStore();
    },
    certificationsStore() {
      return useCertificationsStore();
    },
    programsStore() {
      return useProgramsStore();
    },
    eventsStore() {
      return useEventsStore();
    },
    areasStore() {
      return useAreasStore();
    },
    rolesStore() {
      return useRolesStore();
    },
    roleOptions(): Array<AutocompleteOption> {
      return this.rolesStore.roles.map((role) => ({
        label: role.name,
        value: role.id,
      }));
    },
    managerOptions(): Array<AutocompleteOption> {
      const options = [{ label: "No Manager (Top Level)", value: "" }];
      const managers: Array<AutocompleteOption> =
        this.staffMembersStore.staffMembers
          .filter((m) => m.id !== this.editingMemberId)
          .map((member: StaffMember) => ({
            label: `${member.firstName} ${member.lastName} (${this.formatRole(member.roleId)})`,
            value: member.id,
          }));
      return [...options, ...managers];
    },
    staffFilters(): Filter[] {
      return [
        {
          model: "filterRole",
          value: this.filterRole,
          placeholder: "Filter by Role",
          options: this.rolesStore.roles.map((role) => ({
            label: role.name,
            value: role.id,
          })),
        },
        {
          model: "filterCertification",
          value: this.filterCertification,
          placeholder: "Filter by Certification",
          options: this.certificationsStore.certifications.map((cert) => ({
            label: cert.name,
            value: cert.name,
          })),
        },
        {
          model: "filterProgram",
          value: this.filterProgram,
          placeholder: "Filter by Program",
          options: this.programsStore.programs.map((program) => ({
            label: program.name,
            value: program.id,
          })),
        },
      ];
    },
    selectedMember(): StaffMember | null {
      if (!this.selectedMemberId) return null;
      return (
        this.staffMembersStore.getStaffMemberById(this.selectedMemberId) || null
      );
    },
    filteredMembers(): StaffMember[] {
      let members: StaffMember[] = this.staffMembersStore.staffMembers;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        members = members.filter(
          (member: StaffMember) =>
            member.firstName.toLowerCase().includes(query) ||
            member.lastName.toLowerCase().includes(query) ||
            `${member.firstName} ${member.lastName}`
              .toLowerCase()
              .includes(query) ||
            (member.email && member.email.toLowerCase().includes(query)),
        );
      }

      // Role filter
      if (this.filterRole) {
        members = members.filter(
          (member: StaffMember) => member.roleId === this.filterRole,
        );
      }

      // Certification filter
      if (this.filterCertification) {
        members = members.filter((member: StaffMember) => {
          if (!member.certificationIds) return false;
          return member.certificationIds.some((id) => {
            const cert = this.certificationsStore.getCertificationById(id);
            return cert && cert.name === this.filterCertification;
          });
        });
      }

      // Program filter
      if (this.filterProgram) {
        members = members.filter((member: StaffMember) => {
          const program = this.programsStore.getProgramById(this.filterProgram);
          return (
            (program && program.staffMemberIds?.includes(member.id)) || false
          );
        });
      }

      return members;
    },
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    filterRole() {
      this.currentPage = 1;
    },
    filterCertification() {
      this.currentPage = 1;
    },
    filterProgram() {
      this.currentPage = 1;
    },
  },
  mounted() {
    // Auto-expand all members with reports
    this.staffMembersStore.staffMembers.forEach((member) => {
      if (this.getDirectReports(member.id).length > 0) {
        this.expandedMembers.add(member.id);
      }
    });

    // Initialize formData with first available role
    if (this.rolesStore.roles.length > 0 && !this.formData.roleId) {
      this.formData.roleId = this.rolesStore.roles[0].id;
    }
  },
  methods: {
    clearFilters(): void {
      this.searchQuery = "";
      this.filterRole = "";
      this.filterCertification = "";
      this.filterProgram = "";
    },
    getDirectReports(managerId: string): StaffMember[] {
      return this.filteredMembers.filter(
        (member) => member.managerId === managerId,
      );
    },
    getManagerName(managerId: string | undefined): string {
      if (!managerId) return "None";
      const manager = this.staffMembersStore.getStaffMemberById(managerId);
      return manager ? `${manager.firstName} ${manager.lastName}` : "Unknown";
    },
    formatRole(roleId: string): string {
      const role = this.rolesStore.getRoleById(roleId);
      return role
        ? role.name.charAt(0).toUpperCase() + role.name.slice(1)
        : "Unknown Role";
    },
    getMemberEvents(memberId: string): Event[] {
      return this.eventsStore.staffEvents(memberId);
    },
    getLocationName(locationId: string): string {
      const location = this.areasStore.getAreaById(locationId);
      return location?.name || "Unknown Location";
    },
    selectMember(memberId: string): void {
      this.selectedMemberId = memberId;
    },
    editMember(): void {
      if (!this.selectedMember) return;

      this.editingMemberId = this.selectedMember.id;
      this.formData = {
        firstName: this.selectedMember.firstName,
        lastName: this.selectedMember.lastName,
        roleId: this.selectedMember.roleId,
        email: this.selectedMember.email || "",
        phone: this.selectedMember.phone || "",
        certificationIds: this.selectedMember.certificationIds || [],
        managerId: this.selectedMember.managerId || "",
      };

      this.selectedMemberId = null;
      this.showModal = true;
    },
    async saveMember(formData: typeof this.formData): Promise<void> {
      const memberData: StaffMember = {
        id: this.editingMemberId || `staff-${Date.now()}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        roleId: formData.roleId,
        email: formData.email,
        phone: formData.phone,
        certificationIds: formData.certificationIds,
        managerId: formData.managerId || undefined,
      };

      if (this.editingMemberId) {
        await this.staffMembersStore.updateStaffMember(memberData);
      } else {
        await this.staffMembersStore.addStaffMember(memberData);
      }

      this.closeModal();
    },
    deleteMemberConfirm(): void {
      if (!this.selectedMemberId) return;
      this.confirmAction = async () => {
        if (this.selectedMemberId) {
          await this.staffMembersStore.deleteStaffMember(this.selectedMemberId);
          this.selectedMemberId = null;
        }
      };
      this.showConfirmModal = true;
    },
    async handleConfirmAction(): Promise<void> {
      if (this.confirmAction) {
        await this.confirmAction();
      }
      this.showConfirmModal = false;
      this.confirmAction = null;
    },
    handleCancelConfirm(): void {
      this.showConfirmModal = false;
      this.confirmAction = null;
    },
    closeModal(): void {
      this.showModal = false;
      this.editingMemberId = null;
      this.formData = {
        firstName: "",
        lastName: "",
        roleId: (this.rolesStore.roles[0]?.id || "") as StaffMember["roleId"],
        email: "",
        phone: "",
        certificationIds: [],
        managerId: "",
      };
    },
  },
});
</script>

<style scoped>
.staff-view {
  max-width: 1400px;
  margin: 0 auto;
}

.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.staff-grid .empty-state {
  grid-column: 1 / -1;
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

.event-item {
  padding: 0.75rem;
  background: var(--background);
  border-radius: var(--radius);
  border-left: 4px solid var(--primary-color);
}

.event-item-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

/* Table View Styles */
/* Table cell custom styles */
.member-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.member-fullname {
  font-weight: 500;
  color: var(--text-primary);
}

.contact-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

/* Org Chart - Tree List Style */
.org-chart-container {
  padding: 0;
}

.hierarchy-tree {
  max-width: 1000px;
  margin: 0 auto;
}

.tree-section {
  margin-bottom: 2rem;
}

.tree-item {
  display: flex;
  align-items: stretch;
  margin-bottom: 0.5rem;
  position: relative;
}

.tree-item:hover .tree-content {
  background: var(--background);
  box-shadow: var(--shadow-lg);
}

.tree-line {
  position: relative;
  min-width: 40px;
  margin-right: 1rem;
}

.tree-line::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 20px;
  width: 2px;
  background: var(--border-color);
}

.tree-line::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 20px;
  width: 20px;
  height: 2px;
  background: var(--border-color);
}

.tree-line.is-last::before {
  bottom: 50%;
}

.level-0 .tree-line {
  display: none;
}

.level-1 .tree-line {
  margin-left: 0;
}

.level-2 .tree-line {
  margin-left: 40px;
}

.tree-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--card-background);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}

.level-0 .tree-content {
  border: 2px solid var(--primary-color);
  box-shadow: var(--shadow-lg);
}

.expand-btn {
  background: transparent;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.15s ease;
  border-radius: var(--radius);
  flex-shrink: 0;
}

.expand-btn:hover {
  background: var(--background);
  color: var(--primary-color);
}

.expand-btn svg {
  transition: transform 0.2s ease;
}

.tree-info {
  flex: 1;
  min-width: 0;
}

.tree-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.tree-name-sm {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.125rem;
  color: var(--text-primary);
}

.tree-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.tree-role {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.tree-role-sm {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.tree-count {
  font-size: 0.75rem;
  color: var(--primary-color);
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  background: var(--primary-color);
  color: white;
  border-radius: 999px;
  opacity: 0.8;
}
</style>
