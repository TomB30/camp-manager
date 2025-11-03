import { describe, it, expect } from "vitest";
import { createWrapper } from "@/tests/utils";
import RoleCard from "@/components/cards/RoleCard.vue";
import { rolesFixture } from "@/tests/fixtures";
import { Role } from "@/generated/api";

describe("RoleCard", () => {
  describe("Rendering", () => {
    it("renders role name correctly", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: { ...rolesFixture[0].meta, name: "Role 1" },
      };
      const wrapper = createWrapper(RoleCard, {
        props: { role },
      });

      expect(wrapper.text()).toContain(role.meta.name);
    });

    it("renders description when provided", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: { ...rolesFixture[0].meta, description: "Role 1 description" },
      };
      const wrapper = createWrapper(RoleCard, {
        props: { role },
      });

      if (role.meta.description) {
        expect(wrapper.text()).toContain(role.meta.description);
      }
    });

    it("shows 'No description provided' when description is missing", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: { ...rolesFixture[0].meta, description: undefined },
      };
      const wrapper = createWrapper(RoleCard, {
        props: { role },
      });

      expect(wrapper.text()).toContain("No description provided");
    });

    it("shows 'No description provided' when description is empty string", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: { ...rolesFixture[0].meta, description: "" },
      };
      const wrapper = createWrapper(RoleCard, {
        props: { role },
      });

      expect(wrapper.text()).toContain("No description provided");
    });
  });

  describe("Icon and Styling", () => {
    it("applies icon color", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: { ...rolesFixture[0].meta, id: "role-1" },
      };
      const wrapper = createWrapper(RoleCard, {
        props: {
          role,
          iconColor: "#FF0000",
        },
      });

      const cardIcon = wrapper.find(".card-icon");
      const style = cardIcon.attributes("style");
      expect(style).toContain("background");
      expect(
        style?.includes("#FF0000") || style?.includes("rgb(255, 0, 0)"),
      ).toBe(true);
    });

    it("uses default icon color when not provided", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: { ...rolesFixture[0].meta, id: "role-1" },
      };
      const wrapper = createWrapper(RoleCard, {
        props: { role },
      });

      const cardIcon = wrapper.find(".card-icon");
      expect(cardIcon.exists()).toBe(true);
      const style = cardIcon.attributes("style");
      // Default color is #6366f1
      expect(
        style?.includes("#6366f1") || style?.includes("rgb(99, 102, 241)"),
      ).toBe(true);
    });

    it("has card-clickable class", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: { ...rolesFixture[0].meta, id: "role-1" },
      };
      const wrapper = createWrapper(RoleCard, {
        props: { role },
      });

      expect(wrapper.classes()).toContain("card-clickable");
    });

    it("has role-card class", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: { ...rolesFixture[0].meta, id: "role-1" },
      };
      const wrapper = createWrapper(RoleCard, {
        props: { role },
      });

      expect(wrapper.classes()).toContain("role-card");
    });

    it("has card-horizontal class", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: { ...rolesFixture[0].meta, id: "role-1" },
      };
      const wrapper = createWrapper(RoleCard, {
        props: { role },
      });

      expect(wrapper.classes()).toContain("card-horizontal");
    });
  });

  describe("Icons", () => {
    it("displays shield icon", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: { ...rolesFixture[0].meta, id: "role-1" },
      };
      const wrapper = createWrapper(RoleCard, {
        props: { role },
      });

      const icon = wrapper.findComponent({ name: "Icon" });
      expect(icon.exists()).toBe(true);
    });

    it("allows custom icon via slot", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: { ...rolesFixture[0].meta, id: "role-1" },
      };
      const wrapper = createWrapper(RoleCard, {
        props: { role },
        slots: {
          icon: '<div class="custom-icon">Custom</div>',
        },
      });

      expect(wrapper.find(".custom-icon").exists()).toBe(true);
    });
  });

  describe("Click Event", () => {
    it("emits click event when card is clicked", async () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: { ...rolesFixture[0].meta, id: "role-1" },
      };
      const wrapper = createWrapper(RoleCard, {
        props: { role },
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("click")).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("handles role with very long name", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          name: "Very Long Role Name That Might Need Truncation in Some Cases",
        },
      };
      const wrapper = createWrapper(RoleCard, {
        props: { role },
      });

      expect(wrapper.text()).toContain(role.meta.name);
    });

    it("handles role with very long description", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: {
          ...rolesFixture[0].meta,
          description:
            "This is a very long description that might need special handling in the UI to ensure it displays properly without breaking the layout or causing overflow issues",
        },
      };
      const wrapper = createWrapper(RoleCard, { props: { role } });
      expect(wrapper.text()).toContain(role.meta.description);
    });
    it("handles role with special characters in name", () => {
      const role: Role = {
        ...rolesFixture[0],
        meta: { ...rolesFixture[0].meta, name: "Role & Leader / Manager" },
      };
      const wrapper = createWrapper(RoleCard, { props: { role } });
      expect(wrapper.text()).toContain(role.meta.name);
    });
    describe("Data Display", () => {
      it("displays all roles from fixture correctly", () => {
        rolesFixture.forEach((role: Role) => {
          const wrapper = createWrapper(RoleCard, { props: { role } });
          expect(wrapper.text()).toContain(role.meta.name);
          if (role.meta.description) {
            expect(wrapper.text()).toContain(role.meta.description);
          }
        });
      });
    });
  });
});
