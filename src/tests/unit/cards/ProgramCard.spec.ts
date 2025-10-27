import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import ProgramCard from "@/components/cards/ProgramCard.vue";
import { programsFixture, colorsFixture } from "@/tests/fixtures";
import { useColorsStore } from "@/stores";
import { Program } from "@/types";

describe("ProgramCard", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();
  });

  describe("Rendering", () => {
    it("renders program name correctly", () => {
      const program: Program = {
        ...programsFixture[0],
        meta: { ...programsFixture[0].meta, name: "Program 1" },
      };
      const wrapper = createWrapper(ProgramCard, {
        props: { program },
        pinia,
      });

      expect(wrapper.text()).toContain(program.meta.name);
    });

    it("renders program description when provided", () => {
      const program: Program = {
        ...programsFixture[0],
        meta: {
          ...programsFixture[0].meta,
          description: "Program 1 description",
        },
      };
      const wrapper = createWrapper(ProgramCard, {
        props: { program },
        pinia,
      });

      if (program.meta.description) {
        expect(wrapper.text()).toContain(program.meta.description);
      }
    });

    it("does not render description section when no description", () => {
      const program: Program = {
        ...programsFixture[0],
        meta: { ...programsFixture[0].meta, description: undefined },
      };
      const wrapper = createWrapper(ProgramCard, {
        props: { program },
        pinia,
      });

      expect(wrapper.find(".card-description").exists()).toBe(false);
    });
  });

  describe("Counts Display", () => {
    it("displays activities count", () => {
      const program: Program = {
        ...programsFixture[0],
        spec: {
          ...programsFixture[0].spec,
          activityIds: [
            "activity-1",
            "activity-2",
            "activity-3",
            "activity-4",
            "activity-5",
          ],
        },
      };
      const wrapper = createWrapper(ProgramCard, {
        props: {
          program,
          activitiesCount: 5,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("5 activities");
    });

    it("displays staff count", () => {
      const program: Program = {
        ...programsFixture[0],
        spec: {
          ...programsFixture[0].spec,
          staffMemberIds: ["staff-1", "staff-2", "staff-3"],
        },
      };
      const wrapper = createWrapper(ProgramCard, {
        props: {
          program,
          staffCount: 3,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("3 staff");
    });

    it("displays locations count", () => {
      const program: Program = {
        ...programsFixture[0],
        spec: {
          ...programsFixture[0].spec,
          locationIds: ["location-1", "location-2", "location-3", "location-4"],
        },
      };
      const wrapper = createWrapper(ProgramCard, {
        props: {
          program,
          locationsCount: 4,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("4 locations");
    });

    it("handles zero counts", () => {
      const program: Program = {
        ...programsFixture[0],
        spec: {
          ...programsFixture[0].spec,
          activityIds: [],
          staffMemberIds: [],
          locationIds: [],
        },
      };
      const wrapper = createWrapper(ProgramCard, {
        props: {
          program,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("0 activities");
      expect(wrapper.text()).toContain("0 staff");
      expect(wrapper.text()).toContain("0 locations");
    });
  });

  describe("Color and Styling", () => {
    it("applies color border when color is set", () => {
      const colorsStore = useColorsStore();
      colorsStore.colors = colorsFixture;

      const program: Program = {
        ...programsFixture[0],
        spec: { ...programsFixture[0].spec, colorId: colorsFixture[0].meta.id },
      };
      const wrapper = createWrapper(ProgramCard, {
        props: { program },
        pinia,
      });

      const style = wrapper.attributes("style");
      expect(style).toContain("border-left");
    });

    it("uses default color when no color is set", () => {
      const program: Program = {
        ...programsFixture[0],
        spec: { ...programsFixture[0].spec, colorId: undefined },
      };
      const wrapper = createWrapper(ProgramCard, {
        props: { program },
        pinia,
      });

      const style = wrapper.attributes("style");
      expect(style).toContain("#6366F1"); // Default color
    });

    it("has card-clickable class", () => {
      const program: Program = {
        ...programsFixture[0],
        meta: { ...programsFixture[0].meta, id: "program-1" },
      };
      const wrapper = createWrapper(ProgramCard, {
        props: { program },
        pinia,
      });

      expect(wrapper.classes()).toContain("card-clickable");
    });
  });

  describe("Click Event", () => {
    it("emits click event with program when card is clicked", async () => {
      const program: Program = {
        ...programsFixture[0],
        meta: { ...programsFixture[0].meta, id: "program-1" },
      };
      const wrapper = createWrapper(ProgramCard, {
        props: { program },
        pinia,
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("click")).toBeTruthy();
      expect(wrapper.emitted("click")?.[0]).toEqual([program]);
    });
  });

  describe("Icons", () => {
    it("displays icons for stats", () => {
      const program: Program = {
        ...programsFixture[0],
        meta: { ...programsFixture[0].meta, id: "program-1" },
      };
      const wrapper = createWrapper(ProgramCard, {
        props: { program },
        pinia,
      });

      const icons = wrapper.findAllComponents({ name: "Icon" });
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("renders with all counts at maximum", () => {
      const program: Program = {
        ...programsFixture[0],
        spec: {
          ...programsFixture[0].spec,
          activityIds: [
            "activity-1",
            "activity-2",
            "activity-3",
            "activity-4",
            "activity-5",
            "activity-6",
            "activity-7",
            "activity-8",
            "activity-9",
            "activity-10",
          ],
          staffMemberIds: [
            "staff-1",
            "staff-2",
            "staff-3",
            "staff-4",
            "staff-5",
            "staff-6",
            "staff-7",
            "staff-8",
            "staff-9",
            "staff-10",
          ],
          locationIds: [
            "location-1",
            "location-2",
            "location-3",
            "location-4",
            "location-5",
            "location-6",
            "location-7",
            "location-8",
            "location-9",
            "location-10",
          ],
        },
      };
      const wrapper = createWrapper(ProgramCard, {
        props: {
          program,
          staffCount: 10,
          locationsCount: 10,
          activitiesCount: 10,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("10 activities");
      expect(wrapper.text()).toContain("10 staff");
      expect(wrapper.text()).toContain("10 locations");
    });
  });
});
