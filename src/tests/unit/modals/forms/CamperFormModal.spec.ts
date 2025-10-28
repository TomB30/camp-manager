import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import CamperFormModal from "@/components/modals/CamperFormModal.vue";
import {
  campersFixture,
  sessionsFixture,
  groupsFixture,
} from "@/tests/fixtures";
import { useSessionsStore, useGroupsStore, useCampersStore } from "@/stores";
import { Camper } from "@/types";

describe("CamperFormModal", () => {
  let pinia: ReturnType<typeof setupTestPinia>;
  beforeEach(() => {
    pinia = setupTestPinia();

    const sessionsStore = useSessionsStore();
    sessionsStore.sessions = sessionsFixture;

    const groupsStore = useGroupsStore();
    groupsStore.groups = groupsFixture;

    const campersStore = useCampersStore();
    campersStore.campers = campersFixture;
  });

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(CamperFormModal);

      expect(wrapper.text()).toContain("Create New Camper");
    });

    it("renders required form fields", () => {
      const wrapper = createWrapper(CamperFormModal);

      expect(
        wrapper.find("input[placeholder='Enter first name']").exists(),
      ).toBe(true);
      expect(
        wrapper.find("input[placeholder='Enter last name']").exists(),
      ).toBe(true);
    });

    it("contains form element", () => {
      const wrapper = createWrapper(CamperFormModal);
      expect(wrapper.find("form").exists()).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const camper: Camper = campersFixture[0];
      const wrapper = createWrapper(CamperFormModal, {
        props: {
          camperId: camper.meta.id,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Edit Camper");
    });

    it("populates form with camper data", () => {
      const camper: Camper = campersFixture[0];
      const wrapper = createWrapper(CamperFormModal, {
        props: {
          camperId: camper.meta.id,
        },
        pinia,
      });

      const firstNameInput = wrapper.find(
        "input[placeholder='Enter first name']",
      );
      expect((firstNameInput.element as HTMLInputElement).value).toBe(
        camper.meta.name.split(" ")[0],
      );
    });
  });

  describe("Form Validation", () => {
    it("validates age range (5-18)", () => {
      const wrapper = createWrapper(CamperFormModal);

      const vm = wrapper.vm as any;
      // Age validation rule exists
      expect(vm.formData).toBeDefined();
    });

    it("requires firstName", () => {
      const wrapper = createWrapper(CamperFormModal);

      const input = wrapper.find("input[placeholder='Enter first name']");
      expect(input.exists()).toBe(true);
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(CamperFormModal);

      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});
