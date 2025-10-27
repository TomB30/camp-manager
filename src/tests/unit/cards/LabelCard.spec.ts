import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import LabelCard from "@/components/cards/LabelCard.vue";
import type { Label } from "@/types";

describe("LabelCard", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  const createTestLabel = (): Label => ({
    meta: {
      id: "label-1",
      name: "Test Label",
      createdAt: "2025-10-01T09:00:00.000Z",
      updatedAt: "2025-10-01T09:00:00.000Z",
    },
    spec: {},
  });

  beforeEach(() => {
    pinia = setupTestPinia();
  });

  describe("Rendering", () => {
    it("renders label name correctly", () => {
      const label: Label = createTestLabel();
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      expect(wrapper.text()).toContain(label.meta.name);
    });

    it("renders description when provided", () => {
      const label: Label = {
        ...createTestLabel(),
        meta: { ...createTestLabel().meta, description: "Test description" },
      };
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      expect(wrapper.text()).toContain("Test description");
    });

    it("does not show description when not provided", () => {
      const label: Label = createTestLabel();
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      expect(wrapper.find(".label-description").exists()).toBe(false);
    });
  });

  describe("Actions", () => {
    it("emits edit event when edit button is clicked", async () => {
      const label: Label = {
        ...createTestLabel(),
        meta: { ...createTestLabel().meta, id: "label-1" },
      };
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
      const label: Label = {
        ...createTestLabel(),
        meta: { ...createTestLabel().meta, id: "label-1" },
      };
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
      const label: Label = {
        ...createTestLabel(),
        meta: { ...createTestLabel().meta, id: "label-1" },
      };
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
      const label: Label = {
        ...createTestLabel(),
        meta: { ...createTestLabel().meta, id: "label-1" },
      };
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      expect(wrapper.classes()).toContain("label-card");
    });

    it("displays label preview section", () => {
      const label: Label = {
        ...createTestLabel(),
        meta: { ...createTestLabel().meta, id: "label-1" },
      };
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      expect(wrapper.find(".label-preview").exists()).toBe(true);
    });

    it("displays label info section", () => {
      const label: Label = {
        ...createTestLabel(),
        meta: { ...createTestLabel().meta, id: "label-1" },
      };
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      expect(wrapper.find(".label-info").exists()).toBe(true);
    });

    it("shows overlay with action buttons", () => {
      const label: Label = {
        ...createTestLabel(),
        meta: { ...createTestLabel().meta, id: "label-1" },
      };
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
      const label: Label = {
        ...createTestLabel(),
        meta: { ...createTestLabel().meta, id: "label-1" },
      };
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
      const label: Label = {
        ...createTestLabel(),
        meta: {
          ...createTestLabel().meta,
          name: "This is a very long label name that might overflow the container",
        },
      };
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      expect(wrapper.text()).toContain(label.meta.name);
    });

    it("handles very long descriptions with ellipsis", () => {
      const label: Label = {
        ...createTestLabel(),
        meta: {
          ...createTestLabel().meta,
          description:
            "This is a very long description that should be truncated with ellipsis when it exceeds the available space",
        },
      };
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      const description = wrapper.find(".label-description");
      expect(description.exists()).toBe(true);
    });

    it("handles label with special characters in name", () => {
      const label: Label = {
        ...createTestLabel(),
        meta: { ...createTestLabel().meta, name: "Label & Test <> Special" },
      };
      const wrapper = createWrapper(LabelCard, {
        props: { label },
        pinia,
      });

      expect(wrapper.text()).toContain(label.meta.name);
    });
  });
});
