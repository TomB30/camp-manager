<template>
  <div class="groups-tab view">
    <TabHeader
      title="Groups"
      description="Create and manage groups with flexible assignment options. Groups can contain campers, staff, or even other groups."
      action-text="Group"
      @action="showModal = true"
    />

    <FilterBar
      v-model:searchQuery="searchQuery"
      v-model:filter-type="filterType"
      v-model:filter-session="filterSession"
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

    <TransitionGroup
      v-if="viewMode === 'grid'"
      name="list"
      tag="div"
      class="groups-grid"
    >
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
    </TransitionGroup>

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
            v-else-if="hasManualCampers(item)"
            class="badge badge-sm badge-primary"
            >Manual Campers</span
          >
          <span v-else class="badge badge-sm badge-secondary">Empty</span>

          <span v-if="item.housingRoomId" class="badge badge-sm badge-secondary"
            >Housing</span
          >
        </div>
      </template>

      <template #cell-members="{ item }">
        <div class="members-counts text-caption row items-center q-gutter-x-md">
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
              getCampersCount(item.meta.id) === 0 &&
              getStaffCount(item.meta.id) === 0
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
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  useGroupsStore,
  useCampersStore,
  useStaffMembersStore,
  useSessionsStore,
  useHousingRoomsStore,
  useCertificationsStore,
} from "@/stores";
import type { Group, Camper, StaffMember, Session } from "@/generated/api";
import EmptyState from "@/components/EmptyState.vue";
import GroupCard from "@/components/cards/GroupCard.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import FilterBar, { type Filter } from "@/components/FilterBar.vue";
import DataTable from "@/components/DataTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import GroupDetailModal from "@/components/modals/GroupDetailModal.vue";
import GroupFormModal from "@/components/modals/GroupFormModal.vue";
import { useToast } from "@/composables/useToast";
import TabHeader from "@/components/settings/TabHeader.vue";
import Icon from "@/components/Icon.vue";

export default defineComponent({
  name: "GroupsNew",
  components: {
    EmptyState,
    GroupCard,
    ConfirmModal,
    FilterBar,
    DataTable,
    ViewToggle,
    GroupDetailModal,
    GroupFormModal,
    TabHeader,
    Icon,
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
      viewMode: "grid" as "grid" | "table",
      currentPage: 1,
      pageSize: 10,
      formData: {
        name: "",
        description: "",
        sessionId: "",
        housingRoomId: "",
        groupIds: [] as string[],
        camperIds: [] as string[],
        staffIds: [] as string[],
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
            case "manual-campers":
              return !!(
                group.spec.camperIds && group.spec.camperIds.length > 0
              );
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

      return groups;
    },
  },

  methods: {
    clearFilters(): void {
      this.searchQuery = "";
      this.filterType = "";
      this.filterSession = "";
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
    hasAutoAssignedCampers(): boolean {
      return false; // No longer supporting auto-assigned campers
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
        camperIds: this.selectedGroup.spec.camperIds || [],
        staffIds: this.selectedGroup.spec.staffIds || [],
      };

      this.selectedGroupId = null;
      this.showModal = true;
    },
    async saveGroup(formData: typeof this.formData): Promise<void> {
      const toast = useToast();
      const { getCurrentTenantId, getCurrentCampId } = await import(
        "@/utils/tenantContext"
      );

      // Build the group object
      const groupData: Group = {
        meta: {
          id: this.editingGroupId || `group-${Date.now()}`,
          tenantId: getCurrentTenantId(),
          campId: getCurrentCampId(),
          name: formData.name,
          description: formData.description || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        spec: {
          sessionId: formData.sessionId || undefined,
          housingRoomId: formData.housingRoomId || undefined,
          groupIds:
            formData.groupIds.length > 0 ? formData.groupIds : undefined,
          camperIds:
            formData.camperIds.length > 0 ? formData.camperIds : undefined,
          staffIds:
            formData.staffIds.length > 0 ? formData.staffIds : undefined,
        },
      };

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
        camperIds: [],
        staffIds: [],
      };
    },
  },
});
</script>

<style scoped>
.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 0.5rem;
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
