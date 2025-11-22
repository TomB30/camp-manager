import { describe, it, expect } from "vitest";
import { createWrapper } from "@/tests/utils";
import AreaCard from "@/components/cards/AreaCard.vue";
import { areasFixture } from "@/tests/fixtures";
import { Area } from "@/generated/api";

describe("AreaCard", () => {
  describe("Rendering", () => {
    it("renders area name correctly", () => {
      const area: Area = areasFixture[0];
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
        },
      });

      expect(wrapper.text()).toContain(area.meta.name);
    });

    it("displays capacity when provided", () => {
      const area: Area = areasFixture[0];
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
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

  describe("Icon Display", () => {
    it("displays Map icon", () => {
      const area: Area = areasFixture[0];
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
        },
      });

      const cardIcon = wrapper.find(".card-icon");
      expect(cardIcon.exists()).toBe(true);
    });
  });

  describe("Icon and Styling", () => {
    it("has card-clickable class", () => {
      const area: Area = areasFixture[0];
      const wrapper = createWrapper(AreaCard, {
        props: {
          area,
          formatType: "Facility",
        },
      });

      expect(wrapper.classes()).toContain("clickable");
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
