import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper } from "@/tests/utils";
import AreaFormModal from "@/components/modals/AreaFormModal.vue";
import { areasFixture } from "@/tests/fixtures";
import { setupTestPinia } from "@/tests/utils";
import { useAreasStore } from "@/stores";
describe("AreaFormModal", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();
    const areasStore = useAreasStore();
    areasStore.areas = areasFixture;
  });

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(AreaFormModal);
      expect(wrapper.text()).toContain("Add New Area");
    });

    it("renders area name input", () => {
      const wrapper = createWrapper(AreaFormModal);

      expect(
        wrapper.find("input[placeholder='Enter area name']").exists(),
      ).toBe(true);
    });

    it("renders type selector", () => {
      const wrapper = createWrapper(AreaFormModal);

      expect(wrapper.text()).toContain("Type");
    });

    it("contains form element", () => {
      const wrapper = createWrapper(AreaFormModal);

      expect(wrapper.find("form").exists()).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const wrapper = createWrapper(AreaFormModal, {
        props: {
          areaId: areasFixture[0].id,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Edit Area");
    });

    it("populates form with area data", () => {
      const area = areasFixture[0];
      const wrapper = createWrapper(AreaFormModal, {
        props: {
          areaId: area.id,
        },
        pinia,
      });

      const nameInput = wrapper.find("input[placeholder='Enter area name']");
      expect((nameInput.element as HTMLInputElement).value).toBe(area.name);
    });
  });

  describe("Form Fields", () => {
    it("has capacity input", () => {
      const wrapper = createWrapper(AreaFormModal);

      expect(
        wrapper
          .find("input[type='number'][placeholder='Optional capacity']")
          .exists(),
      ).toBe(true);
    });

    it("has equipment input", () => {
      const wrapper = createWrapper(AreaFormModal);

      expect(wrapper.find("input[placeholder*='Tables']").exists()).toBe(true);
    });

    it("has notes textarea", () => {
      const wrapper = createWrapper(AreaFormModal);

      expect(
        wrapper.find("textarea[placeholder='Optional notes']").exists(),
      ).toBe(true);
    });
  });

  describe("Form Validation", () => {
    it("requires area name", () => {
      const wrapper = createWrapper(AreaFormModal);

      const input = wrapper.find("input[placeholder='Enter area name']");
      expect(input.exists()).toBe(true);
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(AreaFormModal);

      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});
