import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import ProgramCard from "@/components/cards/ProgramCard.vue";
import { programsFixture, colorsFixture } from "@/tests/fixtures";
import { useColorsStore } from "@/stores";

describe("ProgramCard", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();
  });

  describe("Rendering", () => {
    it("renders program name correctly", () => {
      const program = programsFixture[0];
      const wrapper = createWrapper(ProgramCard, {
        props: { program },
        pinia,
      });

      expect(wrapper.text()).toContain(program.name);
    });

    it("renders program description when provided", () => {
      const program = programsFixture[0];
      const wrapper = createWrapper(ProgramCard, {
        props: { program },
        pinia,
      });

      if (program.description) {
        expect(wrapper.text()).toContain(program.description);
      }
    });

    it("does not render description section when no description", () => {
      const program = { ...programsFixture[0], description: undefined };
      const wrapper = createWrapper(ProgramCard, {
        props: { program },
        pinia,
      });

      expect(wrapper.find(".card-description").exists()).toBe(false);
    });
  });

  describe("Counts Display", () => {
    it("displays activities count", () => {
      const program = programsFixture[0];
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
      const program = programsFixture[0];
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
      const program = programsFixture[0];
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
      const program = programsFixture[0];
      const wrapper = createWrapper(ProgramCard, {
        props: {
          program,
          activitiesCount: 0,
          staffCount: 0,
          locationsCount: 0,
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

      const program = programsFixture[0];
      const wrapper = createWrapper(ProgramCard, {
        props: { program },
        pinia,
      });

      const style = wrapper.attributes("style");
      expect(style).toContain("border-left");
    });

    it("uses default color when no color is set", () => {
      const program = { ...programsFixture[0], colorId: undefined };
      const wrapper = createWrapper(ProgramCard, {
        props: { program },
        pinia,
      });

      const style = wrapper.attributes("style");
      expect(style).toContain("#6366F1"); // Default color
    });

    it("has card-clickable class", () => {
      const program = programsFixture[0];
      const wrapper = createWrapper(ProgramCard, {
        props: { program },
        pinia,
      });

      expect(wrapper.classes()).toContain("card-clickable");
    });
  });

  describe("Click Event", () => {
    it("emits click event with program when card is clicked", async () => {
      const program = programsFixture[0];
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
      const program = programsFixture[0];
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
      const program = programsFixture[0];
      const wrapper = createWrapper(ProgramCard, {
        props: {
          program,
          activitiesCount: 999,
          staffCount: 999,
          locationsCount: 999,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("999 activities");
      expect(wrapper.text()).toContain("999 staff");
      expect(wrapper.text()).toContain("999 locations");
    });
  });
});
