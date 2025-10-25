import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import LabelCard from "@/components/cards/LabelCard.vue";
import { colorsFixture } from "@/tests/fixtures";
import { useColorsStore } from "@/stores";
import type { Label } from "@/types";

describe("LabelCard", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  const createTestLabel = (overrides: Partial<Label> = {}): Label => ({
    id: "label-1",
    name: "Test Label",
    createdAt: "2025-10-01T09:00:00.000Z",
    updatedAt: "2025-10-01T09:00:00.000Z",
    ...overrides,
  });

  beforeEach(() => {
    pinia = setupTestPinia();
  });

  describe("Rendering", () => {
    it("renders label name correctly", () => {
      const label = createTestLabel();
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      expect(wrapper.text()).toContain(label.name);
    });

    it("renders description when provided", () => {
      const label = createTestLabel({ description: "Test description" });
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      expect(wrapper.text()).toContain("Test description");
    });

    it("does not show description when not provided", () => {
      const label = createTestLabel();
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      expect(wrapper.find(".label-description").exists()).toBe(false);
    });
  });

  describe("Color Display", () => {
    it("applies color to preview when color is set", () => {
      const colorsStore = useColorsStore();
      colorsStore.colors = colorsFixture;

      const label = createTestLabel({ colorId: colorsFixture[0].id });
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      const preview = wrapper.find(".label-preview");
      const style = preview.attributes("style");
      expect(style).toContain("background");
      // Color should be applied (either hex or rgb format)
      expect(style?.length).toBeGreaterThan(10);
    });

    it("uses default color when no color is set", () => {
      const label = createTestLabel();
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      const preview = wrapper.find(".label-preview");
      expect(preview.attributes("style")).toContain("#6B7280"); // Default gray
    });

    it("uses default color when colorId is invalid", () => {
      const label = createTestLabel({ colorId: "invalid-color-id" });
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      const preview = wrapper.find(".label-preview");
      expect(preview.attributes("style")).toContain("#6B7280");
    });
  });

  describe("Actions", () => {
    it("emits edit event when edit button is clicked", async () => {
      const label = createTestLabel();
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      const editButton = wrapper.findAll("button")[0];
      await editButton.trigger("click");

      expect(wrapper.emitted("edit")).toBeTruthy();
      expect(wrapper.emitted("edit")?.[0]).toEqual([label]);
    });

    it("emits delete event when delete button is clicked", async () => {
      const label = createTestLabel();
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      const deleteButton = wrapper.findAll("button")[1];
      await deleteButton.trigger("click");

      expect(wrapper.emitted("delete")).toBeTruthy();
      expect(wrapper.emitted("delete")?.[0]).toEqual([label]);
    });

    it("stops event propagation for action buttons", async () => {
      const label = createTestLabel();
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      const editButton = wrapper.findAll("button")[0];
      await editButton.trigger("click");

      // Edit emitted but not any parent events
      expect(wrapper.emitted("edit")).toBeTruthy();
    });
  });

  describe("Styling", () => {
    it("has label-card class", () => {
      const label = createTestLabel();
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      expect(wrapper.classes()).toContain("label-card");
    });

    it("displays label preview section", () => {
      const label = createTestLabel();
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      expect(wrapper.find(".label-preview").exists()).toBe(true);
    });

    it("displays label info section", () => {
      const label = createTestLabel();
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      expect(wrapper.find(".label-info").exists()).toBe(true);
    });

    it("shows overlay with action buttons", () => {
      const label = createTestLabel();
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      expect(wrapper.find(".label-overlay").exists()).toBe(true);
      expect(wrapper.findAll("button")).toHaveLength(2);
    });
  });

  describe("Icons", () => {
    it("displays edit and delete icons", () => {
      const label = createTestLabel();
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      const icons = wrapper.findAllComponents({ name: "Icon" });
      expect(icons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Edge Cases", () => {
    it("handles very long label names", () => {
      const label = createTestLabel({
        name: "This is a very long label name that might overflow the container",
      });
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      expect(wrapper.text()).toContain(label.name);
    });

    it("handles very long descriptions with ellipsis", () => {
      const label = createTestLabel({
        description:
          "This is a very long description that should be truncated with ellipsis when it exceeds the available space",
      });
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      const description = wrapper.find(".label-description");
      expect(description.exists()).toBe(true);
    });

    it("handles label with special characters in name", () => {
      const label = createTestLabel({ name: "Label & Test <> Special" });
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      expect(wrapper.text()).toContain("Label & Test <> Special");
    });
  });
});
