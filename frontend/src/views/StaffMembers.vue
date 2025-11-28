<template>
  <div class="view">
    <LoadingState v-if="!isInitialized" message="Loading staff members..." />
    <template v-else>
      <TabHeader
        title="Staff Management"
        description="Manage your staff members and their roles, certifications, and assignments."
        action-text="Staff Member"
        @action="showModal = true"
      />

      <FilterBar
        v-model:searchQuery="filters.searchQuery"
        @clear="clearFilters"
      >
        <template #filters>
          <div class="row q-gutter-x-sm items-center">
            <BaseSelect
              v-model="filters.gender"
              :options="genderOptions"
              @update:model-value="
                updateFilter('gender', $event);
                fetchStaffMembers();
              "
              label="Filter by Gender"
            />
            <BaseSelect
              v-model="filters.roleId"
              :options="roleOptions"
              @update:model-value="
                updateFilter('roleId', $event);
                fetchStaffMembers();
              "
              label="Filter by Role"
            />
          </div>
        </template>
        <template #prepend>
          <ViewToggle v-model="filters.viewMode" />
        </template>
      </FilterBar>

      <ServerTable
        v-if="isInitialized"
        :columns="memberColumns"
        :rows="staffMembersData"
        row-key="meta.id"
        :grid="filters.viewMode === 'grid'"
        :loading="loading"
        :pagination="filters.pagination"
        @update:pagination="
          updateFilter('pagination', $event);
          fetchStaffMembers();
        "
        @row-click="selectMember"
      >
        <template #item="{ item }">
          <StaffCard
            :member="item"
            :formatted-role="formatRole(item.spec.roleId)"
            @click="selectMember(item.meta.id)"
          />
        </template>

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

        <template #empty>
          <EmptyState
            type="empty"
            title="No Staff Members Yet"
            message="Add your first staff member to start building your camp team and managing assignments."
            action-text="Staff Member"
            @action="showModal = true"
            icon-name="Users"
          />
        </template>
      </ServerTable>

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

      <StaffMemberFormModal
        v-if="showModal"
        :staff-member-id="editingMemberId || undefined"
        @close="closeModal"
      />

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
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  useStaffMembersStore,
  useCertificationsStore,
  useEventsStore,
  useAreasStore,
  useRolesStore,
} from "@/stores";
import { usePageFilters } from "@/composables/usePageFilters";
import type { StaffMember, Event, Role } from "@/generated/api";
import type { QTableColumn } from "quasar";
import AvatarInitials from "@/components/AvatarInitials.vue";
import StaffCard from "@/components/cards/StaffCard.vue";
import FilterBar from "@/components/FilterBar.vue";
import EventsByDate from "@/components/EventsByDate.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import ServerTable from "@/components/ServerTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import EmptyState from "@/components/EmptyState.vue";
import StaffMemberDetailModal from "@/components/modals/StaffMemberDetailModal.vue";
import StaffMemberFormModal from "@/components/modals/StaffMemberFormModal.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import LoadingState from "@/components/LoadingState.vue";
import { isBackendEnabled } from "@/config/dataSource";
import { ISelectOption } from "@/components/SelectionList.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";

export default defineComponent({
  name: "StaffMembers",
  components: {
    AvatarInitials,
    StaffCard,
    FilterBar,
    EventsByDate,
    ConfirmModal,
    ServerTable,
    ViewToggle,
    EmptyState,
    StaffMemberDetailModal,
    StaffMemberFormModal,
    TabHeader,
    LoadingState,
    BaseSelect,
  },
  setup() {
    const { filters, updateFilter, updateFilters, isInitialized } =
      usePageFilters("staffMembers", {
        searchQuery: "",
        gender: "",
        roleId: "",
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
      staffMembersData: [] as StaffMember[],
      selectedMemberId: null as string | null,
      showModal: false,
      editingMemberId: null as string | null,
      showConfirmModal: false,
      confirmAction: null as (() => void) | null,
      memberColumns: [
        {
          name: "name",
          label: "Name",
          field: (row: StaffMember) => row.meta.name,
          align: "left" as const,
          sortable: true,
        },
        {
          name: "roleId",
          label: "Role",
          field: (row: StaffMember) => row.spec.roleId,
          align: "left" as const,
          sortable: true,
          format: (value: string) => this.formatRole(value),
        },
        {
          name: "phone",
          label: "Phone",
          field: (row: StaffMember) => row.spec.phone,
          align: "left" as const,
          sortable: true,
        },
        {
          name: "gender",
          label: "Gender",
          field: (row: StaffMember) => row.spec.gender,
          align: "left" as const,
          sortable: true,
          format: (value: string) => this.formatGender(value),
        },
        {
          name: "certificationIds",
          label: "Certifications",
          field: (row: StaffMember) => row.spec.certificationIds,
          align: "left" as const,
          format: (value: string[] | undefined) =>
            (value?.length || 0) + " cert(s)",
        },
      ] as QTableColumn[],
    };
  },
  async created() {
    // Load reference data for filters
    await Promise.all([
      this.rolesStore.loadRoles(),
      this.certificationsStore.loadCertifications(),
      this.eventsStore.loadEvents(),
      this.areasStore.loadAreas(),
    ]);
  },
  computed: {
    staffMembersStore() {
      return useStaffMembersStore();
    },
    certificationsStore() {
      return useCertificationsStore();
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
    selectedMember(): StaffMember | null {
      if (!this.selectedMemberId) return null;
      return (
        this.staffMembersData.find(
          (m) => m.meta.id === this.selectedMemberId,
        ) || null
      );
    },
    genderOptions(): ISelectOption[] {
      return [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
      ];
    },
    roleOptions(): ISelectOption[] {
      return this.rolesStore.roles.map((role: Role) => ({
        label: role.meta.name,
        value: role.meta.id,
      }));
    },
  },
  methods: {
    formatGender(gender: string): string {
      return gender.charAt(0).toUpperCase() + gender.slice(1);
    },
    async fetchStaffMembers(): Promise<void> {
      if (!this.isInitialized) return;

      if (!isBackendEnabled()) {
        this.staffMembersData = await this.staffMembersStore.loadStaffMembers();
      } else {
        try {
          const response =
            await this.staffMembersStore.loadStaffMembersPaginated({
              offset: this.filters.pagination.offset,
              limit: this.filters.pagination.limit,
              search: this.filters.searchQuery || undefined,
              sortBy: this.filters.pagination.sortBy,
              sortOrder: this.filters.pagination.sortOrder,
              filterBy: this.buildFilterBy(),
            });

          this.staffMembersData = response.items;
          this.updateFilter("pagination", {
            ...this.filters.pagination,
            total: response.total,
          });
        } catch (error) {
          console.error("Failed to fetch staff members:", error);
          this.staffMembersData = [];
        }
      }
    },
    buildFilterBy(): string[] {
      const filterBy = [];
      if (this.filters.gender) {
        filterBy.push(`gender==${this.filters.gender}`);
      }
      if (this.filters.roleId) {
        filterBy.push(`roleId==${this.filters.roleId}`);
      }
      return filterBy;
    },
    clearFilters(): void {
      this.updateFilters({
        searchQuery: "",
        pagination: {
          ...this.filters.pagination,
          offset: 0,
        },
      });
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
    selectMember(member: StaffMember): void {
      this.selectedMemberId = member.meta.id;
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
          await this.fetchStaffMembers();
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
  watch: {
    isInitialized: {
      immediate: true,
      handler(initialized) {
        if (initialized) {
          this.fetchStaffMembers();
        }
      },
    },
    "filters.searchQuery"() {
      this.updateFilter("pagination", {
        ...this.filters.pagination,
        offset: 0,
      });
      this.fetchStaffMembers();
    },
  },
});
</script>

<style scoped lang="scss">
.member-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.member-fullname {
  font-weight: 500;
  color: var(--text-primary);
}
</style>
