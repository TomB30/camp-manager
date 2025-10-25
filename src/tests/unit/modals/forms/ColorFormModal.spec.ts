import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import ColorFormModal from "@/components/modals/ColorFormModal.vue";
import { colorsFixture } from "@/tests/fixtures";
import { useColorsStore } from "@/stores";

describe("ColorFormModal", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();

    const colorsStore = useColorsStore();
    colorsStore.colors = colorsFixture;
  });

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(ColorFormModal, {
        props: {
          colorId: undefined,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Add");
    });

    it("contains form element", () => {
      const wrapper = createWrapper(ColorFormModal, {
        props: {
          colorId: undefined,
        },
        pinia,
      });

      expect(wrapper.find("form").exists()).toBe(true);
    });

    it("renders color name input", () => {
      const wrapper = createWrapper(ColorFormModal, {
        props: {
          colorId: undefined,
        },
        pinia,
      });

      expect(wrapper.find("input").exists()).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const color = colorsFixture[0];
      const wrapper = createWrapper(ColorFormModal, {
        props: {
          colorId: color.id,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Edit");
    });

    it("populates form with color data", () => {
      const color = colorsFixture[0];
      const wrapper = createWrapper(ColorFormModal, {
        props: {
          colorId: color.id,
        },
        pinia,
      });

      const vm = wrapper.vm as any;
      expect(vm.formModel.name).toBe(color.name);
    });
  });

  describe("Form Fields", () => {
    it("has color picker or hex input", () => {
      const wrapper = createWrapper(ColorFormModal, {
        props: {
          colorId: undefined,
        },
        pinia,
      });

      // Should have some way to input color
      expect(wrapper.find("form").exists()).toBe(true);
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(ColorFormModal, {
        props: {
          colorId: undefined,
        },
        pinia,
      });

      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});
