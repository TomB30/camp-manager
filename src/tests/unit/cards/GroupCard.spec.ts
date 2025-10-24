import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import GroupCard from "@/components/cards/GroupCard.vue";
import { groupsFixture, housingRoomsFixture, sessionsFixture } from "@/tests/fixtures";
import { useHousingRoomsStore, useSessionsStore, useColorsStore, useLabelsStore } from "@/stores";

describe("GroupCard", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();
  });

  describe("Basic Rendering", () => {
    it("renders group name correctly", () => {
      const group = groupsFixture[0];
      const wrapper = createWrapper(GroupCard, {
        props: { group },
      });

      expect(wrapper.text()).toContain(group.name);
    });

    it("renders group description when provided", () => {
      const group = groupsFixture[0];
      const wrapper = createWrapper(GroupCard, {
        props: { group },
      });

      expect(wrapper.text()).toContain(group.description!);
    });

    it("renders campers count badge", () => {
      const group = groupsFixture[0];
      const wrapper = createWrapper(GroupCard, {
        props: {
          group,
          campersCount: 5,
        },
      });

      expect(wrapper.text()).toContain("5 campers");
    });

    it("renders singular camper when count is 1", () => {
      const group = groupsFixture[0];
      const wrapper = createWrapper(GroupCard, {
        props: {
          group,
          campersCount: 1,
        },
      });

      expect(wrapper.text()).toContain("1 camper");
    });

    it("renders staff count badge", () => {
      const group = groupsFixture[0];
      const wrapper = createWrapper(GroupCard, {
        props: {
          group,
          staffCount: 3,
        },
      });

      expect(wrapper.text()).toContain("3 staff");
    });
  });

  describe("Housing Display", () => {
    it("shows housing badge when group has housing room", () => {
      const housingStore = useHousingRoomsStore();
      housingStore.housingRooms = housingRoomsFixture;
      
      const group = groupsFixture[0]; // Has housing room
      const wrapper = createWrapper(GroupCard, {
        props: { group },
        pinia,
      });

      expect(wrapper.text()).toContain("Housing");
    });

    it("displays housing room name when housing is assigned", () => {
      const housingStore = useHousingRoomsStore();
      housingStore.housingRooms = housingRoomsFixture;
      
      const group = groupsFixture[0];
      const wrapper = createWrapper(GroupCard, {
        props: { group },
        pinia,
      });

      const roomName = housingRoomsFixture.find(r => r.id === group.housingRoomId)?.name;
      expect(wrapper.text()).toContain(roomName!);
    });

    it("does not show housing badge when no housing room", () => {
      const housingStore = useHousingRoomsStore();
      housingStore.housingRooms = housingRoomsFixture;
      
      const group = groupsFixture[2]; // No housing room
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
      
      const group = groupsFixture[0];
      const wrapper = createWrapper(GroupCard, {
        props: { group },
        pinia,
      });

      const sessionName = sessionsFixture.find(s => s.id === group.sessionId)?.name;
      expect(wrapper.text()).toContain(sessionName!);
    });
  });

  describe("Nested Groups", () => {
    it("shows nested group badge when group has child groups", () => {
      const group = {
        ...groupsFixture[0],
        groupIds: ["child-1", "child-2"],
      };
      const wrapper = createWrapper(GroupCard, {
        props: { group },
      });

      expect(wrapper.text()).toContain("Nested Group");
    });

    it("displays child group count", () => {
      const group = {
        ...groupsFixture[0],
        groupIds: ["child-1", "child-2", "child-3"],
      };
      const wrapper = createWrapper(GroupCard, {
        props: { group },
      });

      expect(wrapper.text()).toContain("3 child groups");
    });
  });

  describe("Filters Display", () => {
    it("shows camper filters when present", () => {
      const group = {
        ...groupsFixture[0],
        camperFilters: {
          gender: "female",
          ageMin: 10,
          ageMax: 15,
        },
      };
      const wrapper = createWrapper(GroupCard, {
        props: { group },
      });

      expect(wrapper.text()).toContain("Camper Filters");
      expect(wrapper.text()).toContain("Female");
      expect(wrapper.text()).toContain("10-15 years");
    });

    it("shows staff filters when present", () => {
      const group = {
        ...groupsFixture[0],
        staffFilters: {
          roles: ["Counselor", "Lifeguard"],
        },
      };
      const wrapper = createWrapper(GroupCard, {
        props: { group },
      });

      expect(wrapper.text()).toContain("Staff Filters");
      expect(wrapper.text()).toContain("Counselor, Lifeguard");
    });

    it("shows auto-assigned indicator for filtered campers", () => {
      const group = {
        ...groupsFixture[0],
        camperFilters: {
          ageMin: 10,
        },
      };
      const wrapper = createWrapper(GroupCard, {
        props: { group },
      });

      expect(wrapper.text()).toContain("Auto-assigned campers");
    });
  });

  describe("Click Event", () => {
    it("emits click event with group when card is clicked", async () => {
      const group = groupsFixture[0];
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
      const group = groupsFixture[0];
      const wrapper = createWrapper(GroupCard, {
        props: { group },
        pinia,
      });

      expect(wrapper.classes()).toContain("card-clickable");
    });

    it("applies border color based on group color", () => {
      const group = groupsFixture[0];
      const wrapper = createWrapper(GroupCard, {
        props: { group },
        pinia,
      });

      const style = wrapper.attributes("style");
      // Check that a border color is applied (should be default #6366F1 or custom color)
      expect(style).toContain("border-left");
      expect(style).toContain("#");
    });
  });
});

