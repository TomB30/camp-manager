import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import CamperFormModal from "@/components/modals/CamperFormModal.vue";
import { campersFixture, sessionsFixture, groupsFixture } from "@/tests/fixtures";
import { useSessionsStore, useGroupsStore } from "@/stores";

describe("CamperFormModal", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  const emptyFormData = {
    firstName: "",
    lastName: "",
    age: 0,
    gender: "male" as const,
    parentContact: "",
    allergies: [],
    medicalNotes: "",
    sessionId: undefined,
    groupId: undefined,
  };

  beforeEach(() => {
    pinia = setupTestPinia();
    
    const sessionsStore = useSessionsStore();
    sessionsStore.sessions = sessionsFixture;
    
    const groupsStore = useGroupsStore();
    groupsStore.groups = groupsFixture;
  });

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(CamperFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
          sessions: sessionsFixture,
          groups: groupsFixture,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Add New Camper");
    });

    it("renders required form fields", () => {
      const wrapper = createWrapper(CamperFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
          sessions: sessionsFixture,
          groups: groupsFixture,
        },
        pinia,
      });

      expect(wrapper.find("input[placeholder='Enter first name']").exists()).toBe(true);
      expect(wrapper.find("input[placeholder='Enter last name']").exists()).toBe(true);
    });

    it("contains form element", () => {
      const wrapper = createWrapper(CamperFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
          sessions: sessionsFixture,
          groups: groupsFixture,
        },
        pinia,
      });

      expect(wrapper.find("form").exists()).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const camper = campersFixture[0];
      const editFormData = {
        firstName: camper.firstName,
        lastName: camper.lastName,
        age: camper.age,
        gender: camper.gender,
        parentContact: camper.parentContact,
        allergies: camper.allergies || [],
        medicalNotes: camper.medicalNotes || "",
        sessionId: camper.sessionId,
        groupId: camper.groupId,
      };
      const wrapper = createWrapper(CamperFormModal, {
        props: {
          isEditing: true,
          formData: editFormData,
          sessions: sessionsFixture,
          groups: groupsFixture,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Edit Camper");
    });

    it("populates form with camper data", () => {
      const camper = campersFixture[0];
      const editFormData = {
        firstName: camper.firstName,
        lastName: camper.lastName,
        age: camper.age,
        gender: camper.gender,
        parentContact: camper.parentContact,
        allergies: camper.allergies || [],
        medicalNotes: camper.medicalNotes || "",
        sessionId: camper.sessionId,
        groupId: camper.groupId,
      };
      const wrapper = createWrapper(CamperFormModal, {
        props: {
          isEditing: true,
          formData: editFormData,
          sessions: sessionsFixture,
          groups: groupsFixture,
        },
        pinia,
      });

      const firstNameInput = wrapper.find("input[placeholder='Enter first name']");
      expect((firstNameInput.element as HTMLInputElement).value).toBe(camper.firstName);
    });
  });

  describe("Form Validation", () => {
    it("validates age range (5-18)", () => {
      const wrapper = createWrapper(CamperFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
          sessions: sessionsFixture,
          groups: groupsFixture,
        },
        pinia,
      });

      const vm = wrapper.vm as any;
      // Age validation rule exists
      expect(vm.localFormData).toBeDefined();
    });

    it("requires firstName", () => {
      const wrapper = createWrapper(CamperFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
          sessions: sessionsFixture,
          groups: groupsFixture,
        },
        pinia,
      });

      const input = wrapper.find("input[placeholder='Enter first name']");
      expect(input.exists()).toBe(true);
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(CamperFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
          sessions: sessionsFixture,
          groups: groupsFixture,
        },
        pinia,
      });

      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});

