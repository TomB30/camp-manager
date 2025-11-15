<template>
  <div class="view">
    <TabHeader
      title="Staff Management"
      description="Manage your staff members and their roles, certifications, and assignments."
      action-text="Staff Member"
      @action="showModal = true"
    />

    <!-- Search and Filters -->
    <FilterBar
      v-model:searchQuery="searchQuery"
      v-model:filter-role="filterRole"
      v-model:filter-certification="filterCertification"
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
    <TransitionGroup
      v-if="viewMode === 'grid'"
      name="list"
      tag="div"
      class="staff-grid"
    >
      <StaffCard
        v-for="member in filteredMembers"
        :key="member.meta.id"
        :member="member"
        :formatted-role="formatRole(member.spec.roleId)"
        @click="selectMember(member.meta.id)"
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
    </TransitionGroup>

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
            :first-name="item.meta.name.split(' ')[0]"
            :last-name="item.meta.name.split(' ').slice(1).join(' ')"
            size="sm"
          />
          <div class="member-fullname">
            {{ item.meta.name }}
          </div>
        </div>
      </template>

      <template #cell-role="{ item }">
        <span class="badge badge-primary badge-sm">{{
          formatRole(item.spec.roleId)
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
        <span class="event-count">{{
          getMemberEvents(item.meta.id).length
        }}</span>
      </template>

      <template #cell-actions="{ item }">
        <BaseButton
          outline
          color="grey-8"
          size="sm"
          @click="selectMember(item.meta.id)"
          label="View Details"
        />
      </template>
    </DataTable>

    <!-- Member Detail Modal -->
    <StaffMemberDetailModal
      v-if="!!selectedMemberId && selectedMember"
      :member="selectedMember"
      @close="selectedMemberId = null"
      @edit="editMember"
      @delete="deleteMemberConfirm"
    >
      <template #events-list>
        <EventsByDate
          :events="
            selectedMember ? getMemberEvents(selectedMember.meta.id) : []
          "
          :show-location="true"
          :get-location-name="getLocationName"
          empty-message="No events assigned"
        />
      </template>
    </StaffMemberDetailModal>

    <!-- Add/Edit Member Modal -->
    <StaffMemberFormModal
      v-if="showModal"
      :staff-member-id="editingMemberId || undefined"
      @close="closeModal"
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
import type { StaffMember, Event } from "@/generated/api";
import AvatarInitials from "@/components/AvatarInitials.vue";
import StaffCard from "@/components/cards/StaffCard.vue";
import FilterBar, { type Filter } from "@/components/FilterBar.vue";
import EventsByDate from "@/components/EventsByDate.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import DataTable from "@/components/DataTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import EmptyState from "@/components/EmptyState.vue";
import StaffMemberDetailModal from "@/components/modals/StaffMemberDetailModal.vue";
import StaffMemberFormModal from "@/components/modals/StaffMemberFormModal.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import Icon from "@/components/Icon.vue";

export default defineComponent({
  name: "StaffMembers",
  components: {
    AvatarInitials,
    StaffCard,
    FilterBar,
    EventsByDate,
    ConfirmModal,
    DataTable,
    ViewToggle,
    EmptyState,
    StaffMemberDetailModal,
    StaffMemberFormModal,
    TabHeader,
    Icon,
  },
  data() {
    return {
      selectedMemberId: null as string | null,
      showModal: false,
      editingMemberId: null as string | null,
      viewMode: "grid" as "grid" | "table",
      currentPage: 1,
      pageSize: 10,
      showConfirmModal: false,
      confirmAction: null as (() => void) | null,
      searchQuery: "",
      filterRole: "",
      filterCertification: "",
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
    staffFilters(): Filter[] {
      return [
        {
          model: "filterRole",
          value: this.filterRole,
          placeholder: "Filter by Role",
          options: this.rolesStore.roles.map((role) => ({
            label: role.meta.name,
            value: role.meta.id,
          })),
        },
        {
          model: "filterCertification",
          value: this.filterCertification,
          placeholder: "Filter by Certification",
          options: this.certificationsStore.certifications.map((cert) => ({
            label: cert.meta.name,
            value: cert.meta.name,
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
            member.meta.name.toLowerCase().includes(query) ||
            (member.spec.phone &&
              member.spec.phone.toLowerCase().includes(query))
        );
      }

      // Role filter
      if (this.filterRole) {
        members = members.filter(
          (member: StaffMember) => member.spec.roleId === this.filterRole
        );
      }

      // Certification filter
      if (this.filterCertification) {
        members = members.filter((member: StaffMember) => {
          if (!member.spec.certificationIds) return false;
          return member.spec.certificationIds.some((id) => {
            const cert = this.certificationsStore.getCertificationById(id);
            return cert && cert.meta.name === this.filterCertification;
          });
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
  methods: {
    clearFilters(): void {
      this.searchQuery = "";
      this.filterRole = "";
      this.filterCertification = "";
    },
    formatRole(roleId: string): string {
      const role = this.rolesStore.getRoleById(roleId);
      return role
        ? role.meta.name.charAt(0).toUpperCase() + role.meta.name.slice(1)
        : "Unknown Role";
    },
    getMemberEvents(memberId: string): Event[] {
      return this.eventsStore.staffEvents(memberId);
    },
    getLocationName(locationId: string): string {
      const location = this.areasStore.getAreaById(locationId);
      return location?.meta.name || "Unknown Location";
    },
    selectMember(memberId: string): void {
      this.selectedMemberId = memberId;
    },
    editMember(): void {
      if (!this.selectedMember) return;

      this.editingMemberId = this.selectedMember.meta.id;
      this.selectedMemberId = null;
      this.showModal = true;
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
    },
  },
});
</script>

<style scoped>
.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.5rem;
}

.staff-grid .empty-state {
  grid-column: 1 / -1;
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
</style>
