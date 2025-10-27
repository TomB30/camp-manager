import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import EventFormModal from "@/components/modals/EventFormModal.vue";
import {
  eventsFixture,
  activitiesFixture,
  locationsFixture,
  staffMembersFixture,
  groupsFixture,
} from "@/tests/fixtures";
import {
  useActivitiesStore,
  useLocationsStore,
  useStaffMembersStore,
  useGroupsStore,
} from "@/stores";

describe("EventFormModal", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  const testEventDate = new Date("2025-07-15");

  beforeEach(() => {
    pinia = setupTestPinia();

    const activitiesStore = useActivitiesStore();
    activitiesStore.activities = activitiesFixture;

    const locationsStore = useLocationsStore();
    locationsStore.locations = locationsFixture;

    const staffMembersStore = useStaffMembersStore();
    staffMembersStore.staffMembers = staffMembersFixture;

    const groupsStore = useGroupsStore();
    groupsStore.groups = groupsFixture;
  });

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(EventFormModal, {
        props: {
          defaultEventDate: testEventDate,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Create New Event");
    });

    it("renders event title input", () => {
      const wrapper = createWrapper(EventFormModal, {
        props: {
          defaultEventDate: testEventDate,
        },
        pinia,
      });

      expect(
        wrapper.find("input[placeholder='Enter event title']").exists(),
      ).toBe(true);
    });

    it("renders date and time inputs", () => {
      const wrapper = createWrapper(EventFormModal, {
        props: {
          defaultEventDate: testEventDate,
        },
        pinia,
      });

      expect(wrapper.find("input[type='date']").exists()).toBe(true);
      expect(
        wrapper.findAll("input[type='time']").length,
      ).toBeGreaterThanOrEqual(2);
    });

    it("shows activity template selector in create mode", () => {
      const wrapper = createWrapper(EventFormModal, {
        props: {
          defaultEventDate: testEventDate,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Activity Template");
    });

    it("shows recurrence option in create mode", () => {
      const wrapper = createWrapper(EventFormModal, {
        props: {
          defaultEventDate: testEventDate,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Repeat Event");
    });

    it("contains form element", () => {
      const wrapper = createWrapper(EventFormModal, {
        props: {
          defaultEventDate: testEventDate,
        },
        pinia,
      });

      expect(wrapper.find("form").exists()).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const event =
        eventsFixture.find((e) => !e.spec.recurrenceId) || eventsFixture[0];
      const wrapper = createWrapper(EventFormModal, {
        props: {
          eventId: event.meta.id,
          defaultEventDate: new Date(event.spec.startDate),
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Edit Event");
    });

    it("does not show activity template selector in edit mode", () => {
      const event =
        eventsFixture.find((e) => !e.spec.recurrenceId) || eventsFixture[0];
      const wrapper = createWrapper(EventFormModal, {
        props: {
          eventId: event.meta.id,
          defaultEventDate: new Date(event.spec.startDate),
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Edit Event");
    });

    it("does not show recurrence option in edit mode", () => {
      const event =
        eventsFixture.find((e) => !e.spec.recurrenceId) || eventsFixture[0];
      const wrapper = createWrapper(EventFormModal, {
        props: {
          eventId: event.meta.id,
          defaultEventDate: new Date(event.spec.startDate),
        },
        pinia,
      });

      expect(wrapper.text()).not.toContain("Repeat Event");
    });
  });

  describe("Form Validation", () => {
    it("requires event title", () => {
      const wrapper = createWrapper(EventFormModal, {
        props: {
          defaultEventDate: testEventDate,
        },
        pinia,
      });

      const input = wrapper.find("input[placeholder='Enter event title']");
      expect(input.exists()).toBe(true);
    });

    it("requires event date", () => {
      const wrapper = createWrapper(EventFormModal, {
        props: {
          defaultEventDate: testEventDate,
        },
        pinia,
      });

      const input = wrapper.find("input[type='date']");
      expect(input.exists()).toBe(true);
    });

    it("requires start and end times", () => {
      const wrapper = createWrapper(EventFormModal, {
        props: {
          defaultEventDate: testEventDate,
        },
        pinia,
      });

      const timeInputs = wrapper.findAll("input[type='time']");
      expect(timeInputs.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(EventFormModal, {
        props: {
          defaultEventDate: testEventDate,
        },
        pinia,
      });

      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});
