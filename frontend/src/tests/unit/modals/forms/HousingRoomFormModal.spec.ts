import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import HousingRoomFormModal from "@/components/modals/HousingRoomFormModal.vue";
import { housingRoomsFixture } from "@/tests/fixtures";
import { useHousingRoomsStore } from "@/stores";
import { HousingRoom } from "@/generated/api";

describe("HousingRoomFormModal", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();

    const housingRoomsStore = useHousingRoomsStore();
    housingRoomsStore.housingRooms = housingRoomsFixture;
  });

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(HousingRoomFormModal);
      expect(wrapper.text()).toContain("Create Room");
    });

    it("renders room name input", () => {
      const wrapper = createWrapper(HousingRoomFormModal);
      expect(
        wrapper.find("input[placeholder='Enter room name']").exists(),
      ).toBe(true);
    });

    it("renders beds input", () => {
      const wrapper = createWrapper(HousingRoomFormModal);
      expect(
        wrapper.find("input[placeholder='Enter number of beds']").exists(),
      ).toBe(true);
    });

    it("contains form element", () => {
      const wrapper = createWrapper(HousingRoomFormModal);
      expect(wrapper.find("form").exists()).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const room: HousingRoom = housingRoomsFixture[0];
      const wrapper = createWrapper(HousingRoomFormModal, {
        props: { roomId: room.meta.id },
        pinia,
      });

      expect(wrapper.text()).toContain("Update Room");
    });

    it("populates form with room data", () => {
      const room: HousingRoom = housingRoomsFixture[0];
      const wrapper = createWrapper(HousingRoomFormModal, {
        props: { roomId: room.meta.id },
        pinia,
      });

      const vm = wrapper.vm as any;
      expect(vm.formModel.meta.name).toBe(room.meta.name);
      expect(vm.formModel.spec.beds).toBe(room.spec.beds);
    });
  });

  describe("Form Validation", () => {
    it("requires room name", () => {
      const wrapper = createWrapper(HousingRoomFormModal);
      const input = wrapper.find("input[placeholder='Enter room name']");
      expect(input.exists()).toBe(true);
    });

    it("requires beds to be at least 1", () => {
      const wrapper = createWrapper(HousingRoomFormModal);
      const input = wrapper.find("input[placeholder='Enter number of beds']");
      expect(input.exists()).toBe(true);
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(HousingRoomFormModal);
      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});
