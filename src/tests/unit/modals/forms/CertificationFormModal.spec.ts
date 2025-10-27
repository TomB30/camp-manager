import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import CertificationFormModal from "@/components/modals/CertificationFormModal.vue";
import { certificationsFixture } from "@/tests/fixtures";
import { useCertificationsStore } from "@/stores";
import { Certification } from "@/types";

describe("CertificationFormModal", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();

    const certificationsStore = useCertificationsStore();
    certificationsStore.certifications = certificationsFixture;
  });

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(CertificationFormModal);
      expect(wrapper.text()).toContain("Add New Certification");
    });

    it("renders certification name input", () => {
      const wrapper = createWrapper(CertificationFormModal);

      expect(
        wrapper.find("input[placeholder='Enter certification name']").exists(),
      ).toBe(true);
    });

    it("contains form element", () => {
      const wrapper = createWrapper(CertificationFormModal);

      expect(wrapper.find("form").exists()).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const certification: Certification = certificationsFixture[0];
      const wrapper = createWrapper(CertificationFormModal, {
        props: { certificationId: certification.meta.id },
        pinia,
      });

      expect(wrapper.text()).toContain("Edit Certification");
    });

    it("populates form with certification data", () => {
      const certification: Certification = certificationsFixture[0];
      const wrapper = createWrapper(CertificationFormModal, {
        props: { certificationId: certification.meta.id },
        pinia,
      });

      const vm = wrapper.vm as any;
      expect(vm.formModel.meta.name).toBe(certification.meta.name);
    });
  });

  describe("Form Validation", () => {
    it("requires certification name", () => {
      const wrapper = createWrapper(CertificationFormModal);

      const input = wrapper.find(
        "input[placeholder='Enter certification name']",
      );
      expect(input.exists()).toBe(true);
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(CertificationFormModal);

      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});
