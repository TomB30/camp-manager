<template>
  <div class="container">
    <div class="view">
      <ViewHeader
        title="Groups"
        tooltip="Create and manage groups with flexible assignment options. Groups can contain campers, staff, or even other groups. Use filters for automatic assignment or manually select members."
      >
        <template #actions>
          <BaseButton
            color="primary"
            @click="showModal = true"
            label="Group"
            icon="add"
          />
        </template>
      </ViewHeader>

      <FilterBar
        v-model:searchQuery="searchQuery"
        v-model:filter-type="filterType"
        v-model:filter-session="filterSession"
        v-model:filter-label="filterLabel"
        :filters="groupsFilters"
        :filtered-count="filteredGroups.length"
        :total-count="groupsStore.groups.length"
        search-placeholder="Search groups..."
        @clear="clearFilters"
      >
        <template #prepend>
          <ViewToggle v-model="viewMode" />
        </template>
      </FilterBar>

      <div v-if="viewMode === 'grid'" class="groups-grid">
        <GroupCard
          v-for="group in filteredGroups"
          :key="group.meta.id"
          :group="group"
          :campers-count="getCampersCount(group.meta.id)"
          :staff-count="getStaffCount(group.meta.id)"
          @click="selectGroup(group.meta.id)"
        />

        <EmptyState
          v-if="filteredGroups.length === 0 && groupsStore.groups.length === 0"
          type="empty"
          title="No Groups Yet"
          message="Create your first group to organize campers and staff efficiently."
          action-text="Group"
          icon-name="FolderOpen"
          @action="showModal = true"
        />

        <EmptyState
          v-if="filteredGroups.length === 0 && groupsStore.groups.length > 0"
          type="no-results"
          title="No Groups Found"
          message="No groups match your current filters. Try adjusting your search criteria."
          action-text="Clear Filters"
          action-button-class="btn-secondary"
          hide-action-icon
          icon-name="FolderOpen"
          @action="clearFilters"
        />
      </div>

      <DataTable
        v-if="viewMode === 'table'"
        :columns="groupColumns"
        :data="filteredGroups"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        row-key="id"
      >
        <template #cell-name="{ item }">
          <div class="group-name-content">
            <div class="group-name-text">{{ item.meta.name }}</div>
          </div>
        </template>

        <template #cell-type="{ item }">
          <div class="type-badges">
            <span v-if="isNestedGroup(item)" class="badge badge-sm badge-info"
              >Nested</span
            >
            <span
              v-else-if="hasAutoAssignedCampers(item)"
              class="badge badge-sm badge-primary"
              >Auto Campers</span
            >
            <span
              v-else-if="hasManualCampers(item)"
              class="badge badge-sm badge-primary"
              >Manual Campers</span
            >
            <span v-else class="badge badge-sm badge-secondary">Empty</span>

            <span
              v-if="item.housingRoomId"
              class="badge badge-sm badge-secondary"
              >Housing</span
            >
          </div>
        </template>

        <template #cell-members="{ item }">
          <div
            class="members-counts text-caption row items-center q-gutter-x-md"
          >
            <span
              v-if="getCampersCount(item.meta.id) > 0"
              class="badge badge-success badge-sm"
            >
              {{ getCampersCount(item.meta.id) }} campers
            </span>
            <span
              v-if="getStaffCount(item.meta.id) > 0"
              class="badge badge-success badge-sm"
            >
              {{ getStaffCount(item.meta.id) }} staff
            </span>
            <span
              v-if="
                getCampersCount(item.meta.id) === 0 && getStaffCount(item.meta.id) === 0
              "
              class="text-caption text-sm"
            >
              No members
            </span>
          </div>
        </template>

        <template #cell-session="{ item }">
          <span v-if="item.sessionId" class="text-caption">{{
            getSessionName(item.sessionId)
          }}</span>
          <span v-else class="text-caption text-sm">-</span>
        </template>

        <template #cell-actions="{ item }">
          <BaseButton
            outline
            color="grey-8"
            size="sm"
            @click="selectGroup(item.meta.id)"
            label="View Details"
          />
        </template>
      </DataTable>

      <GroupDetailModal
        v-if="!!selectedGroupId"
        :group="selectedGroup"
        :campers="groupCampers"
        :staff="groupStaff"
        @close="selectedGroupId = null"
        @edit="editGroup"
        @delete="deleteGroupConfirm"
      />

      <GroupFormModal
        v-if="showModal"
        :is-editing="!!editingGroupId"
        :form-data="formData"
        :campers="campersStore.campers"
        :staff-members="staffMembersStore.staffMembers"
        :groups="groupsStore.groups"
        :labels="labelsStore.labels"
        :sessions="sessionsStore.sessions"
        :housing-rooms="housingRoomsStore.housingRooms"
        :certifications="certificationsStore.certifications"
        :editing-group-id="editingGroupId"
        @close="closeModal"
        @save="saveGroup"
      />

      <ConfirmModal
        v-if="showConfirmModal"
        title="Delete Group"
        :message="`Are you sure you want to delete the group '${groupToDelete?.name}'?`"
        details="This action cannot be undone. The group will be permanently deleted."
        confirm-text="Delete"
        :danger-mode="true"
        @confirm="handleConfirmDelete"
        @cancel="handleCancelDelete"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  useGroupsStore,
  useCampersStore,
  useStaffMembersStore,
  useLabelsStore,
  useSessionsStore,
  useHousingRoomsStore,
  useCertificationsStore,
} from "@/stores";
import type { Group, Camper, StaffMember, Label, Session } from "@/types";
import ViewHeader from "@/components/ViewHeader.vue";
import EmptyState from "@/components/EmptyState.vue";
import GroupCard from "@/components/cards/GroupCard.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import FilterBar, { type Filter } from "@/components/FilterBar.vue";
import DataTable from "@/components/DataTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import GroupDetailModal from "@/components/modals/GroupDetailModal.vue";
import GroupFormModal from "@/components/modals/GroupFormModal.vue";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "GroupsNew",
  components: {
    ViewHeader,
    EmptyState,
    GroupCard,
    ConfirmModal,
    FilterBar,
    DataTable,
    ViewToggle,
    GroupDetailModal,
    GroupFormModal,
  },
  data() {
    return {
      selectedGroupId: null as string | null,
      showModal: false,
      editingGroupId: null as string | null,
      showConfirmModal: false,
      groupToDelete: null as { id: string; name: string } | null,
      searchQuery: "",
      filterType: "",
      filterSession: "",
      filterLabel: "",
      viewMode: "grid" as "grid" | "table",
      currentPage: 1,
      pageSize: 10,
      formData: {
        name: "",
        description: "",
        sessionId: "",
        housingRoomId: "",
        groupIds: [] as string[],
        camperFilters: {
          ageMin: undefined as number | undefined,
          ageMax: undefined as number | undefined,
          gender: "" as "" | "male" | "female",
          hasAllergies: undefined as boolean | undefined,
          familyGroupIds: [] as string[],
        },
        camperIds: [] as string[],
        staffFilters: {
          roles: [] as string[],
          certificationIds: [] as string[],
        },
        staffIds: [] as string[],
        labelIds: [] as string[],
      },
      groupColumns: [
        { key: "name", label: "Group Name", width: "200px" },
        { key: "type", label: "Type", width: "180px" },
        { key: "members", label: "Members", width: "180px" },
        { key: "session", label: "Session", width: "150px" },
        { key: "actions", label: "Actions", width: "140px" },
      ],
    };
  },
  mounted() {
    if (this.$route.query.id) {
      this.selectGroup(this.$route.query.id as string);
    }
  },
  computed: {
    groupsStore() {
      return useGroupsStore();
    },
    campersStore() {
      return useCampersStore();
    },
    staffMembersStore() {
      return useStaffMembersStore();
    },
    labelsStore() {
      return useLabelsStore();
    },
    sessionsStore() {
      return useSessionsStore();
    },
    housingRoomsStore() {
      return useHousingRoomsStore();
    },
    certificationsStore() {
      return useCertificationsStore();
    },
    groupsFilters(): Filter[] {
      return [
        {
          model: "filterType",
          value: this.filterType,
          placeholder: "Filter by Type",
          options: [
            { label: "Nested Groups", value: "nested" },
            { label: "Auto-assigned Campers", value: "auto-campers" },
            { label: "Manual Campers", value: "manual-campers" },
            { label: "With Housing", value: "has-housing" },
            { label: "With Session", value: "has-session" },
          ],
        },
        {
          model: "filterSession",
          value: this.filterSession,
          placeholder: "Filter by Session",
          options: this.sessionsStore.sessions.map((session: Session) => ({
            label: session.meta.name,
            value: session.meta.id,
          })),
        },
        {
          model: "filterLabel",
          value: this.filterLabel,
          placeholder: "Filter by Label",
          options: this.labelsStore.labels.map((label: Label) => ({
            label: label.meta.name,
            value: label.meta.id,
          })),
        },
      ];
    },
    selectedGroup(): Group | null {
      if (!this.selectedGroupId) return null;
      return this.groupsStore.getGroupById(this.selectedGroupId) || null;
    },
    groupCampers(): Camper[] {
      if (!this.selectedGroupId) return [];
      return this.groupsStore.getCampersInGroup(this.selectedGroupId);
    },
    groupStaff(): StaffMember[] {
      if (!this.selectedGroupId) return [];
      return this.groupsStore.getStaffInGroup(this.selectedGroupId);
    },
    filteredGroups(): Group[] {
      let groups: Group[] = this.groupsStore.groups;

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        groups = groups.filter(
          (group: Group) =>
            group.meta.name.toLowerCase().includes(query) ||
            (group.meta.description &&
              group.meta.description.toLowerCase().includes(query)),
        );
      }

      // Type filter
      if (this.filterType) {
        groups = groups.filter((group: Group) => {
          switch (this.filterType) {
            case "nested":
              return !!(group.spec.groupIds && group.spec.groupIds.length > 0);
            case "auto-campers":
              return !!(group.spec.camperFilters && !group.spec.camperIds);
            case "manual-campers":
              return !!(group.spec.camperIds && group.spec.camperIds.length > 0);
            case "has-housing":
              return !!group.spec.housingRoomId;
            case "has-session":
              return !!group.spec.sessionId;
            default:
              return true;
          }
        });
      }

      // Session filter
      if (this.filterSession) {
        groups = groups.filter(
          (group: Group) => group.spec.sessionId === this.filterSession,
        );
      }

      // Label filter
      if (this.filterLabel) {
        groups = groups.filter(
          (group: Group) =>
            group.spec.labelIds && group.spec.labelIds.includes(this.filterLabel),
        );
      }

      return groups;
    },
  },

  methods: {
    clearFilters(): void {
      this.searchQuery = "";
      this.filterType = "";
      this.filterSession = "";
      this.filterLabel = "";
    },
    getCampersCount(groupId: string): number {
      return this.groupsStore.getCampersInGroup(groupId).length;
    },
    getStaffCount(groupId: string): number {
      return this.groupsStore.getStaffInGroup(groupId).length;
    },
    isNestedGroup(group: Group): boolean {
      return !!(group.spec.groupIds && group.spec.groupIds.length > 0);
    },
    hasAutoAssignedCampers(group: Group): boolean {
      return !!(group.spec.camperFilters && !group.spec.camperIds);
    },
    hasManualCampers(group: Group): boolean {
      return !!(group.spec.camperIds && group.spec.camperIds.length > 0);
    },
    getSessionName(sessionId: string): string {
      const session = this.sessionsStore.sessions.find(
        (s) => s.meta.id === sessionId,
      );
      return session?.meta.name || "Unknown Session";
    },
    selectGroup(groupId: string): void {
      this.selectedGroupId = groupId;
    },
    editGroup(): void {
      if (!this.selectedGroup) return;

      this.editingGroupId = this.selectedGroup.meta.id;

      // Map the group to form data
      this.formData = {
        name: this.selectedGroup.meta.name,
        description: this.selectedGroup.meta.description || "",
        sessionId: this.selectedGroup.spec.sessionId || "",
        housingRoomId: this.selectedGroup.spec.housingRoomId || "",
        groupIds: this.selectedGroup.spec.groupIds || [],
        camperFilters: {
          ageMin: this.selectedGroup.spec.camperFilters?.ageMin,
          ageMax: this.selectedGroup.spec.camperFilters?.ageMax,
          gender: this.selectedGroup.spec.camperFilters?.gender || "",
          hasAllergies: this.selectedGroup.spec.camperFilters?.hasAllergies,
          familyGroupIds:
            this.selectedGroup.spec.camperFilters?.familyGroupIds || [],
        },
        camperIds: this.selectedGroup.spec.camperIds || [],
        staffFilters: {
          roles: this.selectedGroup.spec.staffFilters?.roles || [],
          certificationIds:
            this.selectedGroup.spec.staffFilters?.certificationIds || [],
        },
        staffIds: this.selectedGroup.spec.staffIds || [],
        labelIds: this.selectedGroup.spec.labelIds || [],
      };

      this.selectedGroupId = null;
      this.showModal = true;
    },
    async saveGroup(formData: typeof this.formData): Promise<void> {
      const toast = useToast();

      // Build the group object
      const groupData: Group = {
        meta: {
          id: this.editingGroupId || `group-${Date.now()}`,
          name: formData.name,
          description: formData.description || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        spec: {
          sessionId: formData.sessionId || undefined,
          housingRoomId: formData.housingRoomId || undefined,
          groupIds: formData.groupIds.length > 0 ? formData.groupIds : undefined,
          camperFilters: undefined,
          camperIds: undefined,
          staffFilters: undefined,
          staffIds: undefined,
          labelIds:
            formData.labelIds && formData.labelIds.length > 0
              ? formData.labelIds
              : undefined,
          },
      };

      // Add camper assignment based on type
      if (formData.camperIds.length > 0) {
        groupData.spec.camperIds = formData.camperIds;
      } else if (this.hasAnyCamperFilters(formData.camperFilters)) {
        groupData.spec.camperFilters = {
          ageMin: formData.camperFilters.ageMin,
          ageMax: formData.camperFilters.ageMax,
          gender: formData.camperFilters.gender || undefined,
          hasAllergies: formData.camperFilters.hasAllergies,
          familyGroupIds:
            formData.camperFilters.familyGroupIds?.length > 0
              ? formData.camperFilters.familyGroupIds
              : undefined,
        };
      }

      // Add staff assignment based on type
      if (formData.staffIds.length > 0) {
        groupData.spec.staffIds = formData.staffIds;
      } else if (this.hasAnyStaffFilters(formData.staffFilters)) {
        groupData.spec.staffFilters = {
          roles:
            formData.staffFilters.roles.length > 0
              ? formData.staffFilters.roles
              : undefined,
          certificationIds:
            formData.staffFilters.certificationIds.length > 0
              ? formData.staffFilters.certificationIds
              : undefined,
        };
      }

      // Validate the group
      const validation = this.groupsStore.validateGroup(groupData);
      if (!validation.valid) {
        validation.errors.forEach((error) => toast.error(error));
        return;
      }

      if (this.editingGroupId) {
        await this.groupsStore.updateGroup(this.editingGroupId, groupData);
        toast.success("Group updated successfully");
      } else {
        await this.groupsStore.addGroup(groupData);
        toast.success("Group created successfully");
      }

      this.closeModal();
    },
    hasAnyCamperFilters(filters: typeof this.formData.camperFilters): boolean {
      return !!(
        filters.ageMin !== undefined ||
        filters.ageMax !== undefined ||
        filters.gender ||
        filters.hasAllergies !== undefined ||
        (filters.familyGroupIds && filters.familyGroupIds.length > 0)
      );
    },
    hasAnyStaffFilters(filters: typeof this.formData.staffFilters): boolean {
      return !!(
        filters.roles.length > 0 || filters.certificationIds.length > 0
      );
    },
    deleteGroupConfirm(): void {
      if (!this.selectedGroupId) return;
      const group = this.groupsStore.getGroupById(this.selectedGroupId);
      if (!group) return;

      this.groupToDelete = {
        id: this.selectedGroupId,
        name: group.meta.name,
      };
      this.showConfirmModal = true;
    },
    async handleConfirmDelete(): Promise<void> {
      if (!this.groupToDelete) return;

      const toast = useToast();
      await this.groupsStore.deleteGroup(this.groupToDelete.id);
      toast.success("Group deleted successfully");

      this.selectedGroupId = null;
      this.showConfirmModal = false;
      this.groupToDelete = null;
    },
    handleCancelDelete(): void {
      this.showConfirmModal = false;
      this.groupToDelete = null;
    },
    closeModal(): void {
      this.showModal = false;
      this.editingGroupId = null;
      this.formData = {
        name: "",
        description: "",
        sessionId: "",
        housingRoomId: "",
        groupIds: [],
        camperFilters: {
          ageMin: undefined,
          ageMax: undefined,
          gender: "",
          hasAllergies: undefined,
          familyGroupIds: [],
        },
        camperIds: [],
        staffFilters: {
          roles: [],
          certificationIds: [],
        },
        staffIds: [],
        labelIds: [],
      };
    },
  },
});
</script>

<style scoped>
.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.empty-state {
  grid-column: 1 / -1;
}

/* Table View Styles */
.group-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.group-name-text {
  font-weight: 500;
  color: var(--text-primary);
}

.type-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.badge-sm {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.badge-info {
  background-color: #3b82f6;
  color: white;
}

.badge-secondary {
  background-color: #64748b;
  color: white;
}
</style>
