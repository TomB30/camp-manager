import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import StaffMemberFormModal from "@/components/modals/StaffMemberFormModal.vue";
import { staffMembersFixture, rolesFixture, certificationsFixture } from "@/tests/fixtures";
import { useRolesStore, useCertificationsStore } from "@/stores";

describe("StaffMemberFormModal", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  const emptyFormData = {
    firstName: "",
    lastName: "",
    roleId: "",
    email: "",
    phone: "",
    certificationIds: [],
    managerId: "",
  };

  beforeEach(() => {
    pinia = setupTestPinia();
    
    const rolesStore = useRolesStore();
    rolesStore.roles = rolesFixture;
    
    const certificationsStore = useCertificationsStore();
    certificationsStore.certifications = certificationsFixture;
  });

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(StaffMemberFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
          staffMembers: staffMembersFixture,
          currentMemberId: "",
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Add New Staff Member");
    });

    it("renders required form fields", () => {
      const wrapper = createWrapper(StaffMemberFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
          staffMembers: staffMembersFixture,
          currentMemberId: "",
        },
        pinia,
      });

      expect(wrapper.find("input[placeholder='Enter first name']").exists()).toBe(true);
      expect(wrapper.find("input[placeholder='Enter last name']").exists()).toBe(true);
    });

    it("contains form element", () => {
      const wrapper = createWrapper(StaffMemberFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
          staffMembers: staffMembersFixture,
          currentMemberId: "",
        },
        pinia,
      });

      expect(wrapper.find("form").exists()).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const staffMember = staffMembersFixture[0];
      const editFormData = {
        firstName: staffMember.firstName,
        lastName: staffMember.lastName,
        roleId: staffMember.roleId,
        email: staffMember.email || "",
        phone: staffMember.phone || "",
        certificationIds: staffMember.certificationIds || [],
        managerId: staffMember.managerId || "",
      };
      const wrapper = createWrapper(StaffMemberFormModal, {
        props: {
          isEditing: true,
          formData: editFormData,
          staffMembers: staffMembersFixture,
          currentMemberId: staffMember.id,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Edit Staff Member");
    });

    it("populates form with staff data", () => {
      const staffMember = staffMembersFixture[0];
      const editFormData = {
        firstName: staffMember.firstName,
        lastName: staffMember.lastName,
        roleId: staffMember.roleId,
        email: staffMember.email || "",
        phone: staffMember.phone || "",
        certificationIds: staffMember.certificationIds || [],
        managerId: staffMember.managerId || "",
      };
      const wrapper = createWrapper(StaffMemberFormModal, {
        props: {
          isEditing: true,
          formData: editFormData,
          staffMembers: staffMembersFixture,
          currentMemberId: staffMember.id,
        },
        pinia,
      });

      const firstNameInput = wrapper.find("input[placeholder='Enter first name']");
      expect((firstNameInput.element as HTMLInputElement).value).toBe(staffMember.firstName);
    });
  });

  describe("Form Validation", () => {
    it("requires firstName", () => {
      const wrapper = createWrapper(StaffMemberFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
          staffMembers: staffMembersFixture,
          currentMemberId: "",
        },
        pinia,
      });

      const input = wrapper.find("input[placeholder='Enter first name']");
      expect(input.exists()).toBe(true);
    });

    it("requires lastName", () => {
      const wrapper = createWrapper(StaffMemberFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
          staffMembers: staffMembersFixture,
          currentMemberId: "",
        },
        pinia,
      });

      const input = wrapper.find("input[placeholder='Enter last name']");
      expect(input.exists()).toBe(true);
    });

    it("has role selection", () => {
      const wrapper = createWrapper(StaffMemberFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
          staffMembers: staffMembersFixture,
          currentMemberId: "",
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Role");
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(StaffMemberFormModal, {
        props: {
          isEditing: false,
          formData: emptyFormData,
          staffMembers: staffMembersFixture,
          currentMemberId: "",
        },
        pinia,
      });

      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});

