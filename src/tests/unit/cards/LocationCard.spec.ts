import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import LocationCard from "@/components/cards/LocationCard.vue";
import { locationsFixture, areasFixture, eventsFixture } from "@/tests/fixtures";
import { useAreasStore, useEventsStore } from "@/stores";

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
        },
        pinia,
      });

      const expectedType = location.type.charAt(0).toUpperCase() + location.type.slice(1);
      expect(wrapper.text()).toContain(expectedType);
    });

    it("displays capacity badge", () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
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
        },
        pinia,
      });

      const areaName = areasFixture.find((a) => a.id === location.areaId)?.name;
      if (areaName) {
        expect(wrapper.text()).toContain(areaName);
      }
    });

    it("does not show area when no area is linked", () => {
      const location = { ...locationsFixture[0], areaId: undefined };
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
        },
        pinia,
      });

      // Area name should not be displayed
      const text = wrapper.text();
      const areaNames = areasFixture.map((a) => a.name);
      areaNames.forEach((areaName) => {
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
        },
        pinia,
      });

      expect(wrapper.find(".usage-bar").exists()).toBe(true);
    });

    it("shows zero usage when no events", () => {
      const eventsStore = useEventsStore();
      eventsStore.events = [];
      
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("0% average usage");
    });

    it("calculates usage based on events", () => {
      const eventsStore = useEventsStore();
      eventsStore.events = eventsFixture;
      
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
        },
        pinia,
      });

      const usageFill = wrapper.find(".usage-fill");
      expect(usageFill.exists()).toBe(true);
      // Usage should be calculated and displayed
      const usageText = wrapper.find(".location-usage").text();
      expect(usageText).toMatch(/\d+% average usage/);
    });
  });

  describe("Icon and Styling", () => {
    it("applies appropriate icon color based on location type", () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
        },
        pinia,
      });

      const cardIcon = wrapper.find(".card-icon");
      const style = cardIcon.attributes("style");
      expect(style).toContain("background");
    });

    it("has card-clickable class", () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
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
        },
        pinia,
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("click")).toBeTruthy();
      expect(wrapper.emitted("click")?.[0]).toEqual([location]);
    });
  });

  describe("Edge Cases", () => {
    it("handles location without capacity", () => {
      const location = { ...locationsFixture[0], capacity: undefined };
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("0% average usage");
    });

    it("formats different location types correctly", () => {
      const testTypes: Array<{ type: any; expected: string }> = [
        { type: "classroom", expected: "Classroom" },
        { type: "sports", expected: "Sports" },
        { type: "outdoor", expected: "Outdoor" },
      ];

      testTypes.forEach(({ type, expected }) => {
        const location = { ...locationsFixture[0], type };
        const wrapper = createWrapper(LocationCard, {
          props: {
            location,
          },
          pinia,
        });

        expect(wrapper.text()).toContain(expected);
      });
    });
  });
});
