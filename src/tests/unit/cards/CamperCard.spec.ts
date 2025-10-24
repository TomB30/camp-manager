import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper } from "@/tests/utils";
import CamperCard from "@/components/cards/CamperCard.vue";
import { campersFixture } from "@/tests/fixtures";

describe("CamperCard", () => {
  describe("Rendering", () => {
    it("renders camper name correctly", () => {
      const camper = campersFixture[0];
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.text()).toContain(camper.firstName);
      expect(wrapper.text()).toContain(camper.lastName);
    });

    it("renders camper age badge", () => {
      const camper = campersFixture[0];
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.text()).toContain(`Age ${camper.age}`);
    });

    it("renders gender badge when formattedGender prop is provided", () => {
      const camper = campersFixture[0];
      const wrapper = createWrapper(CamperCard, {
        props: {
          camper,
          formattedGender: "Female",
        },
      });

      expect(wrapper.text()).toContain("Female");
    });

    it("renders session badge when sessionName prop is provided", () => {
      const camper = campersFixture[0];
      const wrapper = createWrapper(CamperCard, {
        props: {
          camper,
          sessionName: "Current Session",
        },
      });

      expect(wrapper.text()).toContain("Current Session");
    });

    it("renders parent contact information", () => {
      const camper = campersFixture[0];
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.text()).toContain(camper.parentContact);
    });
  });

  describe("Allergies Display", () => {
    it("shows allergy badge when camper has allergies", () => {
      const camper = campersFixture[0]; // Has peanut allergy
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.text()).toContain("1 Allergy(ies)");
    });

    it("does not show allergy badge when camper has no allergies", () => {
      const camper = campersFixture[1]; // No allergies
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.text()).not.toContain("Allergy");
    });

    it("shows correct allergy count for multiple allergies", () => {
      const camper = {
        ...campersFixture[0],
        allergies: ["Peanuts", "Dairy", "Shellfish"],
      };
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.text()).toContain("3 Allergy(ies)");
    });
  });

  describe("Avatar Display", () => {
    it("renders AvatarInitials component with camper name", () => {
      const camper = campersFixture[0];
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      const avatar = wrapper.findComponent({ name: "AvatarInitials" });
      expect(avatar.exists()).toBe(true);
      expect(avatar.props("firstName")).toBe(camper.firstName);
      expect(avatar.props("lastName")).toBe(camper.lastName);
    });
  });

  describe("Click Event", () => {
    it("emits click event with camper when card is clicked", async () => {
      const camper = campersFixture[0];
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
      const camper = campersFixture[0];
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.classes()).toContain("card-clickable");
    });

    it("has card-horizontal class for layout", () => {
      const camper = campersFixture[0];
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.classes()).toContain("card-horizontal");
    });
  });

  describe("Edge Cases", () => {
    it("renders correctly with minimal camper data", () => {
      const minimalCamper = {
        id: "test-camper",
        firstName: "John",
        lastName: "Doe",
        age: 10,
        gender: "male" as const,
        sessionId: "session-1",
        parentContact: "555-0000",
        allergies: [],
        createdAt: new Date().toISOString(),
      };

      const wrapper = createWrapper(CamperCard, {
        props: { camper: minimalCamper },
      });

      expect(wrapper.text()).toContain("John Doe");
      expect(wrapper.text()).toContain("Age 10");
    });

    it("handles empty allergy array", () => {
      const camper = { ...campersFixture[0], allergies: [] };
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.text()).not.toContain("Allergy");
    });

    it("renders without optional props", () => {
      const camper = campersFixture[0];
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.exists()).toBe(true);
    });
  });
});

