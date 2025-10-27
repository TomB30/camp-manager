import { describe, it, expect } from "vitest";
import { createWrapper } from "@/tests/utils";
import AreaCard from "@/components/cards/AreaCard.vue";
import { areasFixture } from "@/tests/fixtures";
import { Area } from "@/types";

describe("AreaCard", () => {
  describe("Rendering", () => {
    it("renders area name correctly", () => {
      const area: Area = areasFixture[0];
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Facility",
        },
      });

      expect(wrapper.text()).toContain(area.meta.name);
    });

    it("renders formatted type badge", () => {
      const area: Area = areasFixture[0];
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Facility",
        },
      });

      expect(wrapper.text()).toContain("Facility");
    });

    it("displays capacity when provided", () => {
      const area: Area = areasFixture[0];
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Facility",
        },
      });

      if (area.spec.capacity) {
        expect(wrapper.text()).toContain(area.spec.capacity.toString());
      }
    });

    it("renders description when provided", () => {
      const area: Area = areasFixture[0];
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Facility",
        },
      });

      if (area.meta.description) {
        expect(wrapper.text()).toContain(area.meta.description);
      }
    });

    it("does not show description when not provided", () => {
      const area: Area = {
        ...areasFixture[0],
        meta: { ...areasFixture[0].meta, description: undefined },
      };
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Facility",
        },
      });

      expect(wrapper.find(".card-description").exists()).toBe(false);
    });
  });

  describe("Equipment and Notes", () => {
    it("shows equipment count when equipment exists", () => {
      const area: Area = areasFixture[0];
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Facility",
        },
      });

      if (area.spec.equipment && area.spec.equipment.length > 0) {
        expect(wrapper.text()).toContain(
          `${area.spec.equipment.length} equipment`,
        );
      }
    });

    it("does not show equipment when array is empty", () => {
      const area: Area = {
        ...areasFixture[0],
        spec: { ...areasFixture[0].spec, equipment: [] },
      };
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Facility",
        },
      });

      expect(wrapper.text()).not.toContain("equipment");
    });

    it("shows notes indicator when notes exist", () => {
      const area: Area = areasFixture[0];
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Facility",
        },
      });

      if (area.spec.notes) {
        expect(wrapper.text()).toContain("Has notes");
      }
    });

    it("does not show notes indicator when no notes", () => {
      const area: Area = {
        ...areasFixture[0],
        spec: { ...areasFixture[0].spec, notes: undefined },
      };
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Facility",
        },
      });

      expect(wrapper.text()).not.toContain("Has notes");
    });
  });

  describe("Type Badge Styling", () => {
    it("applies correct badge class for indoor type", () => {
      const area: Area = {
        ...areasFixture[0],
        spec: { ...areasFixture[0].spec, type: "indoor" },
      };
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Indoor",
        },
      });

      const badge = wrapper.find(".badge-primary");
      expect(badge.exists()).toBe(true);
    });

    it("applies correct badge class for outdoor type", () => {
      const area: Area = {
        ...areasFixture[0],
        spec: { ...areasFixture[0].spec, type: "outdoor" },
      };
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Outdoor",
        },
      });

      const badge = wrapper.find(".badge-success");
      expect(badge.exists()).toBe(true);
    });

    it("applies correct badge class for water type", () => {
      const area: Area = {
        ...areasFixture[0],
        spec: { ...areasFixture[0].spec, type: "water" },
      };
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Water",
        },
      });

      const badge = wrapper.find(".badge-blue");
      expect(badge.exists()).toBe(true);
    });
  });

  describe("Icon and Styling", () => {
    it("applies icon color", () => {
      const area: Area = areasFixture[0];
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Facility",
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
      const area: Area = areasFixture[0];
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Facility",
        },
      });

      expect(wrapper.find(".card-icon").exists()).toBe(true);
    });

    it("has card-clickable class", () => {
      const area: Area = areasFixture[0];
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Facility",
        },
      });

      expect(wrapper.classes()).toContain("card-clickable");
    });

    it("has area-card class", () => {
      const area: Area = areasFixture[0];
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Facility",
        },
      });

      expect(wrapper.classes()).toContain("area-card");
    });
  });

  describe("Click Event", () => {
    it("emits click event when card is clicked", async () => {
      const area: Area = areasFixture[0];
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Facility",
        },
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("click")).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("handles area without capacity", () => {
      const area: Area = {
        ...areasFixture[0],
        spec: { ...areasFixture[0].spec, capacity: undefined },
      };
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Facility",
        },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it("handles very long equipment list", () => {
      const area: Area = {
        ...areasFixture[0],
        spec: {
          ...areasFixture[0].spec,
          equipment: Array.from(
            { length: 50 },
            (_, i) => `Equipment ${i + 1}`,
          ) as string[],
        },
      };
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Facility",
        },
      });

      expect(wrapper.text()).toContain("50 equipment");
    });
  });
});
