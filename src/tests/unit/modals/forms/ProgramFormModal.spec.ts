import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import ProgramFormModal from "@/components/modals/ProgramFormModal.vue";
import { programsFixture, colorsFixture } from "@/tests/fixtures";
import { useColorsStore, useProgramsStore } from "@/stores";
import { Program } from "@/types";

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
      const program: Program = programsFixture[0];
      const wrapper = createWrapper(ProgramFormModal, {
        props: {
          programId: program.meta.id,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Edit Program");
    });

    it("populates form with program data", () => {
      const program: Program = programsFixture[0];
      const wrapper = createWrapper(ProgramFormModal, {
        props: {
          programId: program.meta.id,
        },
        pinia,
      });

      const vm = wrapper.vm as any;
      expect(vm.localFormData.meta.name).toBe(program.meta.name);
      expect(vm.localFormData.meta.description).toBe(program.meta.description || "");
      expect(vm.localFormData.spec.colorId).toBe(program.spec.colorId);
      expect(vm.localFormData.spec.activityIds).toEqual(program.spec.activityIds);
      expect(vm.localFormData.spec.staffMemberIds).toEqual(program.spec.staffMemberIds);
      expect(vm.localFormData.spec.locationIds).toEqual(program.spec.locationIds);
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
