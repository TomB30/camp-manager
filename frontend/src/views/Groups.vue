<template>
  <div class="groups-tab view">
    <LoadingState v-if="!isInitialized" message="Loading groups..." />
    <template v-else>
      <TabHeader
        title="Groups"
        description="Create and manage groups with flexible assignment options. Groups can contain campers, staff, or even other groups."
        action-text="Group"
        @action="showModal = true"
      />

      <FilterBar
        v-model:searchQuery="filters.searchQuery"
        v-model:filter-type="filters.filterType"
        v-model:filter-session="filters.filterSession"
        :filters="groupsFilters"
        :filtered-count="filters.pagination.total"
        :total-count="filters.pagination.total"
        search-placeholder="Search groups..."
        @clear="clearFilters"
      >
        <template #prepend>
          <ViewToggle v-model="filters.viewMode" />
        </template>
      </FilterBar>

      <ServerTable
        v-if="isInitialized"
        :columns="groupColumns"
        :rows="groupsData"
        row-key="meta.id"
        :grid="filters.viewMode === 'grid'"
        :loading="loading"
        :pagination="filters.pagination"
        @update:pagination="
          updateFilter('pagination', $event);
          fetchGroups();
        "
        @row-click="selectGroup"
      >
        <template #item="{ item }">
          <GroupCard
            :group="item"
            :campers-count="getCampersCount(item.meta.id)"
            :staff-count="getStaffCount(item.meta.id)"
            @click="selectGroup(item)"
          />
        </template>

        <template #cell-name="{ item }">
          <div class="group-name-content">
            <div class="group-name-text">{{ item.meta.name }}</div>
          </div>
        </template>

        <template #cell-type="{ item }">
          <div class="type-badges">
            <span v-if="isNestedGroup(item)" class="badge badge-sm badge-info">Nested</span>
            <span v-else-if="hasManualCampers(item)" class="badge badge-sm badge-primary">Manual Campers</span>
            <span v-else class="badge badge-sm badge-secondary">Empty</span>

            <span v-if="item.spec.housingRoomId" class="badge badge-sm badge-secondary">Housing</span>
          </div>
        </template>

        <template #cell-members="{ item }">
          <div class="members-counts text-caption row items-center q-gutter-x-md">
            <span v-if="getCampersCount(item.meta.id) > 0" class="badge badge-success badge-sm">
              {{ getCampersCount(item.meta.id) }} campers
            </span>
            <span v-if="getStaffCount(item.meta.id) > 0" class="badge badge-success badge-sm">
              {{ getStaffCount(item.meta.id) }} staff
            </span>
            <span
              v-if="getCampersCount(item.meta.id) === 0 && getStaffCount(item.meta.id) === 0"
              class="text-caption text-sm"
            >
              No members
            </span>
          </div>
        </template>

        <template #empty>
          <EmptyState
            type="empty"
            title="No Groups Yet"
            message="Create your first group to organize campers and staff efficiently."
            action-text="Group"
            icon-name="FolderOpen"
            @action="showModal = true"
          />
        </template>
      </ServerTable>

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
    </template>
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
import { usePageFilters } from "@/composables/usePageFilters";
import type { Group, Camper, StaffMember, Session } from "@/generated/api";
import type { QTableColumn } from "quasar";
import { isBackendEnabled } from "@/config/dataSource";
import EmptyState from "@/components/EmptyState.vue";
import GroupCard from "@/components/cards/GroupCard.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import FilterBar, { type Filter } from "@/components/FilterBar.vue";
import ServerTable from "@/components/ServerTable.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import GroupDetailModal from "@/components/modals/GroupDetailModal.vue";
import GroupFormModal from "@/components/modals/GroupFormModal.vue";
import { useToast } from "@/composables/useToast";
import TabHeader from "@/components/settings/TabHeader.vue";
import LoadingState from "@/components/LoadingState.vue";

export default defineComponent({
  name: "GroupsNew",
  components: {
    EmptyState,
    GroupCard,
    ConfirmModal,
    FilterBar,
    ServerTable,
    ViewToggle,
    GroupDetailModal,
    GroupFormModal,
    TabHeader,
    LoadingState,
  },
  setup() {
    const { filters, updateFilter, updateFilters, isInitialized } = usePageFilters("groups", {
      searchQuery: "",
      filterType: "",
      filterSession: "",
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
      groupsData: [] as Group[],
      selectedGroupId: null as string | null,
      showModal: false,
      editingGroupId: null as string | null,
      showConfirmModal: false,
      groupToDelete: null as { id: string; name: string } | null,
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
        {
          name: "name",
          label: "Group Name",
          field: (row: Group) => row.meta.name,
          align: "left" as const,
          sortable: true,
        },
        {
          name: "type",
          label: "Type",
          field: (row: Group) => row.spec.groupIds ? "nested" : "manual",
          align: "left" as const,
        },
        {
          name: "members",
          label: "Members",
          field: (row: Group) => row.spec.camperIds?.length || 0,
          align: "left" as const,
        },
        {
          name: "sessionId",
          label: "Session",
          field: (row: Group) => row.spec.sessionId,
          align: "left" as const,
          sortable: true,
          format: (value: string | undefined) => value ? this.getSessionName(value) : "-",
        },
      ] as QTableColumn[],
    };
  },
  async created() {
    // Load reference data for filters
    await Promise.all([
      this.campersStore.loadCampers(),
      this.staffMembersStore.loadStaffMembers(),
      this.sessionsStore.loadSessions(),
      this.housingRoomsStore.loadHousingRooms(),
      this.certificationsStore.loadCertifications(),
    ]);
  },
  mounted() {
    if (this.$route.query.id) {
      this.selectGroup({ meta: { id: this.$route.query.id as string } } as Group);
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
          value: this.filters.filterType,
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
          value: this.filters.filterSession,
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
  },

  methods: {
    async fetchGroups(): Promise<void> {
      if (!this.isInitialized) return;

      if (!isBackendEnabled()) {
        this.groupsData = await this.groupsStore.loadGroups();
      } else {
        try {
          const filterBy = this.buildFilterByArray();
          const response = await this.groupsStore.loadGroupsPaginated({
            offset: this.filters.pagination.offset,
            limit: this.filters.pagination.limit,
            search: this.filters.searchQuery || undefined,
            filterBy: filterBy.length > 0 ? filterBy : undefined,
            sortBy: this.filters.pagination.sortBy,
            sortOrder: this.filters.pagination.sortOrder,
          });

          this.groupsData = response.items;
          this.updateFilter("pagination", {
            ...this.filters.pagination,
            total: response.total,
          });
        } catch (error) {
          console.error("Failed to fetch groups:", error);
          this.groupsData = [];
        }
      }
    },

    buildFilterByArray(): string[] {
      const filterBy: string[] = [];

      if (this.filters.filterType) {
        switch (this.filters.filterType) {
          case "nested":
            filterBy.push("groupIds!=null");
            break;
          case "manual-campers":
            filterBy.push("camperIds!=null");
            break;
          case "has-housing":
            filterBy.push("housingRoomId!=null");
            break;
          case "has-session":
            filterBy.push("sessionId!=null");
            break;
        }
      }

      if (this.filters.filterSession) {
        filterBy.push(`sessionId==${this.filters.filterSession}`);
      }

      return filterBy;
    },

    clearFilters(): void {
      this.updateFilters({
        searchQuery: "",
        filterType: "",
        filterSession: "",
        pagination: {
          ...this.filters.pagination,
          offset: 0,
        },
      });
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
    hasManualCampers(group: Group): boolean {
      return !!(group.spec.camperIds && group.spec.camperIds.length > 0);
    },
    getSessionName(sessionId: string): string {
      const session = this.sessionsStore.sessions.find((s) => s.meta.id === sessionId);
      return session?.meta.name || "Unknown Session";
    },
    selectGroup(group: Group): void {
      this.selectedGroupId = group.meta.id;
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
      const { getCurrentTenantId, getCurrentCampId } = await import("@/utils/tenantContext");

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
          groupIds: formData.groupIds.length > 0 ? formData.groupIds : undefined,
          camperIds: formData.camperIds.length > 0 ? formData.camperIds : undefined,
          staffIds: formData.staffIds.length > 0 ? formData.staffIds : undefined,
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

      await this.fetchGroups();
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

      await this.fetchGroups();
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
  watch: {
    isInitialized: {
      immediate: true,
      handler(initialized) {
        if (initialized) {
          this.fetchGroups();
        }
      },
    },
    "filters.searchQuery"() {
      this.updateFilter("pagination", {
        ...this.filters.pagination,
        offset: 0,
      });
      this.fetchGroups();
    },
    "filters.filterType"() {
      this.updateFilter("pagination", {
        ...this.filters.pagination,
        offset: 0,
      });
      this.fetchGroups();
    },
    "filters.filterSession"() {
      this.updateFilter("pagination", {
        ...this.filters.pagination,
        offset: 0,
      });
      this.fetchGroups();
    },
  },
});
</script>

<style scoped lang="scss">
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
