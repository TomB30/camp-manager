import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import LocationFormModal from "@/components/modals/LocationFormModal.vue";
import { locationsFixture, areasFixture } from "@/tests/fixtures";
import { useAreasStore } from "@/stores";

describe("LocationFormModal", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  const emptyFormData = {
    name: "",
    type: "Indoor" as const,
    capacity: 0,
    areaId: undefined,
    equipment: [],
    notes: "",
  };

  beforeEach(() => {
    pinia = setupTestPinia();
    
    const areasStore = useAreasStore();
    areasStore.areas = areasFixture;
  });

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(LocationFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Add New Location");
    });

    it("renders location name input", () => {
      const wrapper = createWrapper(LocationFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
        },
        pinia,
      });

      expect(wrapper.find("input[placeholder='Enter location name']").exists()).toBe(true);
    });

    it("renders capacity input", () => {
      const wrapper = createWrapper(LocationFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
        },
        pinia,
      });

      expect(wrapper.find("input[type='number'][placeholder='Enter capacity']").exists()).toBe(true);
    });

    it("contains form element", () => {
      const wrapper = createWrapper(LocationFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
        },
        pinia,
      });

      expect(wrapper.find("form").exists()).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const location = locationsFixture[0];
      const editFormData = {
        name: location.name,
        type: location.type,
        capacity: location.capacity,
        areaId: location.areaId,
        equipment: location.equipment || [],
        notes: location.notes || "",
      };
      const wrapper = createWrapper(LocationFormModal, {
        props: {
          isEditing: true,
          formData: editFormData,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Edit Location");
    });

    it("populates form with location data", () => {
      const location = locationsFixture[0];
      const editFormData = {
        name: location.name,
        type: location.type,
        capacity: location.capacity,
        areaId: location.areaId,
        equipment: location.equipment || [],
        notes: location.notes || "",
      };
      const wrapper = createWrapper(LocationFormModal, {
        props: {
          isEditing: true,
          formData: editFormData,
        },
        pinia,
      });

      const nameInput = wrapper.find("input[placeholder='Enter location name']");
      expect((nameInput.element as HTMLInputElement).value).toBe(location.name);
    });
  });

  describe("Form Validation", () => {
    it("requires location name", () => {
      const wrapper = createWrapper(LocationFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
        },
        pinia,
      });

      const input = wrapper.find("input[placeholder='Enter location name']");
      expect(input.exists()).toBe(true);
    });

    it("requires capacity greater than 0", () => {
      const wrapper = createWrapper(LocationFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
        },
        pinia,
      });

      const input = wrapper.find("input[type='number'][placeholder='Enter capacity']");
      expect(input.exists()).toBe(true);
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(LocationFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
        },
        pinia,
      });

      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});

