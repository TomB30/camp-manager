import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import ProgramFormModal from "@/components/modals/ProgramFormModal.vue";
import { programsFixture, colorsFixture } from "@/tests/fixtures";
import { useColorsStore, useProgramsStore } from "@/stores";

describe("ProgramFormModal", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();

    const colorsStore = useColorsStore();
    colorsStore.colors = colorsFixture;

    const programsStore = useProgramsStore();
    programsStore.programs = programsFixture;
  });

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(ProgramFormModal, {
        pinia,
      });

      expect(wrapper.text()).toContain("Create");
    });

    it("contains form element", () => {
      const wrapper = createWrapper(ProgramFormModal, {
        pinia,
      });

      expect(wrapper.find("form").exists()).toBe(true);
    });

    it("renders program name input", () => {
      const wrapper = createWrapper(ProgramFormModal, {
        pinia,
      });

      expect(wrapper.find("input").exists()).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const program = programsFixture[0];
      const wrapper = createWrapper(ProgramFormModal, {
        props: {
          programId: program.id,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Edit Program");
    });

    it("populates form with program data", () => {
      const program = programsFixture[0];
      const wrapper = createWrapper(ProgramFormModal, {
        props: {
          programId: program.id,
        },
        pinia,
      });

      const vm = wrapper.vm as any;
      expect(vm.localFormData.name).toBe(program.name);
      expect(vm.localFormData.description).toBe(program.description);
      expect(vm.localFormData.colorId).toBe(program.colorId);
      expect(vm.localFormData.activityIds).toEqual(program.activityIds);
      expect(vm.localFormData.staffMemberIds).toEqual(program.staffMemberIds);
      expect(vm.localFormData.locationIds).toEqual(program.locationIds);
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(ProgramFormModal, {
        pinia,
      });

      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});
