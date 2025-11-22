import { describe, it, expect } from "vitest";
import { createWrapper } from "@/tests/utils";
import CamperCard from "@/components/cards/CamperCard.vue";
import { campersFixture } from "@/tests/fixtures";
import { Camper } from "@/generated/api";

describe("CamperCard", () => {
  describe("Rendering", () => {
    it("renders camper name correctly", () => {
      const camper: Camper = campersFixture[0];
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.text()).toContain(camper.meta.name);
    });

    it("renders camper age badge", () => {
      const camper: Camper = campersFixture[0];
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      // Age is calculated from birthday, so we just check that it shows an age
      expect(wrapper.text()).toContain("Age");
    });

    it("renders gender badge when formattedGender prop is provided", () => {
      const camper: Camper = {
        ...campersFixture[0],
        spec: { ...campersFixture[0].spec, gender: "female" },
      };
      const wrapper = createWrapper(CamperCard, {
        props: { camper, formattedGender: "Female" },
      });
      expect(wrapper.text()).toContain("Female");
    });
    it("renders session badge when sessionName prop is provided", () => {
      const camper: Camper = {
        ...campersFixture[0],
        spec: { ...campersFixture[0].spec, sessionId: "session-1" },
      };
      const wrapper = createWrapper(CamperCard, {
        props: { camper, sessionName: "Current Session" },
      });

      expect(wrapper.text()).toContain("Current Session");
    });
  });

  describe("Avatar Display", () => {
    it("renders AvatarInitials component with camper name", () => {
      const camper: Camper = {
        ...campersFixture[0],
        spec: { ...campersFixture[0].spec },
      };
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      const avatar = wrapper.findComponent({ name: "AvatarInitials" });
      expect(avatar.exists()).toBe(true);
      const nameParts = camper.meta.name.split(" ");
      expect(avatar.props("firstName")).toBe(nameParts[0]);
      expect(avatar.props("lastName")).toBe(nameParts.slice(1).join(" "));
    });
  });

  describe("Click Event", () => {
    it("emits click event with camper when card is clicked", async () => {
      const camper: Camper = {
        ...campersFixture[0],
        spec: { ...campersFixture[0].spec, housingGroupId: "housing-group-1" },
      };
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("click")).toBeTruthy();
      expect(wrapper.emitted("click")?.[0]).toEqual([camper]);
    });
  });

  describe("Styling", () => {
    it("has card-clickable class for hover effect", () => {
      const camper: Camper = {
        ...campersFixture[0],
        spec: { ...campersFixture[0].spec, housingGroupId: "housing-group-1" },
      };
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.classes()).toContain("clickable");
    });
  });

  describe("Edge Cases", () => {
    it("renders correctly with minimal camper data", () => {
      const minimalCamper: Camper = {
        meta: {
          id: "test-camper",
          tenantId: "00000000-0000-0000-0000-000000000001",
          campId: "00000000-0000-0000-0000-000000000002",
          name: "Test Camper",
          description: "A test camper",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        spec: {
          birthday: "2015-05-15", // Age 10 as of 2025
          gender: "male" as const,
          sessionId: "session-1",
          housingGroupId: "housing-group-1",
        },
      };

      const wrapper = createWrapper(CamperCard, {
        props: { camper: minimalCamper },
      });

      expect(wrapper.text()).toContain("Test Camper");
      expect(wrapper.text()).toContain("Age");
    });

    it("handles empty allergy array", () => {
      const camper: Camper = {
        ...campersFixture[0],
        spec: { ...campersFixture[0].spec, housingGroupId: "housing-group-1" },
      };
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.text()).not.toContain("Allergy");
    });

    it("renders without optional props", () => {
      const camper: Camper = {
        ...campersFixture[0],
        spec: { ...campersFixture[0].spec, housingGroupId: "housing-group-1" },
      };
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.exists()).toBe(true);
    });
  });
});
