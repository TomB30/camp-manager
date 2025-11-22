import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import GroupCard from "@/components/cards/GroupCard.vue";
import {
  groupsFixture,
  housingRoomsFixture,
  sessionsFixture,
} from "@/tests/fixtures";
import { useHousingRoomsStore, useSessionsStore } from "@/stores";
import { Group } from "@/generated/api";

describe("GroupCard", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();
  });

  describe("Basic Rendering", () => {
    it("renders group name correctly", () => {
      const group: Group = {
        ...groupsFixture[0],
        meta: { ...groupsFixture[0].meta, name: "Group 1" },
      };
      const wrapper = createWrapper(GroupCard, {
        props: { group },
      });

      expect(wrapper.text()).toContain(group.meta.name);
    });

    it("renders group description when provided", () => {
      const group: Group = {
        ...groupsFixture[0],
        meta: { ...groupsFixture[0].meta, description: "Group 1 description" },
      };
      const wrapper = createWrapper(GroupCard, {
        props: { group },
      });

      expect(wrapper.text()).toContain(group.meta.description!);
    });

    it("renders campers count badge", () => {
      const group: Group = {
        ...groupsFixture[0],
        spec: { ...groupsFixture[0].spec },
      };
      const wrapper = createWrapper(GroupCard, {
        props: { group, campersCount: 5 },
      });

      expect(wrapper.text()).toContain("5 campers");
    });

    it("renders singular camper when count is 1", () => {
      const group: Group = {
        ...groupsFixture[0],
        spec: { ...groupsFixture[0].spec },
      };
      const wrapper = createWrapper(GroupCard, {
        props: { group, campersCount: 1 },
      });

      expect(wrapper.text()).toContain("1 camper");
    });

    it("renders staff count badge", () => {
      const group: Group = {
        ...groupsFixture[0],
        spec: { ...groupsFixture[0].spec },
      };
      const wrapper = createWrapper(GroupCard, {
        props: { group, staffCount: 3 },
      });

      expect(wrapper.text()).toContain("3 staff");
    });
  });

  describe("Housing Display", () => {
    it("shows housing badge when group has housing room", () => {
      const housingStore = useHousingRoomsStore();
      housingStore.housingRooms = housingRoomsFixture;

      const group: Group = {
        ...groupsFixture[0],
        spec: {
          ...groupsFixture[0].spec,
          housingRoomId: housingRoomsFixture[0].meta.id,
        },
      }; // Has housing room
      const wrapper = createWrapper(GroupCard, {
        props: { group },
        pinia,
      });

      expect(wrapper.text()).toContain("Housing");
    });

    it("displays housing room name when housing is assigned", () => {
      const housingStore = useHousingRoomsStore();
      housingStore.housingRooms = housingRoomsFixture;

      const group: Group = {
        ...groupsFixture[0],
        spec: {
          ...groupsFixture[0].spec,
          housingRoomId: housingRoomsFixture[0].meta.id,
        },
      };
      const wrapper = createWrapper(GroupCard, {
        props: { group },
        pinia,
      });

      const roomName = housingRoomsFixture.find(
        (r) => r.meta.id === group.spec.housingRoomId,
      )?.meta.name;
      expect(wrapper.text()).toContain(roomName!);
    });

    it("does not show housing badge when no housing room", () => {
      const housingStore = useHousingRoomsStore();
      housingStore.housingRooms = housingRoomsFixture;

      const group: Group = {
        ...groupsFixture[0],
        spec: { ...groupsFixture[0].spec, housingRoomId: undefined },
      }; // No housing room
      const wrapper = createWrapper(GroupCard, {
        props: { group },
        pinia,
      });

      expect(wrapper.text()).not.toContain("Housing");
    });
  });

  describe("Session Display", () => {
    it("displays session name when session is assigned", () => {
      const sessionsStore = useSessionsStore();
      sessionsStore.sessions = sessionsFixture;

      const group: Group = {
        ...groupsFixture[0],
        spec: { ...groupsFixture[0].spec, sessionId: "session-1" },
      };
      const wrapper = createWrapper(GroupCard, {
        props: { group },
        pinia,
      });

      const sessionName = sessionsFixture.find(
        (s) => s.meta.id === group.spec.sessionId,
      )?.meta.name;
      expect(wrapper.text()).toContain(sessionName!);
    });
  });

  describe("Nested Groups", () => {
    it("shows nested group badge when group has child groups", () => {
      const group: Group = {
        ...groupsFixture[0],
        spec: { ...groupsFixture[0].spec, groupIds: ["child-1", "child-2"] },
      };
      const wrapper = createWrapper(GroupCard, {
        props: { group },
      });

      expect(wrapper.text()).toContain("Nested Group");
    });

    it("displays child group count", () => {
      const group: Group = {
        ...groupsFixture[0],
        spec: {
          ...groupsFixture[0].spec,
          groupIds: ["child-1", "child-2", "child-3"],
        },
      };
      const wrapper = createWrapper(GroupCard, {
        props: { group },
      });

      expect(wrapper.text()).toContain("3 child groups");
    });
  });

  describe("Click Event", () => {
    it("emits click event with group when card is clicked", async () => {
      const group: Group = {
        ...groupsFixture[0],
        spec: {
          ...groupsFixture[0].spec,
          groupIds: ["child-1", "child-2", "child-3"],
        },
      };
      const wrapper = createWrapper(GroupCard, {
        props: { group },
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("click")).toBeTruthy();
      expect(wrapper.emitted("click")?.[0]).toEqual([group]);
    });
  });

  describe("Styling", () => {
    it("has card-clickable class", () => {
      const group: Group = {
        ...groupsFixture[0],
        spec: {
          ...groupsFixture[0].spec,
          groupIds: ["child-1", "child-2", "child-3"],
        },
      };
      const wrapper = createWrapper(GroupCard, {
        props: { group },
        pinia,
      });

      expect(wrapper.classes()).toContain("clickable");
    });
  });
});
