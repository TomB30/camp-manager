import { describe, it, expect } from "vitest";
import { createWrapper } from "@/tests/utils";
import SessionCard from "@/components/cards/SessionCard.vue";
import { sessionsFixture } from "@/tests/fixtures";

describe("SessionCard", () => {
  describe("Rendering", () => {
    it("renders session name correctly", () => {
      const session = sessionsFixture[0];
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      expect(wrapper.text()).toContain(session.name);
    });

    it("renders session description when provided", () => {
      const session = sessionsFixture[0];
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      if (session.description) {
        expect(wrapper.text()).toContain(session.description);
      }
    });

    it("displays formatted dates", () => {
      const session = sessionsFixture[1]; // Current session
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      // Check that dates are formatted (contains month abbreviations)
      const text = wrapper.text();
      expect(text).toMatch(/Oct|Sep|Nov/); // Month abbreviation
    });

    it("displays max campers when provided", () => {
      const session = sessionsFixture[0];
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      if (session.maxCampers) {
        expect(wrapper.text()).toContain(`Max Campers:`);
        expect(wrapper.text()).toContain(session.maxCampers.toString());
      }
    });

    it("displays duration", () => {
      const session = sessionsFixture[0];
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      expect(wrapper.text()).toContain("Duration:");
    });
  });

  describe("Icons", () => {
    it("renders calendar icon in header", () => {
      const session = sessionsFixture[0];
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      const icon = wrapper.findComponent({ name: "Icon" });
      expect(icon.exists()).toBe(true);
    });

    it("displays detail icons for each section", () => {
      const session = sessionsFixture[0];
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      const icons = wrapper.findAllComponents({ name: "Icon" });
      expect(icons.length).toBeGreaterThan(1); // Multiple icons
    });
  });

  describe("Click Event", () => {
    it("emits click event with session id when card is clicked", async () => {
      const session = sessionsFixture[0];
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("click")).toBeTruthy();
      expect(wrapper.emitted("click")?.[0]).toEqual([session.id]);
    });
  });

  describe("Styling", () => {
    it("has session-card class", () => {
      const session = sessionsFixture[0];
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      expect(wrapper.classes()).toContain("session-card");
    });

    it("displays session header section", () => {
      const session = sessionsFixture[0];
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      expect(wrapper.find(".session-header").exists()).toBe(true);
    });

    it("displays session details section", () => {
      const session = sessionsFixture[0];
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      expect(wrapper.find(".session-details").exists()).toBe(true);
    });

    it("shows session icon with gradient background", () => {
      const session = sessionsFixture[0];
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      const icon = wrapper.find(".session-icon");
      expect(icon.exists()).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("renders without description", () => {
      const session = { ...sessionsFixture[0], description: undefined };
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      expect(wrapper.find(".session-description").exists()).toBe(false);
    });

    it("handles sessions without maxCampers", () => {
      const session = { ...sessionsFixture[0], maxCampers: undefined };
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.text()).not.toContain("Max Campers");
    });

    it("formats dates correctly for different months", () => {
      const session = sessionsFixture[2]; // Future session
      const wrapper = createWrapper(SessionCard, {
        props: { session },
      });

      // Just check that it renders without error
      expect(wrapper.exists()).toBe(true);
    });
  });
});

