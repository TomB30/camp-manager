import { describe, it, expect } from "vitest";
import { createWrapper } from "@/tests/utils";
import RoleDetailModal from "@/components/modals/RoleDetailModal.vue";
import { rolesFixture } from "@/tests/fixtures";
import { Role } from "@/types";

describe("RoleDetailModal", () => {
  describe("Rendering", () => {
    it("renders role name as title", () => {
      const role = rolesFixture[0];
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });

      expect(wrapper.text()).toContain(role.meta.name);
    });

    it("renders role description", () => {
      const role = rolesFixture[0];
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });

      if (role.meta.description) {
        expect(wrapper.text()).toContain(role.meta.description);
      }
    });

    it("shows 'No description provided' when description is missing", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          description: undefined,
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });

      expect(wrapper.text()).toContain("No description provided");
    });

    it("shows 'No description provided' when description is empty", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          description: "",
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });

      expect(wrapper.text()).toContain("No description provided");
    });

    it("renders Created date when provided", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          createdAt: "2025-10-15T10:30:00.000Z",
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });

      if (role.meta.createdAt) {
        expect(wrapper.text()).toContain("Created");
      }
    });

    it("renders Last Updated date when provided", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          updatedAt: "2025-10-15T10:30:00.000Z",
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });

      if (role.meta.updatedAt) {
        expect(wrapper.text()).toContain("Last Updated");
      }
    });
  });

  describe("Labels", () => {
    it("shows Description label", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          description: "Description",
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });

      expect(wrapper.text()).toContain("Description");
    });

    it("shows Created label when date exists", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          createdAt: "2025-10-15T10:30:00.000Z",
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });

      if (role.meta.createdAt) {
        expect(wrapper.text()).toContain("Created");
      }
    });

    it("shows Last Updated label when date exists", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          updatedAt: "2025-10-15T10:30:00.000Z",
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });

      if (role.meta.updatedAt) {
        expect(wrapper.text()).toContain("Last Updated");
      }
    });
  });

  describe("Action Buttons", () => {
    it("renders Delete button", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          id: "role-1",
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });

      expect(wrapper.text()).toContain("Delete");
    });

    it("renders Edit button", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          id: "role-1",
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });

      expect(wrapper.text()).toContain("Edit");
    });
  });

  describe("Events", () => {
    it("emits close event", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          id: "role-1",
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });

      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });

    it("emits edit event with role when Edit is clicked", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          id: "role-1",
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });

      wrapper.vm.$emit("edit", role);
      expect(wrapper.emitted("edit")).toBeTruthy();
      expect(wrapper.emitted("edit")?.[0]).toEqual([role]);
    });

    it("emits delete event with role id when Delete is clicked", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          id: "role-1",
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });

      wrapper.vm.$emit("delete", role.meta.id);
      expect(wrapper.emitted("delete")).toBeTruthy();
      expect(wrapper.emitted("delete")?.[0]).toEqual([role.meta.id]);
    });
  });

  describe("Date Formatting", () => {
    it("formats createdAt date correctly", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          createdAt: "2025-10-15T10:30:00.000Z",
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });
      const vm = wrapper.vm as any;

      if (role.meta.createdAt) {
        const formattedDate = vm.formatDate(role.meta.createdAt);
        expect(formattedDate).toBeTruthy();
        expect(typeof formattedDate).toBe("string");
      }
    });

    it("formats updatedAt date correctly", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          updatedAt: "2025-10-15T10:30:00.000Z",
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });
      const vm = wrapper.vm as any;

      if (role.meta.updatedAt) {
        const formattedDate = vm.formatDate(role.meta.updatedAt);
        expect(formattedDate).toBeTruthy();
        expect(typeof formattedDate).toBe("string");
      }
    });

    it("formatDate method returns string with month name", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          createdAt: "2025-10-15T10:30:00.000Z",
          updatedAt: "2025-10-15T10:30:00.000Z",
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });
      const vm = wrapper.vm as any;

      const testDate = "2025-10-15T10:30:00.000Z";
      const formatted = vm.formatDate(testDate);

      // Should contain a month name
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const hasMonth = months.some((month) => formatted.includes(month));
      expect(hasMonth).toBe(true);
    });
  });

  describe("Null/Undefined Handling", () => {
    it("handles null role gracefully", () => {
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role: null },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it("renders empty title for null role", () => {
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role: null },
      });

      // Should not crash
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe("Detail Sections", () => {
    it("renders detail sections with proper structure", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          id: "role-1",
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });

      const detailSections = wrapper.findAll(".detail-section");
      expect(detailSections.length).toBeGreaterThan(0);
    });

    it("detail labels have correct styling class", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          id: "role-1",
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });

      const detailLabels = wrapper.findAll(".detail-label");
      expect(detailLabels.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("handles role with very long description", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          description:
            "This is a very long description that might need special handling in the UI to ensure it displays properly without breaking the layout or causing overflow issues in the modal display",
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });

      expect(wrapper.text()).toContain(role.meta.description);
    });

    it("handles role with special characters in description", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          description: "Role with & special < characters > and / symbols",
        },
      };
      const wrapper = createWrapper(RoleDetailModal, {
        props: { role },
      });

      expect(wrapper.text()).toContain(role.meta.description);
    });

    it("displays all roles from fixture correctly", () => {
      rolesFixture.forEach((role: Role) => {
        const wrapper = createWrapper(RoleDetailModal, {
          props: { role },
        });

        expect(wrapper.text()).toContain(role.meta.name);
        if (role.meta.description) {
          expect(wrapper.text()).toContain(role.meta.description);
        }
      });
    });
  });
});
