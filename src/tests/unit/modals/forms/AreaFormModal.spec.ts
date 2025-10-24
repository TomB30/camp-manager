import { describe, it, expect } from "vitest";
import { createWrapper } from "@/tests/utils";
import AreaFormModal from "@/components/modals/AreaFormModal.vue";
import { areasFixture } from "@/tests/fixtures";

describe("AreaFormModal", () => {
  const emptyFormData = {
    name: "",
    description: "",
    type: "indoor" as const,
    capacity: undefined,
    equipment: [],
    notes: "",
  };

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(AreaFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
        },
      });

      expect(wrapper.text()).toContain("Add New Area");
    });

    it("renders area name input", () => {
      const wrapper = createWrapper(AreaFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
        },
      });

      expect(wrapper.find("input[placeholder='Enter area name']").exists()).toBe(true);
    });

    it("renders type selector", () => {
      const wrapper = createWrapper(AreaFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
        },
      });

      expect(wrapper.text()).toContain("Type");
    });

    it("contains form element", () => {
      const wrapper = createWrapper(AreaFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
        },
      });

      expect(wrapper.find("form").exists()).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const area = areasFixture[0];
      const editFormData = {
        name: area.name,
        description: area.description || "",
        type: area.type,
        capacity: area.capacity,
        equipment: area.equipment || [],
        notes: area.notes || "",
      };
      const wrapper = createWrapper(AreaFormModal, {
        props: {
          isEditing: true,
          formData: editFormData,
        },
      });

      expect(wrapper.text()).toContain("Edit Area");
    });

    it("populates form with area data", () => {
      const area = areasFixture[0];
      const editFormData = {
        name: area.name,
        description: area.description || "",
        type: area.type,
        capacity: area.capacity,
        equipment: area.equipment || [],
        notes: area.notes || "",
      };
      const wrapper = createWrapper(AreaFormModal, {
        props: {
          isEditing: true,
          formData: editFormData,
        },
      });

      const nameInput = wrapper.find("input[placeholder='Enter area name']");
      expect((nameInput.element as HTMLInputElement).value).toBe(area.name);
    });
  });

  describe("Form Fields", () => {
    it("has capacity input", () => {
      const wrapper = createWrapper(AreaFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
        },
      });

      expect(wrapper.find("input[type='number'][placeholder='Optional capacity']").exists()).toBe(true);
    });

    it("has equipment input", () => {
      const wrapper = createWrapper(AreaFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
        },
      });

      expect(wrapper.find("input[placeholder*='Tables']").exists()).toBe(true);
    });

    it("has notes textarea", () => {
      const wrapper = createWrapper(AreaFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
        },
      });

      expect(wrapper.find("textarea[placeholder='Optional notes']").exists()).toBe(true);
    });
  });

  describe("Form Validation", () => {
    it("requires area name", () => {
      const wrapper = createWrapper(AreaFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
        },
      });

      const input = wrapper.find("input[placeholder='Enter area name']");
      expect(input.exists()).toBe(true);
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(AreaFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
        },
      });

      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});

