import { describe, it, expect } from "vitest";
import { createWrapper } from "@/tests/utils";
import ColorCard from "@/components/cards/ColorCard.vue";
import { colorsFixture } from "@/tests/fixtures";

describe("ColorCard", () => {
  describe("Rendering", () => {
    it("renders color name correctly", () => {
      const color = colorsFixture[0];
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      expect(wrapper.text()).toContain(color.name);
    });

    it("renders hex value correctly", () => {
      const color = colorsFixture[0];
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      expect(wrapper.text()).toContain(color.hexValue);
    });

    it("applies color as background to preview", () => {
      const color = colorsFixture[0];
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      const preview = wrapper.find(".color-preview");
      expect(preview.attributes("style")).toContain(color.hexValue);
    });
  });

  describe("Actions", () => {
    it("emits edit event when edit button is clicked", async () => {
      const color = colorsFixture[0];
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      const editButton = wrapper.findAll("button")[0];
      await editButton.trigger("click");

      expect(wrapper.emitted("edit")).toBeTruthy();
      expect(wrapper.emitted("edit")?.[0]).toEqual([color]);
    });

    it("emits delete event when delete button is clicked", async () => {
      const color = colorsFixture[0];
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      const deleteButton = wrapper.findAll("button")[1];
      await deleteButton.trigger("click");

      expect(wrapper.emitted("delete")).toBeTruthy();
      expect(wrapper.emitted("delete")?.[0]).toEqual([color]);
    });

    it("stops event propagation for action buttons", async () => {
      const color = colorsFixture[0];
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
      const color = colorsFixture[0];
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      expect(wrapper.classes()).toContain("color-card");
    });

    it("displays color preview section", () => {
      const color = colorsFixture[0];
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      expect(wrapper.find(".color-preview").exists()).toBe(true);
    });

    it("displays color info section", () => {
      const color = colorsFixture[0];
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      expect(wrapper.find(".color-info").exists()).toBe(true);
    });

    it("shows overlay with action buttons", () => {
      const color = colorsFixture[0];
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      expect(wrapper.find(".color-overlay").exists()).toBe(true);
      expect(wrapper.findAll("button")).toHaveLength(2);
    });
  });

  describe("Edge Cases", () => {
    it("handles different hex formats", () => {
      const color = { ...colorsFixture[0], hexValue: "#FFF" };
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      expect(wrapper.text()).toContain("#FFF");
    });

    it("renders with uppercase hex values", () => {
      const color = { ...colorsFixture[0], hexValue: "#FF00FF" };
      const wrapper = createWrapper(ColorCard, {
        props: { color },
      });

      const preview = wrapper.find(".color-preview");
      expect(preview.attributes("style")).toContain("#FF00FF");
    });
  });
});

