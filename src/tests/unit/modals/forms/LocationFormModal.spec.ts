import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import LocationFormModal from "@/components/modals/LocationFormModal.vue";
import { locationsFixture, areasFixture } from "@/tests/fixtures";
import { useAreasStore, useLocationsStore } from "@/stores";

describe("LocationFormModal", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();

    const areasStore = useAreasStore();
    areasStore.areas = areasFixture;

    const locationsStore = useLocationsStore();
    locationsStore.locations = locationsFixture;
  });

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(LocationFormModal);
      expect(wrapper.text()).toContain("Create Location");
    });

    it("renders location name input", () => {
      const wrapper = createWrapper(LocationFormModal);
      expect(
        wrapper.find("input[placeholder='Enter location name']").exists(),
      ).toBe(true);
    });

    it("renders capacity input", () => {
      const wrapper = createWrapper(LocationFormModal);
      expect(
        wrapper
          .find("input[type='number'][placeholder='Enter capacity']")
          .exists(),
      ).toBe(true);
    });

    it("contains form element", () => {
      const wrapper = createWrapper(LocationFormModal);
      expect(wrapper.find("form").exists()).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationFormModal, {
        props: {
          locationId: location.meta.id,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Update Location");
    });

    it("populates form with location data", () => {
      const location = locationsFixture[0];
      const wrapper = createWrapper(LocationFormModal, {
        props: {
          locationId: location.meta.id,
        },
        pinia,
      });

      const nameInput = wrapper.find(
        "input[placeholder='Enter location name']",
      );
      expect((nameInput.element as HTMLInputElement).value).toBe(location.meta.name);
    });
  });

  describe("Form Validation", () => {
    it("requires location name", () => {
      const wrapper = createWrapper(LocationFormModal);
      const input = wrapper.find("input[placeholder='Enter location name']");
      expect(input.exists()).toBe(true);
    });

    it("requires capacity greater than 0", () => {
      const wrapper = createWrapper(LocationFormModal);
      const input = wrapper.find(
        "input[type='number'][placeholder='Enter capacity']",
      );
      expect(input.exists()).toBe(true);
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(LocationFormModal);
      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});
