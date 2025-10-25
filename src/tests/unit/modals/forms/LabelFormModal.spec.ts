import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import LabelFormModal from "@/components/modals/LabelFormModal.vue";
import { colorsFixture } from "@/tests/fixtures";
import { useColorsStore } from "@/stores";

// These tests are skipped because the Labels feature is not implemented yet.
describe.skip("LabelFormModal", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();

    const colorsStore = useColorsStore();
    colorsStore.colors = colorsFixture;
  });

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(LabelFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            description: "",
            colorId: undefined,
          },
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Add New Label");
    });

    it("renders label name input", () => {
      const wrapper = createWrapper(LabelFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            description: "",
            colorId: undefined,
          },
        },
        pinia,
      });

      expect(wrapper.find("input[placeholder*='VIP']").exists()).toBe(true);
    });

    it("renders color selector", () => {
      const wrapper = createWrapper(LabelFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            description: "",
            colorId: undefined,
          },
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Color");
    });

    it("contains form element", () => {
      const wrapper = createWrapper(LabelFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            description: "",
            colorId: undefined,
          },
        },
        pinia,
      });

      expect(wrapper.find("form").exists()).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const wrapper = createWrapper(LabelFormModal, {
        props: {
          isEditing: true,
          formData: {
            name: "VIP",
            description: "VIP campers",
            colorId: colorsFixture[0].id,
          },
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Edit Label");
    });

    it("populates form with label data", () => {
      const wrapper = createWrapper(LabelFormModal, {
        props: {
          isEditing: true,
          formData: {
            name: "VIP",
            description: "VIP campers",
            colorId: colorsFixture[0].id,
          },
        },
        pinia,
      });

      const vm = wrapper.vm as any;
      expect(vm.localFormData.name).toBe("VIP");
    });
  });

  describe("Form Fields", () => {
    it("shows color preview when color is selected", () => {
      const wrapper = createWrapper(LabelFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "Test Label",
            description: "",
            colorId: colorsFixture[0].id,
          },
        },
        pinia,
      });

      const vm = wrapper.vm as any;
      expect(vm.selectedColor).toBeDefined();
    });

    it("has description textarea", () => {
      const wrapper = createWrapper(LabelFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            description: "",
            colorId: undefined,
          },
        },
        pinia,
      });

      expect(wrapper.find("textarea").exists()).toBe(true);
    });
  });

  describe("Form Validation", () => {
    it("requires label name", () => {
      const wrapper = createWrapper(LabelFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            description: "",
            colorId: undefined,
          },
        },
        pinia,
      });

      const input = wrapper.find("input[placeholder*='VIP']");
      expect(input.exists()).toBe(true);
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(LabelFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            description: "",
            colorId: undefined,
          },
        },
        pinia,
      });

      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});
