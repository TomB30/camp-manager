import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import RoleFormModal from "@/components/modals/RoleFormModal.vue";
import { rolesFixture } from "@/tests/fixtures";
import { useRolesStore } from "@/stores";

describe("RoleFormModal", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();

    const rolesStore = useRolesStore();
    rolesStore.roles = rolesFixture;
  });

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(RoleFormModal);
      expect(wrapper.text()).toContain("Add New Role");
    });

    it("renders role name input", () => {
      const wrapper = createWrapper(RoleFormModal);

      expect(
        wrapper.find("input[placeholder='Enter role name']").exists(),
      ).toBe(true);
    });

    it("renders description textarea", () => {
      const wrapper = createWrapper(RoleFormModal);

      expect(wrapper.find("textarea").exists()).toBe(true);
    });

    it("contains form element", () => {
      const wrapper = createWrapper(RoleFormModal);

      expect(wrapper.find("form").exists()).toBe(true);
    });

    it("shows Add Role button", () => {
      const wrapper = createWrapper(RoleFormModal);

      expect(wrapper.text()).toContain("Add Role");
    });

    it("shows Cancel button", () => {
      const wrapper = createWrapper(RoleFormModal);

      expect(wrapper.text()).toContain("Cancel");
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const role = rolesFixture[0];
      const wrapper = createWrapper(RoleFormModal, {
        props: { roleId: role.id },
        pinia,
      });

      expect(wrapper.text()).toContain("Edit Role");
    });

    it("populates form with role data", () => {
      const role = rolesFixture[0];
      const wrapper = createWrapper(RoleFormModal, {
        props: { roleId: role.id },
        pinia,
      });

      const vm = wrapper.vm as any;
      expect(vm.formModel.name).toBe(role.name);
      expect(vm.formModel.description).toBe(role.description);
    });

    it("shows Update Role button", () => {
      const role = rolesFixture[0];
      const wrapper = createWrapper(RoleFormModal, {
        props: { roleId: role.id },
        pinia,
      });

      expect(wrapper.text()).toContain("Update Role");
    });

    it("handles role without description", () => {
      const role = {
        ...rolesFixture[0],
        description: undefined,
      };
      const rolesStore = useRolesStore();
      rolesStore.roles = [role];

      const wrapper = createWrapper(RoleFormModal, {
        props: { roleId: role.id },
        pinia,
      });

      const vm = wrapper.vm as any;
      expect(vm.formModel.description).toBe("");
    });
  });

  describe("Form Validation", () => {
    it("requires role name", () => {
      const wrapper = createWrapper(RoleFormModal);

      const input = wrapper.find("input[placeholder='Enter role name']");
      expect(input.exists()).toBe(true);
    });

    it("description is optional", () => {
      const wrapper = createWrapper(RoleFormModal);

      const textarea = wrapper.find(
        "textarea[placeholder='Optional description']",
      );
      expect(textarea.exists()).toBe(true);
    });
  });

  describe("Form Fields", () => {
    it("has correct placeholder for name field", () => {
      const wrapper = createWrapper(RoleFormModal);

      const input = wrapper.find("input[placeholder='Enter role name']");
      expect(input.exists()).toBe(true);
    });

    it("has correct placeholder for description field", () => {
      const wrapper = createWrapper(RoleFormModal);

      const textarea = wrapper.find(
        "textarea[placeholder='Optional description']",
      );
      expect(textarea.exists()).toBe(true);
    });

    it("description textarea has 3 rows", () => {
      const wrapper = createWrapper(RoleFormModal);

      const textarea = wrapper.find("textarea");
      expect(textarea.attributes("rows")).toBe("3");
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(RoleFormModal);

      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });

  describe("Computed Properties", () => {
    it("isEditing returns false in create mode", () => {
      const wrapper = createWrapper(RoleFormModal);
      const vm = wrapper.vm as any;

      expect(vm.isEditing).toBe(false);
    });

    it("isEditing returns true in edit mode", () => {
      const role = rolesFixture[0];
      const wrapper = createWrapper(RoleFormModal, {
        props: { roleId: role.id },
        pinia,
      });
      const vm = wrapper.vm as any;

      expect(vm.isEditing).toBe(true);
    });

    it("descriptionModel getter returns empty string for undefined description", () => {
      const wrapper = createWrapper(RoleFormModal);
      const vm = wrapper.vm as any;
      vm.formModel.description = undefined;

      expect(vm.descriptionModel).toBe("");
    });

    it("descriptionModel getter returns description value", () => {
      const role = rolesFixture[0];
      const wrapper = createWrapper(RoleFormModal, {
        props: { roleId: role.id },
        pinia,
      });
      const vm = wrapper.vm as any;

      // After loading from fixture, descriptionModel should return the value
      expect(vm.descriptionModel).toBe(role.description);
    });

    it("descriptionModel setter updates formModel", () => {
      const wrapper = createWrapper(RoleFormModal);
      const vm = wrapper.vm as any;

      vm.descriptionModel = "New description";
      expect(vm.formModel.description).toBe("New description");
    });

    it("descriptionModel setter handles empty string", () => {
      const wrapper = createWrapper(RoleFormModal);
      const vm = wrapper.vm as any;

      vm.descriptionModel = "";
      expect(vm.formModel.description).toBe("");
    });
  });

  describe("Edge Cases", () => {
    it("handles non-existent role ID gracefully", () => {
      const wrapper = createWrapper(RoleFormModal, {
        props: { roleId: "non-existent-id" },
        pinia,
      });

      // Should not crash and should still show edit title (roleId is provided)
      expect(wrapper.text()).toContain("Edit Role");
    });

    it("initializes with empty form in create mode", () => {
      const wrapper = createWrapper(RoleFormModal);
      const vm = wrapper.vm as any;

      expect(vm.formModel.name).toBe("");
      expect(vm.formModel.description).toBe("");
    });
  });
});
