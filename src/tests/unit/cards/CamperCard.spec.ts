import { describe, it, expect } from "vitest";
import { createWrapper } from "@/tests/utils";
import CamperCard from "@/components/cards/CamperCard.vue";
import { campersFixture } from "@/tests/fixtures";
import { Camper } from "@/types";

describe("CamperCard", () => {
  describe("Rendering", () => {
    it("renders camper name correctly", () => {
      const camper: Camper = campersFixture[0];
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.text()).toContain(camper.spec.firstName);
      expect(wrapper.text()).toContain(camper.spec.lastName);
    });

    it("renders camper age badge", () => {
      const camper: Camper = campersFixture[0];
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.text()).toContain(`Age ${camper.spec.age}`);
    });

    it("renders gender badge when formattedGender prop is provided", () => {
      const camper: Camper = { ...campersFixture[0], spec: { ...campersFixture[0].spec, gender: "female" } };
      const wrapper = createWrapper(CamperCard, { props: { camper, formattedGender: "Female" } });
      expect(wrapper.text()).toContain("Female");
    });
    it("renders session badge when sessionName prop is provided", () => {
      const camper: Camper = { ...campersFixture[0], spec: { ...campersFixture[0].spec, sessionId: "session-1" } };
      const wrapper = createWrapper(CamperCard, { props: { camper, sessionName: "Current Session" } });

      expect(wrapper.text()).toContain("Current Session");
    });
  });

  describe("Avatar Display", () => {
    it("renders AvatarInitials component with camper name", () => {
      const camper: Camper = { ...campersFixture[0], spec: { ...campersFixture[0].spec, firstName: "John", lastName: "Doe" } };
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      const avatar = wrapper.findComponent({ name: "AvatarInitials" });
      expect(avatar.exists()).toBe(true);
      expect(avatar.props("firstName")).toBe(camper.spec.firstName);
      expect(avatar.props("lastName")).toBe(camper.spec.lastName);
    });
  });

  describe("Click Event", () => {
    it("emits click event with camper when card is clicked", async () => {
      const camper: Camper = { ...campersFixture[0], spec: { ...campersFixture[0].spec, familyGroupId: "family-group-1" } };
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
      const camper: Camper = { ...campersFixture[0], spec: { ...campersFixture[0].spec, familyGroupId: "family-group-1" } };
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.classes()).toContain("card-clickable");
    });

    it("has card-horizontal class for layout", () => {
      const camper: Camper = { ...campersFixture[0], spec: { ...campersFixture[0].spec, familyGroupId: "family-group-1" } };
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.classes()).toContain("card-horizontal");
    });
  });

  describe("Edge Cases", () => {
    it("renders correctly with minimal camper data", () => {
      const minimalCamper: Camper = {
        meta: {
          id: "test-camper",
          name: "Test Camper",
          description: "A test camper",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        spec: {
          firstName: "John",
          lastName: "Doe",
          age: 10,
          gender: "male" as const,
          sessionId: "session-1",
          familyGroupId: "family-group-1",
        },
      };

      const wrapper = createWrapper(CamperCard, {
        props: { camper: minimalCamper },
      });

      expect(wrapper.text()).toContain("John Doe");
      expect(wrapper.text()).toContain("Age 10");
    });

    it("handles empty allergy array", () => {
      const camper: Camper = { ...campersFixture[0], spec: { ...campersFixture[0].spec, familyGroupId: "family-group-1" } };
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      });

      expect(wrapper.text()).not.toContain("Allergy");
    });

    it("renders without optional props", () => {
      const camper: Camper = { ...campersFixture[0], spec: { ...campersFixture[0].spec, familyGroupId: "family-group-1" } };
      const wrapper = createWrapper(CamperCard, {
        props: { camper },
      }); 

      expect(wrapper.exists()).toBe(true);
    });
  });
});
