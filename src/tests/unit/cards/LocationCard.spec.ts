import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import LocationCard from "@/components/cards/LocationCard.vue";
import {
  locationsFixture,
  areasFixture,
  eventsFixture,
} from "@/tests/fixtures";
import { useAreasStore, useEventsStore } from "@/stores";
import { Location } from "@/types";

describe("LocationCard", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();
  });

  describe("Rendering", () => {
    it("renders location name correctly", () => {
      const location: Location = {
        ...locationsFixture[0],
        meta: { ...locationsFixture[0].meta, name: "Location 1" },
      };
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
        },
        pinia,
      });

      expect(wrapper.text()).toContain(location.meta.name);
    });

    it("renders formatted type badge", () => {
      const location: Location = {
        ...locationsFixture[0],
        spec: { ...locationsFixture[0].spec, type: "classroom" },
      };
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
        },
        pinia,
      });

      const expectedType =
        location.spec.type.charAt(0).toUpperCase() +
        location.spec.type.slice(1);
      expect(wrapper.text()).toContain(expectedType);
    });

    it("displays capacity badge", () => {
      const location: Location = {
        ...locationsFixture[0],
        spec: { ...locationsFixture[0].spec, capacity: 25 },
      };
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
        },
        pinia,
      });

      expect(wrapper.text()).toContain(`Capacity: ${location.spec.capacity}`);
    });

    it("shows area name when area is linked", () => {
      const areasStore = useAreasStore();
      areasStore.areas = areasFixture;

      const location: Location = {
        ...locationsFixture[0],
        spec: { ...locationsFixture[0].spec, areaId: "area-1" },
      };
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
        },
        pinia,
      });

      const areaName = areasFixture.find(
        (a) => a.meta.id === location.spec.areaId,
      )?.meta.name;
      if (areaName) {
        expect(wrapper.text()).toContain(areaName);
      }
    });

    it("does not show area when no area is linked", () => {
      const location: Location = {
        ...locationsFixture[0],
        spec: { ...locationsFixture[0].spec, areaId: undefined },
      };
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
        },
        pinia,
      });

      // Area name should not be displayed
      const text = wrapper.text();
      const areaNames = areasFixture.map((a) => a.meta.name);
      areaNames.forEach((areaName) => {
        expect(text).not.toContain(areaName);
      });
    });
  });

  describe("Usage Display", () => {
    it("displays usage bar", () => {
      const location: Location = {
        ...locationsFixture[0],
        spec: { ...locationsFixture[0].spec },
      };
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          usagePercent: 50,
        },
        pinia,
      });

      expect(wrapper.find(".usage-bar").exists()).toBe(true);
    });

    it("shows zero usage when no events", () => {
      const eventsStore = useEventsStore();
      eventsStore.events = [];

      const location: Location = {
        ...locationsFixture[0],
        spec: { ...locationsFixture[0].spec },
      };
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          usagePercent: 0,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("0% average usage");
    });

    it("calculates usage based on events", () => {
      const eventsStore = useEventsStore();
      eventsStore.events = eventsFixture;

      const location: Location = {
        ...locationsFixture[0],
        spec: { ...locationsFixture[0].spec },
      };
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
          usagePercent: 50,
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
      const location: Location = {
        ...locationsFixture[0],
        spec: { ...locationsFixture[0].spec, type: "classroom" },
      };
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
      const location: Location = {
        ...locationsFixture[0],
        spec: { ...locationsFixture[0].spec, type: "classroom" },
      };
      const wrapper = createWrapper(LocationCard, {
        props: {
          location,
        },
        pinia,
      });

      expect(wrapper.classes()).toContain("card-clickable");
    });

    it("has card-horizontal class", () => {
      const location: Location = locationsFixture[0];
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
      const location: Location = locationsFixture[0];
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
      const location: Location = {
        ...locationsFixture[0],
        spec: { ...locationsFixture[0].spec, capacity: undefined },
      };
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
        const location: Location = {
          ...locationsFixture[0],
          spec: { ...locationsFixture[0].spec, type },
        };
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
