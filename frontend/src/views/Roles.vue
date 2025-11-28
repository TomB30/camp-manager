<template>
  <div class="roles-tab view">
    <LoadingState v-if="!isInitialized" message="Loading roles..." />
    <template v-else>
      <TabHeader
        title="Staff Roles"
        description="Manage the roles available for your staff members. Define different positions and responsibilities within your organization."
        action-text="Role"
        @action="showModal = true"
      />

      <FilterBar
        v-model:searchQuery="filters.searchQuery"
        @clear="clearFilters"
      >
        <template #prepend>
          <ViewToggle v-model="filters.viewMode" />
        </template>
      </FilterBar>

      <ServerTable
        v-if="isInitialized"
        :columns="roleColumns"
        :rows="rolesData"
        row-key="meta.id"
        :grid="filters.viewMode === 'grid'"
        :loading="loading"
        :pagination="filters.pagination"
        @update:pagination="
          updateFilter('pagination', $event);
          fetchRoles();
        "
        @row-click="selectRole"
      >
        <template #item="{ item }">
          <RoleCard :role="item" @click="selectRole(item)" />
        </template>

        <template #cell-name="{ item }">
          <div class="role-name-content">
            <div>{{ item.meta.name }}</div>
          </div>
        </template>

        <template #empty>
          <EmptyState
            type="empty"
            title="No Roles Yet"
            message="Add your first role to start organizing staff positions and responsibilities."
            action-text="Role"
            @action="showModal = true"
            icon-name="Shield"
          />
        </template>
      </ServerTable>

      <RoleDetailModal
        v-if="!!selectedRoleId"
        :role="selectedRole"
        @close="selectedRoleId = null"
        @edit="editRoleFromDetail"
        @delete="deleteRoleConfirm"
      />

      <RoleFormModal
        v-if="showModal"
        :role-id="editingRoleId || undefined"
        @close="closeModal"
      />

      <ConfirmModal
        v-if="showConfirmModal"
        title="Delete Role"
        message="Are you sure you want to delete this role?"
        confirm-text="Delete"
        :danger-mode="true"
        @confirm="handleDeleteRole"
        @cancel="showConfirmModal = false"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRolesStore } from "@/stores";
import { usePageFilters } from "@/composables/usePageFilters";
import type { Role } from "@/generated/api";
import type { QTableColumn } from "quasar";
import { isBackendEnabled } from "@/config/dataSource";
import Icon from "@/components/Icon.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import RoleCard from "@/components/cards/RoleCard.vue";
import RoleDetailModal from "@/components/modals/RoleDetailModal.vue";
import RoleFormModal from "@/components/modals/RoleFormModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import ServerTable from "@/components/ServerTable.vue";
import FilterBar from "@/components/FilterBar.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import EmptyState from "@/components/EmptyState.vue";
import { useToast } from "@/composables/useToast";
import LoadingState from "@/components/LoadingState.vue";

export default defineComponent({
  name: "RolesTab",
  components: {
    Icon,
    TabHeader,
    RoleCard,
    RoleDetailModal,
    RoleFormModal,
    ConfirmModal,
    ServerTable,
    FilterBar,
    ViewToggle,
    EmptyState,
    LoadingState,
  },
  setup() {
    const { filters, updateFilter, updateFilters, isInitialized } =
      usePageFilters("roles", {
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

    const rolesStore = useRolesStore();
    const toast = useToast();

    return {
      filters,
      updateFilter,
      updateFilters,
      isInitialized,
      rolesStore,
      toast,
    };
  },
  data() {
    return {
      loading: false,
      rolesData: [] as Role[],
      showModal: false,
      showConfirmModal: false,
      editingRoleId: null as string | null,
      selectedRoleId: null as string | null,
      roleToDelete: null as string | null,
      roleColumns: [
        {
          name: "name",
          label: "Role Name",
          field: (row: Role) => row.meta.name,
          align: "left" as const,
          sortable: true,
        },
        {
          name: "description",
          label: "Description",
          field: (row: Role) => row.meta.description,
          align: "left" as const,
          format: (value: string | undefined) => value || "No description",
        },
      ] as QTableColumn[],
    };
  },
  computed: {
    selectedRole(): Role | null {
      if (!this.selectedRoleId) return null;
      return (
        this.rolesData.find((r) => r.meta.id === this.selectedRoleId) || null
      );
    },
  },
  methods: {
    async fetchRoles(): Promise<void> {
      if (!this.isInitialized) return;

      if (!isBackendEnabled()) {
        const response = await this.rolesStore.loadRoles();
        this.rolesData = Array.isArray(response) ? response : response.items;
      } else {
        try {
          const response = await this.rolesStore.loadRolesPaginated({
            offset: this.filters.pagination.offset,
            limit: this.filters.pagination.limit,
            search: this.filters.searchQuery || undefined,
            sortBy: this.filters.pagination.sortBy,
            sortOrder: this.filters.pagination.sortOrder,
          });

          this.rolesData = response.items;
          this.updateFilter("pagination", {
            ...this.filters.pagination,
            total: response.total,
          });
        } catch (error) {
          console.error("Failed to fetch roles:", error);
          this.rolesData = [];
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

    selectRole(role: Role) {
      this.selectedRoleId = role.meta.id;
    },

    editRoleFromDetail(role: Role) {
      this.selectedRoleId = null;
      this.editRole(role);
    },

    editRole(role: Role) {
      this.editingRoleId = role.meta.id;
      this.showModal = true;
    },

    deleteRoleConfirm(id: string) {
      this.roleToDelete = id;
      this.selectedRoleId = null;
      this.showConfirmModal = true;
    },

    async handleDeleteRole() {
      if (!this.roleToDelete) return;

      try {
        await this.rolesStore.deleteRole(this.roleToDelete);
        await this.fetchRoles();
        this.toast.success("Role deleted successfully");
        this.showConfirmModal = false;
        this.roleToDelete = null;
      } catch (error: any) {
        this.toast.error(error.message || "Failed to delete role");
      }
    },

    closeModal() {
      this.showModal = false;
      this.editingRoleId = null;
    },
  },
  watch: {
    isInitialized: {
      immediate: true,
      handler(initialized) {
        if (initialized) {
          this.fetchRoles();
        }
      },
    },
    "filters.searchQuery"() {
      this.updateFilter("pagination", {
        ...this.filters.pagination,
        offset: 0,
      });
      this.fetchRoles();
    },
  },
});
</script>

<style scoped lang="scss">
.role-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.role-icon-sm {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-center: center;
  color: white;
  flex-shrink: 0;
}
</style>
