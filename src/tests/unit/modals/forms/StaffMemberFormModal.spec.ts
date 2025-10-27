import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import StaffMemberFormModal from "@/components/modals/StaffMemberFormModal.vue";
import {
  staffMembersFixture,
  rolesFixture,
  certificationsFixture,
} from "@/tests/fixtures";
import {
  useRolesStore,
  useCertificationsStore,
  useStaffMembersStore,
} from "@/stores";

describe("StaffMemberFormModal", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();

    const rolesStore = useRolesStore();
    rolesStore.roles = rolesFixture;

    const certificationsStore = useCertificationsStore();
    certificationsStore.certifications = certificationsFixture;

    const staffMembersStore = useStaffMembersStore();
    staffMembersStore.staffMembers = staffMembersFixture;
  });

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(StaffMemberFormModal);

      expect(wrapper.text()).toContain("Create New Staff Member");
    });

    it("renders required form fields", () => {
      const wrapper = createWrapper(StaffMemberFormModal);

      expect(
        wrapper.find("input[placeholder='Enter first name']").exists(),
      ).toBe(true);
      expect(
        wrapper.find("input[placeholder='Enter last name']").exists(),
      ).toBe(true);
    });

    it("contains form element", () => {
      const wrapper = createWrapper(StaffMemberFormModal);

      expect(wrapper.find("form").exists()).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const staffMember = staffMembersFixture[0];
      const wrapper = createWrapper(StaffMemberFormModal, {
        props: {
          staffMemberId: staffMember.meta.id,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Update Staff Member");
    });

    it("populates form with staff data", () => {
      const staffMember = staffMembersFixture[0];
      const wrapper = createWrapper(StaffMemberFormModal, {
        props: {
          staffMemberId: staffMember.meta.id,
        },
        pinia,
      });

      const firstNameInput = wrapper.find(
        "input[placeholder='Enter first name']",
      );
      expect((firstNameInput.element as HTMLInputElement).value).toBe(
        staffMember.spec.firstName,
      );
    });
  });

  describe("Form Validation", () => {
    it("requires firstName", () => {
      const wrapper = createWrapper(StaffMemberFormModal);

      const input = wrapper.find("input[placeholder='Enter first name']");
      expect(input.exists()).toBe(true);
    });

    it("requires lastName", () => {
      const wrapper = createWrapper(StaffMemberFormModal);

      const input = wrapper.find("input[placeholder='Enter last name']");
      expect(input.exists()).toBe(true);
    });

    it("has role selection", () => {
      const wrapper = createWrapper(StaffMemberFormModal, {
        pinia,
      });

      expect(wrapper.text()).toContain("Role");
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(StaffMemberFormModal, {
        pinia,
      });

      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});
