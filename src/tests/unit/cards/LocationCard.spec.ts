import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import LocationCard from "@/components/cards/LocationCard.vue";
import { locationsFixture, areasFixture } from "@/tests/fixtures";
import { useAreasStore } from "@/stores";

describe("LocationCard", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();
  });

  describe("Rendering", () => {
    it("renders location name correctly", () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          formattedType: "Classroom",
          iconColor: "#3B82F6",
        },
        pinia,
      });

      expect(wrapper.text()).toContain(location.name);
    });

    it("renders formatted type badge", () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          formattedType: "Classroom",
          iconColor: "#3B82F6",
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Classroom");
    });

    it("displays capacity badge", () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          formattedType: "Classroom",
          iconColor: "#3B82F6",
        },
        pinia,
      });

      expect(wrapper.text()).toContain(`Capacity: ${location.capacity}`);
    });

    it("shows area name when area is linked", () => {
      const areasStore = useAreasStore();
      areasStore.areas = areasFixture;

      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          formattedType: "Classroom",
          iconColor: "#3B82F6",
        },
        pinia,
      });

      const areaName = areasFixture.find(a => a.id === location.areaId)?.name;
      if (areaName) {
        expect(wrapper.text()).toContain(areaName);
      }
    });

    it("does not show area when no area is linked", () => {
      const location = { ...locationsFixture[0], areaId: undefined };
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          formattedType: "Classroom",
          iconColor: "#3B82F6",
        },
        pinia,
      });

      // Area name should not be displayed
      const text = wrapper.text();
      const areaNames = areasFixture.map(a => a.name);
      areaNames.forEach(areaName => {
        expect(text).not.toContain(areaName);
      });
    });
  });

  describe("Usage Display", () => {
    it("displays usage bar", () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          formattedType: "Classroom",
          iconColor: "#3B82F6",
          usagePercent: 75,
        },
        pinia,
      });

      expect(wrapper.find(".usage-bar").exists()).toBe(true);
    });

    it("shows usage percentage text", () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          formattedType: "Classroom",
          iconColor: "#3B82F6",
          usagePercent: 65,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("65% average usage");
    });

    it("applies correct width to usage fill", () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          formattedType: "Classroom",
          iconColor: "#3B82F6",
          usagePercent: 50,
        },
        pinia,
      });

      const usageFill = wrapper.find(".usage-fill");
      expect(usageFill.attributes("style")).toContain("width: 50%");
    });

    it("uses error color for high usage (>80%)", () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          formattedType: "Classroom",
          iconColor: "#3B82F6",
          usagePercent: 85,
        },
        pinia,
      });

      const usageFill = wrapper.find(".usage-fill");
      expect(usageFill.attributes("style")).toContain("var(--error-color)");
    });

    it("uses success color for normal usage (<=80%)", () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          formattedType: "Classroom",
          iconColor: "#3B82F6",
          usagePercent: 60,
        },
        pinia,
      });

      const usageFill = wrapper.find(".usage-fill");
      expect(usageFill.attributes("style")).toContain("var(--success-color)");
    });
  });

  describe("Icon and Styling", () => {
    it("applies icon color to card icon", () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          formattedType: "Classroom",
          iconColor: "#FF0000",
        },
        pinia,
      });

      const cardIcon = wrapper.find(".card-icon");
      const style = cardIcon.attributes("style");
      expect(style).toContain("background");
      expect(style?.includes("#FF0000") || style?.includes("rgb(255, 0, 0)")).toBe(true);
    });

    it("has card-clickable class", () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          formattedType: "Classroom",
          iconColor: "#3B82F6",
        },
        pinia,
      });

      expect(wrapper.classes()).toContain("card-clickable");
    });

    it("has card-horizontal class", () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          formattedType: "Classroom",
          iconColor: "#3B82F6",
        },
        pinia,
      });

      expect(wrapper.classes()).toContain("card-horizontal");
    });
  });

  describe("Click Event", () => {
    it("emits click event with location when card is clicked", async () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          formattedType: "Classroom",
          iconColor: "#3B82F6",
        },
        pinia,
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("click")).toBeTruthy();
      expect(wrapper.emitted("click")?.[0]).toEqual([location]);
    });
  });

  describe("Edge Cases", () => {
    it("handles zero usage", () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          formattedType: "Classroom",
          iconColor: "#3B82F6",
          usagePercent: 0,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("0% average usage");
    });

    it("handles 100% usage", () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          formattedType: "Classroom",
          iconColor: "#3B82F6",
          usagePercent: 100,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("100% average usage");
      const usageFill = wrapper.find(".usage-fill");
      expect(usageFill.attributes("style")).toContain("width: 100%");
    });
  });
});

