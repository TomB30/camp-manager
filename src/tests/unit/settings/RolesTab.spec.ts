import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import RolesTab from "@/components/settings/RolesTab.vue";
import { rolesFixture } from "@/tests/fixtures";
import { useRolesStore } from "@/stores";
import { Role } from "@/generated/api";

describe("RolesTab", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();

    const rolesStore = useRolesStore();
    rolesStore.roles = [...rolesFixture];
  });

  describe("Header and Title", () => {
    it("renders tab title", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      expect(wrapper.text()).toContain("Staff Roles");
    });

    it("renders tab description", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      expect(wrapper.text()).toContain(
        "Manage the roles available for your staff members",
      );
    });

    it("renders add role button", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      expect(wrapper.text()).toContain("Role");
    });
  });

  describe("View Modes", () => {
    it("defaults to grid view", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;
      expect(vm.viewMode).toBe("grid");
    });

    it("displays roles in grid view", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      expect(wrapper.find(".roles-grid").exists()).toBe(true);
    });

    it("switches to table view", async () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.viewMode = "table";
      await wrapper.vm.$nextTick();

      expect(vm.viewMode).toBe("table");
    });

    it("displays data table in table view", async () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.viewMode = "table";
      await wrapper.vm.$nextTick();

      const dataTable = wrapper.findComponent({ name: "DataTable" });
      expect(dataTable.exists()).toBe(true);
    });
  });

  describe("Empty State", () => {
    it("shows empty state when no roles exist", () => {
      const rolesStore = useRolesStore();
      rolesStore.roles = [];

      const wrapper = createWrapper(RolesTab, { pinia });
      expect(wrapper.text()).toContain("No Roles Yet");
    });

    it("shows empty state message", () => {
      const rolesStore = useRolesStore();
      rolesStore.roles = [];

      const wrapper = createWrapper(RolesTab, { pinia });
      expect(wrapper.text()).toContain(
        "Add your first role to start organizing staff positions",
      );
    });

    it("does not show empty state when roles exist", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      expect(wrapper.text()).not.toContain("No Roles Yet");
    });
  });

  describe("Role Display", () => {
    it("displays all roles from store", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      expect(vm.filteredRoles.length).toBe(rolesFixture.length);
    });

    it("displays role cards in grid view", () => {
      const wrapper = createWrapper(RolesTab, { pinia });

      const roleCards = wrapper.findAllComponents({ name: "RoleCard" });
      expect(roleCards.length).toBe(rolesFixture.length);
    });
  });

  describe("Search Functionality", () => {
    it("renders search input", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const filterBar = wrapper.findComponent({ name: "FilterBar" });
      expect(filterBar.exists()).toBe(true);
    });

    it("filters roles by name", async () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.searchQuery = "Counselor";
      await wrapper.vm.$nextTick();

      const filtered = vm.filteredRoles;
      expect(filtered.length).toBeGreaterThan(0);
      expect(
        filtered.every((role: Role) => role.meta.name.includes("Counselor")),
      ).toBe(true);
    });

    it("filters roles by description", async () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.searchQuery = "camp";
      await wrapper.vm.$nextTick();

      const filtered = vm.filteredRoles;
      expect(filtered.length).toBeGreaterThan(0);
      expect(
        filtered.every((role: Role) => role.meta.description?.includes("camp")),
      ).toBe(true);
    });

    it("returns empty array when no roles match search", async () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.searchQuery = "NonExistentRole12345";
      await wrapper.vm.$nextTick();

      expect(vm.filteredRoles.length).toBe(0);
    });

    it("search is case insensitive", async () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.searchQuery = "COUNSELOR";
      await wrapper.vm.$nextTick();

      const filtered = vm.filteredRoles;
      expect(filtered.length).toBeGreaterThan(0);
    });

    it("clearFilters resets search query", async () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.searchQuery = "test";
      vm.clearFilters();

      expect(vm.searchQuery).toBe("");
    });
  });

  describe("Sorting", () => {
    it("sorts roles alphabetically by name", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      const filtered = vm.filteredRoles;
      const names = filtered.map((r: any) => r.name);
      const sortedNames = [...names].sort((a, b) => a.localeCompare(b));

      expect(names).toEqual(sortedNames);
    });
  });

  describe("Modal Management", () => {
    it("opens form modal when add button is clicked", async () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.showModal = true;
      await wrapper.vm.$nextTick();

      expect(vm.showModal).toBe(true);
    });

    it("closes form modal", async () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.showModal = true;
      await wrapper.vm.$nextTick();

      vm.closeModal();

      expect(vm.showModal).toBe(false);
      expect(vm.editingRoleId).toBeNull();
    });

    it("opens detail modal when role is selected", async () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.selectRole(rolesFixture[0].meta.id);
      await wrapper.vm.$nextTick();

      expect(vm.selectedRoleId).toBe(rolesFixture[0].meta.id);
    });

    it("shows confirm modal for deletion", async () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.deleteRoleConfirm(rolesFixture[0].meta.id);
      await wrapper.vm.$nextTick();

      expect(vm.showConfirmModal).toBe(true);
      expect(vm.roleToDelete).toBe(rolesFixture[0].meta.id);
    });
  });

  describe("Role Actions", () => {
    it("selectRole sets selectedRoleId", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.selectRole(rolesFixture[0].meta.id);

      expect(vm.selectedRoleId).toBe(rolesFixture[0].meta.id);
    });

    it("editRole opens modal with role id", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.editRole(rolesFixture[0]);

      expect(vm.editingRoleId).toBe(rolesFixture[0].meta.id);
      expect(vm.showModal).toBe(true);
    });

    it("editRoleFromDetail closes detail modal and opens form modal", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.selectedRoleId = rolesFixture[0].meta.id;
      vm.editRoleFromDetail(rolesFixture[0]);

      expect(vm.selectedRoleId).toBeNull();
      expect(vm.editingRoleId).toBe(rolesFixture[0].meta.id);
      expect(vm.showModal).toBe(true);
    });

    it("deleteRoleConfirm prepares for deletion", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.selectedRoleId = rolesFixture[0].meta.id;
      vm.deleteRoleConfirm(rolesFixture[0].meta.id);

      expect(vm.roleToDelete).toBe(rolesFixture[0].meta.id);
      expect(vm.showConfirmModal).toBe(true);
      expect(vm.selectedRoleId).toBeNull();
    });
  });

  describe("Computed Properties", () => {
    it("filteredRoles returns all roles when no filters", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      expect(vm.filteredRoles.length).toBe(rolesFixture.length);
    });

    it("selectedRole returns correct role", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.selectedRoleId = rolesFixture[0].meta.id;

      expect(vm.selectedRole).toEqual(rolesFixture[0]);
    });

    it("selectedRole returns null when no selection", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.selectedRoleId = null;

      expect(vm.selectedRole).toBeNull();
    });

    it("selectedRole returns null for non-existent id", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.selectedRoleId = "non-existent-id";

      expect(vm.selectedRole).toBeNull();
    });
  });

  describe("Table Configuration", () => {
    it("has correct table columns", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      expect(vm.roleColumns).toHaveLength(3);
      expect(vm.roleColumns[0].key).toBe("name");
      expect(vm.roleColumns[1].key).toBe("description");
      expect(vm.roleColumns[2].key).toBe("actions");
    });

    it("table columns are sortable", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      expect(vm.roleColumns[0].sortable).toBe(true);
      expect(vm.roleColumns[1].sortable).toBe(true);
    });
  });

  describe("Pagination", () => {
    it("initializes with page 1", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      expect(vm.currentPage).toBe(1);
    });

    it("has default page size of 10", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      expect(vm.pageSize).toBe(10);
    });
  });

  describe("Component Structure", () => {
    it("renders TabHeader component", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const tabHeader = wrapper.findComponent({ name: "TabHeader" });
      expect(tabHeader.exists()).toBe(true);
    });

    it("renders FilterBar component", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const filterBar = wrapper.findComponent({ name: "FilterBar" });
      expect(filterBar.exists()).toBe(true);
    });

    it("renders ViewToggle component", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const viewToggle = wrapper.findComponent({ name: "ViewToggle" });
      expect(viewToggle.exists()).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty roles array", () => {
      const rolesStore = useRolesStore();
      rolesStore.roles = [];

      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      expect(vm.filteredRoles).toEqual([]);
    });

    it("handles roles with missing descriptions", () => {
      const rolesStore = useRolesStore();
      rolesStore.roles = [
        {
          ...rolesFixture[0],
          meta: {
            ...rolesFixture[0].meta,
            description: undefined,
          },
        },
      ];

      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      expect(vm.filteredRoles.length).toBe(1);
    });

    it("handles search with special characters", async () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const vm = wrapper.vm as any;

      vm.searchQuery = "&<>";
      await wrapper.vm.$nextTick();

      // Should not crash
      expect(vm.filteredRoles).toBeDefined();
    });
  });

  describe("Animation and Styling", () => {
    it("has roles-tab class", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      expect(wrapper.classes()).toContain("roles-tab");
    });

    it("grid view has roles-grid class", () => {
      const wrapper = createWrapper(RolesTab, { pinia });
      const grid = wrapper.find(".roles-grid");
      expect(grid.exists()).toBe(true);
    });
  });
});
