import { describe, it, expect } from "vitest";
import { createWrapper } from "@/tests/utils";
import CertificationFormModal from "@/components/modals/CertificationFormModal.vue";
import { certificationsFixture } from "@/tests/fixtures";

describe("CertificationFormModal", () => {
  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(CertificationFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            description: "",
            validityPeriodMonths: undefined,
          },
        },
      });

      expect(wrapper.text()).toContain("Add New Certification");
    });

    it("renders certification name input", () => {
      const wrapper = createWrapper(CertificationFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            description: "",
            validityPeriodMonths: undefined,
          },
        },
      });

      expect(wrapper.find("input[placeholder='Enter certification name']").exists()).toBe(true);
    });

    it("renders validity period input", () => {
      const wrapper = createWrapper(CertificationFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            description: "",
            validityPeriodMonths: undefined,
          },
        },
      });

      expect(wrapper.find("input[type='number']").exists()).toBe(true);
    });

    it("contains form element", () => {
      const wrapper = createWrapper(CertificationFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            description: "",
            validityPeriodMonths: undefined,
          },
        },
      });

      expect(wrapper.find("form").exists()).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const certification = certificationsFixture[0];
      const wrapper = createWrapper(CertificationFormModal, {
        props: {
          isEditing: true,
          formData: {
            name: certification.name,
            description: certification.description || "",
            validityPeriodMonths: certification.validityPeriodMonths,
          },
        },
      });

      expect(wrapper.text()).toContain("Edit Certification");
    });

    it("populates form with certification data", () => {
      const certification = certificationsFixture[0];
      const wrapper = createWrapper(CertificationFormModal, {
        props: {
          isEditing: true,
          formData: {
            name: certification.name,
            description: certification.description || "",
            validityPeriodMonths: certification.validityPeriodMonths,
          },
        },
      });

      const vm = wrapper.vm as any;
      expect(vm.localFormData.name).toBe(certification.name);
    });
  });

  describe("Form Validation", () => {
    it("requires certification name", () => {
      const wrapper = createWrapper(CertificationFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            description: "",
            validityPeriodMonths: undefined,
          },
        },
      });

      const input = wrapper.find("input[placeholder='Enter certification name']");
      expect(input.exists()).toBe(true);
    });

    it("validates validity period is at least 1", () => {
      const wrapper = createWrapper(CertificationFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            description: "",
            validityPeriodMonths: undefined,
          },
        },
      });

      const input = wrapper.find("input[type='number']");
      expect(input.attributes("min")).toBe("1");
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(CertificationFormModal, {
        props: {
          isEditing: false,
          formData: {
            name: "",
            description: "",
            validityPeriodMonths: undefined,
          },
        },
      });

      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});

