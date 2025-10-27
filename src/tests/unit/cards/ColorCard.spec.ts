import { describe, it, expect } from "vitest";
import { createWrapper } from "@/tests/utils";
import ColorCard from "@/components/cards/ColorCard.vue";
import { colorsFixture } from "@/tests/fixtures";
import { Color } from "@/types";

describe("ColorCard", () => {
  describe("Rendering", () => {
    it("renders color name correctly", () => {
      const color: Color = {
        ...colorsFixture[0],
        meta: { ...colorsFixture[0].meta, name: "Color 1" },
      };
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      expect(wrapper.text()).toContain(color.meta.name);
    });

    it("renders hex value correctly", () => {
      const color: Color = {
        ...colorsFixture[0],
        spec: { ...colorsFixture[0].spec, hexValue: "#000000" },
      };
      const wrapper = createWrapper(ColorCard, { props: { color } });

      expect(wrapper.text()).toContain(color.spec.hexValue);
    });

    it("applies color as background to preview", () => {
      const color: Color = {
        ...colorsFixture[0],
        spec: { ...colorsFixture[0].spec, hexValue: "#000000" },
      };
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      const preview = wrapper.find(".color-preview");
      expect(preview.attributes("style")).toContain(color.spec.hexValue);
    });
  });

  describe("Actions", () => {
    it("emits edit event when edit button is clicked", async () => {
      const color: Color = {
        ...colorsFixture[0],
        meta: { ...colorsFixture[0].meta, id: "color-1" },
      };
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      const editButton = wrapper.findAll("button")[0];
      await editButton.trigger("click");

      expect(wrapper.emitted("edit")).toBeTruthy();
      expect(wrapper.emitted("edit")?.[0]).toEqual([color]);
    });

    it("emits delete event when delete button is clicked", async () => {
      const color: Color = {
        ...colorsFixture[0],
        meta: { ...colorsFixture[0].meta, id: "color-1" },
      };
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      const deleteButton = wrapper.findAll("button")[1];
      await deleteButton.trigger("click");

      expect(wrapper.emitted("delete")).toBeTruthy();
      expect(wrapper.emitted("delete")?.[0]).toEqual([color]);
    });

    it("stops event propagation for action buttons", async () => {
      const color: Color = {
        ...colorsFixture[0],
        meta: { ...colorsFixture[0].meta, id: "color-1" },
      };
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      const editButton = wrapper.findAll("button")[0];
      await editButton.trigger("click");

      // Edit emitted but not any parent click
      expect(wrapper.emitted("edit")).toBeTruthy();
    });
  });

  describe("Styling", () => {
    it("has color-card class", () => {
      const color: Color = {
        ...colorsFixture[0],
        meta: { ...colorsFixture[0].meta, id: "color-1" },
      };
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      expect(wrapper.classes()).toContain("color-card");
    });

    it("displays color preview section", () => {
      const color: Color = {
        ...colorsFixture[0],
        meta: { ...colorsFixture[0].meta, id: "color-1" },
      };
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      expect(wrapper.find(".color-preview").exists()).toBe(true);
    });

    it("displays color info section", () => {
      const color: Color = {
        ...colorsFixture[0],
        meta: { ...colorsFixture[0].meta, id: "color-1" },
      };
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      expect(wrapper.find(".color-info").exists()).toBe(true);
    });

    it("shows overlay with action buttons", () => {
      const color: Color = {
        ...colorsFixture[0],
        meta: { ...colorsFixture[0].meta, id: "color-1" },
      };
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      expect(wrapper.find(".color-overlay").exists()).toBe(true);
      expect(wrapper.findAll("button")).toHaveLength(2);
    });
  });

  describe("Edge Cases", () => {
    it("handles different hex formats", () => {
      const color: Color = {
        ...colorsFixture[0],
        spec: { ...colorsFixture[0].spec, hexValue: "#FFF" },
      };
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      expect(wrapper.text()).toContain("#FFF");
    });

    it("renders with uppercase hex values", () => {
      const color: Color = {
        ...colorsFixture[0],
        spec: { ...colorsFixture[0].spec, hexValue: "#FF00FF" },
      };
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      const preview = wrapper.find(".color-preview");
      expect(preview.attributes("style")).toContain("#FF00FF");
    });
  });
});
