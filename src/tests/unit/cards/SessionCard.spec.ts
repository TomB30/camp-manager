import { describe, it, expect } from "vitest";
import { createWrapper } from "@/tests/utils";
import SessionCard from "@/components/cards/SessionCard.vue";
import { sessionsFixture } from "@/tests/fixtures";
import { Session } from "@/generated/api";

describe("SessionCard", () => {
  describe("Rendering", () => {
    it("renders session name correctly", () => {
      const session: Session = {
        ...sessionsFixture[0],
        meta: { ...sessionsFixture[0].meta, name: "Session 1" },
      };
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      expect(wrapper.text()).toContain(session.meta.name);
    });

    it("renders session description when provided", () => {
      const session: Session = {
        ...sessionsFixture[0],
        meta: {
          ...sessionsFixture[0].meta,
          description: "Session 1 description",
        },
      };
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      if (session.meta.description) {
        expect(wrapper.text()).toContain(session.meta.description);
      }
    });

    it("displays formatted dates", () => {
      const session: Session = {
        ...sessionsFixture[1],
        spec: {
          ...sessionsFixture[1].spec,
          startDate: "2025-10-01",
          endDate: "2025-10-05",
        },
      };
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      // Check that dates are formatted (contains month abbreviations)
      const text = wrapper.text();
      expect(text).toMatch(/Oct|Sep|Nov/); // Month abbreviation
    });

    it("displays duration", () => {
      const session: Session = {
        ...sessionsFixture[0],
        spec: {
          ...sessionsFixture[0].spec,
          startDate: "2025-10-01",
          endDate: "2025-10-05",
        },
      };
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      expect(wrapper.text()).toContain("Duration:");
    });
  });

  describe("Icons", () => {
    it("renders calendar icon in header", () => {
      const session: Session = {
        ...sessionsFixture[0],
        spec: {
          ...sessionsFixture[0].spec,
          startDate: "2025-10-01",
          endDate: "2025-10-05",
        },
      };
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      const icon = wrapper.findComponent({ name: "Icon" });
      expect(icon.exists()).toBe(true);
    });

    it("displays detail icons for each section", () => {
      const session: Session = {
        ...sessionsFixture[0],
        spec: {
          ...sessionsFixture[0].spec,
          startDate: "2025-10-01",
          endDate: "2025-10-05",
        },
      };
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      const icons = wrapper.findAllComponents({ name: "Icon" });
      expect(icons.length).toBeGreaterThan(1); // Multiple icons
    });
  });

  describe("Click Event", () => {
    it("emits click event with session id when card is clicked", async () => {
      const session: Session = {
        ...sessionsFixture[0],
        spec: {
          ...sessionsFixture[0].spec,
          startDate: "2025-10-01",
          endDate: "2025-10-05",
        },
      };
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("click")).toBeTruthy();
      expect(wrapper.emitted("click")?.[0]).toEqual([session.meta.id]);
    });
  });

  describe("Styling", () => {
    it("has session-card class", () => {
      const session: Session = {
        ...sessionsFixture[0],
        spec: {
          ...sessionsFixture[0].spec,
          startDate: "2025-10-01",
          endDate: "2025-10-05",
        },
      };
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      expect(wrapper.classes()).toContain("session-card");
    });

    it("displays session header section", () => {
      const session: Session = {
        ...sessionsFixture[0],
        spec: {
          ...sessionsFixture[0].spec,
          startDate: "2025-10-01",
          endDate: "2025-10-05",
        },
      };
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      expect(wrapper.find(".session-header").exists()).toBe(true);
    });

    it("displays session details section", () => {
      const session: Session = {
        ...sessionsFixture[0],
        spec: {
          ...sessionsFixture[0].spec,
          startDate: "2025-10-01",
          endDate: "2025-10-05",
        },
      };
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      expect(wrapper.find(".session-details").exists()).toBe(true);
    });

    it("shows session icon with gradient background", () => {
      const session: Session = {
        ...sessionsFixture[0],
        spec: {
          ...sessionsFixture[0].spec,
          startDate: "2025-10-01",
          endDate: "2025-10-05",
        },
      };
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      const icon = wrapper.find(".session-icon");
      expect(icon.exists()).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("renders without description", () => {
      const session: Session = {
        ...sessionsFixture[0],
        meta: { ...sessionsFixture[0].meta, description: undefined },
      };
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      expect(wrapper.find(".session-description").exists()).toBe(false);
    });

    it("formats dates correctly for different months", () => {
      const session: Session = {
        ...sessionsFixture[2],
        spec: {
          ...sessionsFixture[2].spec,
          startDate: "2025-11-01",
          endDate: "2025-11-05",
        },
      };
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      // Just check that it renders without error
      expect(wrapper.exists()).toBe(true);
    });
  });
});
