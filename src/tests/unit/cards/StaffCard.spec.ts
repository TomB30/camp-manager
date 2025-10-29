import { describe, it, expect } from "vitest";
import { createWrapper } from "@/tests/utils";
import StaffCard from "@/components/cards/StaffCard.vue";
import { staffMembersFixture } from "@/tests/fixtures";
import { StaffMember } from "@/generated/api";

describe("StaffCard", () => {
  describe("Rendering", () => {
    it("renders staff member name correctly", () => {
      const member: StaffMember = {
        ...staffMembersFixture[0],
        spec: {
          ...staffMembersFixture[0].spec,
        },
      };
      const wrapper = createWrapper(StaffCard, {
        props: {
          member,
          formattedRole: "Counselor",
        },
      });

      expect(wrapper.text()).toContain(member.meta.name);
    });

    it("renders formatted role badge", () => {
      const member: StaffMember = {
        ...staffMembersFixture[0],
        spec: {
          ...staffMembersFixture[0].spec,
        },
      };
      const wrapper = createWrapper(StaffCard, {
        props: {
          member,
          formattedRole: "Counselor",
        },
      });

      expect(wrapper.text()).toContain("Counselor");
    });

    it("renders email when provided", () => {
      const member: StaffMember = {
        ...staffMembersFixture[0],
        spec: {
          ...staffMembersFixture[0].spec,
          email: "john.doe@camp.com",
        },
      };
      const wrapper = createWrapper(StaffCard, {
        props: {
          member,
          formattedRole: "Counselor",
        },
      });

      expect(wrapper.text()).toContain(member.spec.email);
    });

    it("renders certification count when certifications exist", () => {
      // Create member with certificationIds property (StaffCard uses certificationIds not certifications)
      const member: StaffMember = {
        ...staffMembersFixture[0],
        spec: {
          ...staffMembersFixture[0].spec,
          certificationIds: ["cert-1", "cert-2"],
        },
      };
      const wrapper = createWrapper(StaffCard, {
        props: {
          member,
          formattedRole: "Counselor",
        },
      });

      expect(wrapper.text()).toContain("2 Certification(s)");
    });

    it("does not show certification count when no certifications", () => {
      const member: StaffMember = {
        ...staffMembersFixture[7],
        spec: { ...staffMembersFixture[7].spec, certificationIds: [] },
      }; // Has no certifications
      const wrapper = createWrapper(StaffCard, {
        props: {
          member,
          formattedRole: "Counselor",
        },
      });

      expect(wrapper.text()).not.toContain("Certification");
    });
  });

  describe("Avatar Display", () => {
    it("renders AvatarInitials component with staff name", () => {
      const member: StaffMember = {
        ...staffMembersFixture[0],
        spec: {
          ...staffMembersFixture[0].spec,
        },
      };
      const wrapper = createWrapper(StaffCard, {
        props: {
          member,
          formattedRole: "Counselor",
        },
      });

      const avatar = wrapper.findComponent({ name: "AvatarInitials" });
      expect(avatar.exists()).toBe(true);
      const nameParts = member.meta.name.split(" ");
      expect(avatar.props("firstName")).toBe(nameParts[0]);
      expect(avatar.props("lastName")).toBe(nameParts.slice(1).join(" "));
      expect(avatar.props("size")).toBe("lg");
    });
  });

  describe("Click Event", () => {
    it("emits click event with member when card is clicked", async () => {
      const member: StaffMember = {
        ...staffMembersFixture[0],
        spec: {
          ...staffMembersFixture[0].spec,
        },
      };
      const wrapper = createWrapper(StaffCard, {
        props: {
          member,
          formattedRole: "Counselor",
        },
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("click")).toBeTruthy();
      expect(wrapper.emitted("click")?.[0]).toEqual([member]);
    });
  });

  describe("Styling", () => {
    it("has card-clickable class", () => {
      const member: StaffMember = {
        ...staffMembersFixture[0],
        spec: {
          ...staffMembersFixture[0].spec,
        },
      };
      const wrapper = createWrapper(StaffCard, {
        props: {
          member,
          formattedRole: "Counselor",
        },
      });

      expect(wrapper.classes()).toContain("card-clickable");
    });

    it("has card-horizontal class", () => {
      const member: StaffMember = {
        ...staffMembersFixture[0],
        spec: {
          ...staffMembersFixture[0].spec,
        },
      };
      const wrapper = createWrapper(StaffCard, {
        props: {
          member,
          formattedRole: "Counselor",
        },
      });

      expect(wrapper.classes()).toContain("card-horizontal");
    });
  });
});
