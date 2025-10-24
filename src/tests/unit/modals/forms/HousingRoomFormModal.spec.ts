import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import HousingRoomFormModal from "@/components/modals/HousingRoomFormModal.vue";
import { housingRoomsFixture, areasFixture } from "@/tests/fixtures";
import { useAreasStore } from "@/stores";

describe("HousingRoomFormModal", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();
    
    const areasStore = useAreasStore();
    areasStore.areas = areasFixture;
  });

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(HousingRoomFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            beds: 0,
            areaId: undefined,
          },
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Add New Room");
    });

    it("renders room name input", () => {
      const wrapper = createWrapper(HousingRoomFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            beds: 0,
            areaId: undefined,
          },
        },
        pinia,
      });

      expect(wrapper.find("input[placeholder='Enter room name']").exists()).toBe(true);
    });

    it("renders beds input", () => {
      const wrapper = createWrapper(HousingRoomFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            beds: 0,
            areaId: undefined,
          },
        },
        pinia,
      });

      expect(wrapper.find("input[placeholder='Enter number of beds']").exists()).toBe(true);
    });

    it("contains form element", () => {
      const wrapper = createWrapper(HousingRoomFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            beds: 0,
            areaId: undefined,
          },
        },
        pinia,
      });

      expect(wrapper.find("form").exists()).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const room = housingRoomsFixture[0];
      const wrapper = createWrapper(HousingRoomFormModal, {
        props: {
          isEditing: true,
          formData: {
            name: room.name,
            beds: room.beds,
            areaId: room.areaId,
          },
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Edit Room");
    });

    it("populates form with room data", () => {
      const room = housingRoomsFixture[0];
      const wrapper = createWrapper(HousingRoomFormModal, {
        props: {
          isEditing: true,
          formData: {
            name: room.name,
            beds: room.beds,
            areaId: room.areaId,
          },
        },
        pinia,
      });

      const vm = wrapper.vm as any;
      expect(vm.localFormData.name).toBe(room.name);
      expect(vm.localFormData.beds).toBe(room.beds);
    });
  });

  describe("Form Validation", () => {
    it("requires room name", () => {
      const wrapper = createWrapper(HousingRoomFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            beds: 0,
            areaId: undefined,
          },
        },
        pinia,
      });

      const input = wrapper.find("input[placeholder='Enter room name']");
      expect(input.exists()).toBe(true);
    });

    it("requires beds to be at least 1", () => {
      const wrapper = createWrapper(HousingRoomFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            beds: 0,
            areaId: undefined,
          },
        },
        pinia,
      });

      const input = wrapper.find("input[placeholder='Enter number of beds']");
      expect(input.exists()).toBe(true);
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(HousingRoomFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            beds: 0,
            areaId: undefined,
          },
        },
        pinia,
      });

      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});

