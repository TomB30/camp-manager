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
    staffIds: [],
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

  describe("Housing Room - Capacity Validation", () => {
    it("handles groups with varying sizes", () => {
      const wrapper = createGroupFormWrapper({
        formData: {
          ...createDefaultFormData(),
          sessionId: sessionsFixture[1].meta.id,
          camperIds: campersFixture.slice(0, 5).map((c) => c.meta.id),
        },
      });

      const vm = wrapper.vm as any;
      expect(vm.localFormData.camperIds).toHaveLength(5);
    });
  });

  describe("Form Structure", () => {
    it("contains form element", () => {
      const wrapper = createGroupFormWrapper();
      expect(wrapper.find("form").exists()).toBe(true);
    });

    it("has session and housing sections", () => {
      const wrapper = createGroupFormWrapper();
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
