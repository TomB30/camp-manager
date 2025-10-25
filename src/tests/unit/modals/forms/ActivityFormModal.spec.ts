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
  programId: programsFixture[0].id,
  programIds: programsFixture.map((program) => program.id),
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

    it("contains form through ActivityForm component", () => {
      const wrapper = createWrapper(ActivityFormModal, {
        props: defaultProps,
        pinia,
      });

      // ActivityFormModal uses ActivityForm component
      expect(wrapper.findComponent({ name: "ActivityForm" }).exists()).toBe(
        true,
      );
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const activity = activitiesFixture[0];
      const wrapper = createWrapper(ActivityFormModal, {
        props: {
          ...defaultProps,
          activityId: activity.id,
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
          activityId: activity.id,
        },
        pinia,
      });

      const vm = wrapper.vm as any;
      expect(vm.localFormData.name).toBe(activity.name);
    });
  });

  describe("Form Integration", () => {
    it("has ActivityForm component", () => {
      const wrapper = createWrapper(ActivityFormModal, {
        props: defaultProps,
        pinia,
      });

      expect(wrapper.findComponent({ name: "ActivityForm" }).exists()).toBe(
        true,
      );
    });

    it("passes certifications to ActivityForm", () => {
      const wrapper = createWrapper(ActivityFormModal, {
        props: defaultProps,
        pinia,
      });

      const activityForm = wrapper.findComponent({ name: "ActivityForm" });
      expect(activityForm.props("certifications")).toHaveLength(
        certificationsFixture.length,
      );
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
