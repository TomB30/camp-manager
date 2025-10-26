<template>
  <div class="roles-tab">
    <TabHeader
      title="Staff Roles"
      description="Manage the roles available for your staff members. Define different positions and responsibilities within your organization."
      action-text="Role"
      @action="showModal = true"
    >
      <template #action-icon>
        <Icon name="Plus" :size="18" />
      </template>
    </TabHeader>

    <!-- Search and Filters -->
    <FilterBar
      v-model:searchQuery="searchQuery"
      :filters="[]"
      :filtered-count="filteredRoles.length"
      :total-count="rolesStore.roles.length"
      @clear="clearFilters"
    >
      <template #prepend>
        <ViewToggle v-model="viewMode" />
      </template>
    </FilterBar>

    <!-- Empty State -->
    <EmptyState
      v-if="rolesStore.roles.length === 0"
      type="empty"
      title="No Roles Yet"
      message="Add your first role to start organizing staff positions and responsibilities."
      action-text="Role"
      @action="showModal = true"
      icon-name="Shield"
    />

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="roles-grid">
      <div v-for="role in filteredRoles" :key="role.id" class="role-card-wrapper">
        <RoleCard :role="role" @click="selectRole(role.id)" />
      </div>
    </div>

    <!-- Table View -->
    <DataTable
      v-else-if="viewMode === 'table' && filteredRoles.length > 0"
      :columns="roleColumns"
      :data="filteredRoles"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      row-key="id"
    >
      <template #cell-name="{ item }">
        <div class="role-name-content">
          <div class="role-icon-sm">
            <Icon name="Shield" :size="18" />
          </div>
          <div>{{ item.name }}</div>
        </div>
      </template>

      <template #cell-description="{ item }">
        <span v-if="item.description">{{ item.description }}</span>
        <span v-else class="text-caption">No description</span>
      </template>

      <template #cell-actions="{ item }">
        <BaseButton
          outline
          color="grey-8"
          size="sm"
          @click.stop="selectRole(item.id)"
          label="View Details"
        />
      </template>
    </DataTable>

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
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRolesStore } from "@/stores";
import type { Role } from "@/types";
import Icon from "@/components/Icon.vue";
import TabHeader from "@/components/settings/TabHeader.vue";
import RoleCard from "@/components/cards/RoleCard.vue";
import RoleDetailModal from "@/components/modals/RoleDetailModal.vue";
import RoleFormModal from "@/components/modals/RoleFormModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import DataTable from "@/components/DataTable.vue";
import FilterBar from "@/components/FilterBar.vue";
import ViewToggle from "@/components/ViewToggle.vue";
import EmptyState from "@/components/EmptyState.vue";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "RolesTab",
  components: {
    Icon,
    TabHeader,
    RoleCard,
    RoleDetailModal,
    RoleFormModal,
    ConfirmModal,
    DataTable,
    FilterBar,
    ViewToggle,
    EmptyState,
  },
  setup() {
    const rolesStore = useRolesStore();
    const toast = useToast();
    return { rolesStore, toast };
  },
  data() {
    return {
      showModal: false,
      showConfirmModal: false,
      editingRoleId: null as string | null,
      selectedRoleId: null as string | null,
      roleToDelete: null as string | null,
      searchQuery: "",
      viewMode: "grid" as "grid" | "table",
      currentPage: 1,
      pageSize: 10,
      roleColumns: [
        { key: "name", label: "Role Name", sortable: true },
        { key: "description", label: "Description", sortable: true },
        { key: "actions", label: "", width: "120px" },
      ],
    };
  },
  computed: {
    filteredRoles(): Role[] {
      let filtered = this.rolesStore.roles;

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (role) =>
            role.name.toLowerCase().includes(query) ||
            role.description?.toLowerCase().includes(query),
        );
      }

      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    },
    selectedRole(): Role | null {
      if (!this.selectedRoleId) return null;
      return this.rolesStore.getRoleById(this.selectedRoleId) || null;
    },
  },
  methods: {
    selectRole(id: string) {
      this.selectedRoleId = id;
    },
    editRoleFromDetail(role: Role) {
      this.selectedRoleId = null;
      this.editRole(role);
    },
    editRole(role: Role) {
      this.editingRoleId = role.id;
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
    clearFilters() {
      this.searchQuery = "";
    },
  },
});
</script>

<style scoped>
.roles-tab {
  animation: slideIn 0.3s ease;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.roles-grid .empty-state {
  grid-column: 1 / -1;
}

.role-card-wrapper {
  position: relative;
}

.role-name-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.role-icon-sm {
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  background: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .roles-grid {
    grid-template-columns: 1fr;
  }
}
</style>

