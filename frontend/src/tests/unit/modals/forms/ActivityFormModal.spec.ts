import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import ActivityFormModal from "@/components/modals/ActivityFormModal.vue";
import {
  activitiesFixture,
  programsFixture,
  locationsFixture,
  certificationsFixture,
} from "@/tests/fixtures";
import {
  useProgramsStore,
  useLocationsStore,
  useCertificationsStore,
  useActivitiesStore,
} from "@/stores";

const defaultProps = {
  activity: null,
  programId: programsFixture[0].meta.id,
};

describe("ActivityFormModal", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();

    const programsStore = useProgramsStore();
    programsStore.programs = programsFixture;

    const locationsStore = useLocationsStore();
    locationsStore.locations = locationsFixture;

    const certificationsStore = useCertificationsStore();
    certificationsStore.certifications = certificationsFixture;

    const activitiesStore = useActivitiesStore();
    activitiesStore.activities = activitiesFixture;
  });

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(ActivityFormModal, {
        props: defaultProps,
        pinia,
      });

      expect(wrapper.text()).toContain("Create New Activity");
    });

    it("contains form fields", () => {
      const wrapper = createWrapper(ActivityFormModal, {
        props: defaultProps,
        pinia,
      });

      // ActivityFormModal now contains the form directly
      expect(
        wrapper
          .find('input[placeholder="e.g., Wakeboarding, Pottery"]')
          .exists(),
      ).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const activity = activitiesFixture[0];
      const wrapper = createWrapper(ActivityFormModal, {
        props: {
          ...defaultProps,
          activityId: activity.meta.id,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Edit Activity");
    });

    it("populates form with activity data", async () => {
      const activity = activitiesFixture[0];
      const wrapper = createWrapper(ActivityFormModal, {
        props: {
          ...defaultProps,
          activityId: activity.meta.id,
        },
        pinia,
      });

      const vm = wrapper.vm as any;
      expect(vm.formData.meta.name).toBe(activity.meta.name);
    });
  });

  describe("Form Integration", () => {
    it("has form section element", () => {
      const wrapper = createWrapper(ActivityFormModal, {
        props: defaultProps,
        pinia,
      });

      expect(wrapper.find("section").exists()).toBe(true);
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(ActivityFormModal, {
        props: defaultProps,
        pinia,
      });

      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});
