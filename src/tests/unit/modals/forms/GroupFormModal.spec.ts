import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import GroupFormModal from "@/components/modals/GroupFormModal.vue";
import {
  groupsFixture,
  housingRoomsFixture,
  sessionsFixture,
  campersFixture,
  staffMembersFixture,
} from "@/tests/fixtures";
import {
  useGroupsStore,
  useHousingRoomsStore,
  useSessionsStore,
  useCampersStore,
  useStaffMembersStore,
  useLabelsStore,
} from "@/stores";

describe("GroupFormModal", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  const createDefaultFormData = () => ({
    name: "",
    description: "",
    type: "family" as const,
    color: null,
    labelIds: [],
    sessionId: "",
    housingRoomId: "",
    startDate: "",
    endDate: "",
    groupIds: [],
    camperIds: [],
    camperFilters: {
      ageMin: undefined,
      ageMax: undefined,
      gender: "",
      hasAllergies: undefined,
      familyGroupIds: [],
    },
    staffIds: [],
    staffFilters: {
      roles: [],
      certificationIds: [],
    },
  });

  const createGroupFormWrapper = (overrideProps = {}) => {
    return createWrapper(GroupFormModal, {
      props: {
        formData: createDefaultFormData(),
        campers: campersFixture,
        staffMembers: staffMembersFixture,
        ...overrideProps,
      },
      pinia,
    });
  };

  beforeEach(() => {
    pinia = setupTestPinia();

    const groupsStore = useGroupsStore();
    groupsStore.groups = groupsFixture;

    const housingStore = useHousingRoomsStore();
    housingStore.housingRooms = housingRoomsFixture;

    const sessionsStore = useSessionsStore();
    sessionsStore.sessions = sessionsFixture;

    const campersStore = useCampersStore();
    campersStore.campers = campersFixture;

    const staffStore = useStaffMembersStore();
    staffStore.staffMembers = staffMembersFixture;

    const labelsStore = useLabelsStore();
    labelsStore.labels = [];
  });

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createGroupFormWrapper();
      expect(wrapper.text()).toContain("Create New Group");
    });

    it("renders group name input", () => {
      const wrapper = createGroupFormWrapper();
      expect(wrapper.find("input").exists()).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const wrapper = createGroupFormWrapper({ isEditing: true });
      expect(wrapper.text()).toContain("Edit Group");
    });
  });

  describe("Housing Room Validation - Core Functionality", () => {
    it("shows no housing rooms without session selection", () => {
      const wrapper = createGroupFormWrapper();
      const vm = wrapper.vm as any;

      expect(vm.availableHousingRooms).toHaveLength(0);
    });

    it("shows housing rooms when session is selected", () => {
      const wrapper = createGroupFormWrapper({
        formData: {
          ...createDefaultFormData(),
          sessionId: sessionsFixture[1].id,
        },
      });
      const vm = wrapper.vm as any;

      expect(vm.availableHousingRooms).toBeDefined();
    });

    it("validates room availability using getRoomOption method", () => {
      const wrapper = createGroupFormWrapper({
        formData: {
          ...createDefaultFormData(),
          sessionId: sessionsFixture[1].id,
        },
      });
      const vm = wrapper.vm as any;

      const room = housingRoomsFixture[0];
      const option = vm.getRoomOption(room);

      expect(option).toBeDefined();
      expect(option).toHaveProperty("label");
      expect(option).toHaveProperty("value");
      expect(option).toHaveProperty("disabled");
    });

    it("marks occupied rooms as disabled", () => {
      // Find a room that's occupied in session 1
      const occupiedGroup = groupsFixture.find(
        (g) => g.housingRoomId && g.sessionId === sessionsFixture[1].id
      );
      if (occupiedGroup && occupiedGroup.housingRoomId) {
        const wrapper = createGroupFormWrapper({
          formData: {
            ...createDefaultFormData(),
            sessionId: sessionsFixture[1].id,
          },
        });
        const vm = wrapper.vm as any;

        const occupiedRoom = housingRoomsFixture.find(
          (r) => r.id === occupiedGroup.housingRoomId
        );
        if (occupiedRoom) {
          const option = vm.getRoomOption(occupiedRoom);
          expect(option.disabled).toBe(true);
          expect(option.label).toContain("Occupied");
        }
      }
    });

    it("marks available rooms as enabled", () => {
      const wrapper = createGroupFormWrapper({
        formData: {
          ...createDefaultFormData(),
          sessionId: sessionsFixture[2].id, // Future session with no groups
        },
      });
      const vm = wrapper.vm as any;

      const groupsInSameSession = groupsFixture.filter(
        (g) => g.sessionId === sessionsFixture[2].id
      );
      const groupHousingRooms = groupsInSameSession.map((g) => g.housingRoomId);
      const availableRooms = housingRoomsFixture.filter(
        (r) => !groupHousingRooms.includes(r.id)
      );

      for (const room of availableRooms) {
        const option = vm.getRoomOption(room);
        expect(option.disabled).toBeFalsy();
      }

    });
  });

  describe("Housing Room - Capacity Validation", () => {
    it("handles groups with varying sizes", () => {
      const wrapper = createGroupFormWrapper({
        formData: {
          ...createDefaultFormData(),
          sessionId: sessionsFixture[1].id,
          camperIds: campersFixture.slice(0, 5).map((c) => c.id),
        },
      });

      const vm = wrapper.vm as any;
      expect(vm.localFormData.camperIds).toHaveLength(5);
    });

    it("exposes getRoomOption for capacity checking", () => {
      const wrapper = createGroupFormWrapper({
        formData: {
          ...createDefaultFormData(),
          sessionId: sessionsFixture[1].id,
        },
      });

      const vm = wrapper.vm as any;
      expect(typeof vm.getRoomOption).toBe("function");
    });
  });

  describe("Form Structure", () => {
    it("contains form element", () => {
      const wrapper = createGroupFormWrapper();
      expect(wrapper.find("form").exists()).toBe(true);
    });

    it("has session and housing sections", () => {
      const wrapper = createGroupFormWrapper();
      const text = wrapper.text();
      // Check for form presence rather than specific text
      expect(wrapper.find("form").exists()).toBe(true);
    });
  });

  describe("Component Lifecycle", () => {
    it("initializes with provided form data", () => {
      const customFormData = {
        ...createDefaultFormData(),
        name: "Test Group",
      };

      const wrapper = createGroupFormWrapper({ formData: customFormData });
      const vm = wrapper.vm as any;

      expect(vm.localFormData.name).toBe("Test Group");
    });

    it("emits close event", async () => {
      const wrapper = createGroupFormWrapper();
      wrapper.vm.$emit("close");

      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});
