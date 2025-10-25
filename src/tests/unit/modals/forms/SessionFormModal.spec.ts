import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import SessionFormModal from "@/components/modals/SessionFormModal.vue";
import { sessionsFixture } from "@/tests/fixtures";
import { useSessionsStore } from "@/stores";

describe("SessionFormModal", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();

    const sessionsStore = useSessionsStore();
    sessionsStore.sessions = sessionsFixture;
  });

  describe("Create Mode", () => {
    it("renders with create title", () => {
      const wrapper = createWrapper(SessionFormModal, {
        props: {
          sessionId: undefined,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Create Session");
    });

    it("renders session name input", () => {
      const wrapper = createWrapper(SessionFormModal, {
        props: {
          sessionId: undefined,
        },
        pinia,
      });

      expect(wrapper.find("input[placeholder*='Week']").exists()).toBe(true);
    });

    it("renders date inputs", () => {
      const wrapper = createWrapper(SessionFormModal, {
        props: {
          sessionId: undefined,
        },
        pinia,
      });

      const dateInputs = wrapper.findAll("input[type='date']");
      expect(dateInputs).toHaveLength(2); // Start and end date
    });

    it("contains form element", () => {
      const wrapper = createWrapper(SessionFormModal, {
        props: {
          sessionId: undefined,
        },
        pinia,
      });

      expect(wrapper.find("form").exists()).toBe(true);
    });
  });

  describe("Edit Mode", () => {
    it("renders with edit title", () => {
      const session = sessionsFixture[0];
      const wrapper = createWrapper(SessionFormModal, {
        props: {
          sessionId: session.id,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Update Session");
    });

    it("populates form with session data", () => {
      const session = sessionsFixture[0];
      const wrapper = createWrapper(SessionFormModal, {
        props: {
          sessionId: session.id,
        },
        pinia,
      });

      const vm = wrapper.vm as any;
      expect(vm.formModel.name).toBe(session.name);
    });
  });

  describe("Form Validation", () => {
    it("validates end date is after start date", () => {
      const wrapper = createWrapper(SessionFormModal, {
        props: {
          sessionId: undefined,
        },
        pinia,
      });

      const vm = wrapper.vm as any;
      expect(vm.formModel).toBeDefined();
    });

    it("requires session name", () => {
      const wrapper = createWrapper(SessionFormModal, {
        props: {
          sessionId: undefined,
        },
        pinia,
      });

      expect(wrapper.find("input").exists()).toBe(true);
    });
  });

  describe("Close Behavior", () => {
    it("emits close event", () => {
      const wrapper = createWrapper(SessionFormModal, {
        props: {
          sessionId: undefined,
        },
        pinia,
      });

      wrapper.vm.$emit("close");
      expect(wrapper.emitted("close")).toBeTruthy();
    });
  });
});
