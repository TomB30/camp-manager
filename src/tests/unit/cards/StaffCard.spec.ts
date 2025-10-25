import { describe, it, expect } from "vitest";
import { createWrapper } from "@/tests/utils";
import StaffCard from "@/components/cards/StaffCard.vue";
import { staffMembersFixture } from "@/tests/fixtures";

describe("StaffCard", () => {
  describe("Rendering", () => {
    it("renders staff member name correctly", () => {
      const member = staffMembersFixture[0];
      const wrapper = createWrapper(StaffCard, {
        props: {
          member,
          formattedRole: "Counselor",
        },
      });

      expect(wrapper.text()).toContain(member.firstName);
      expect(wrapper.text()).toContain(member.lastName);
    });

    it("renders formatted role badge", () => {
      const member = staffMembersFixture[0];
      const wrapper = createWrapper(StaffCard, {
        props: {
          member,
          formattedRole: "Counselor",
        },
      });

      expect(wrapper.text()).toContain("Counselor");
    });

    it("renders email when provided", () => {
      const member = staffMembersFixture[0];
      const wrapper = createWrapper(StaffCard, {
        props: {
          member,
          formattedRole: "Counselor",
        },
      });

      expect(wrapper.text()).toContain(member.email);
    });

    it("renders certification count when certifications exist", () => {
      // Create member with certificationIds property (StaffCard uses certificationIds not certifications)
      const member = {
        ...staffMembersFixture[0],
        certificationIds: ["cert-1", "cert-2"],
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
      const member = staffMembersFixture[7]; // Has no certifications
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
      const member = staffMembersFixture[0];
      const wrapper = createWrapper(StaffCard, {
        props: {
          member,
          formattedRole: "Counselor",
        },
      });

      const avatar = wrapper.findComponent({ name: "AvatarInitials" });
      expect(avatar.exists()).toBe(true);
      expect(avatar.props("firstName")).toBe(member.firstName);
      expect(avatar.props("lastName")).toBe(member.lastName);
      expect(avatar.props("size")).toBe("lg");
    });
  });

  describe("Click Event", () => {
    it("emits click event with member when card is clicked", async () => {
      const member = staffMembersFixture[0];
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
      const member = staffMembersFixture[0];
      const wrapper = createWrapper(StaffCard, {
        props: {
          member,
          formattedRole: "Counselor",
        },
      });

      expect(wrapper.classes()).toContain("card-clickable");
    });

    it("has card-horizontal class", () => {
      const member = staffMembersFixture[0];
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
