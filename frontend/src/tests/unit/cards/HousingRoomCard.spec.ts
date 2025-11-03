import { describe, it, expect, beforeEach } from "vitest";
import { createWrapper, setupTestPinia } from "@/tests/utils";
import HousingRoomCard from "@/components/cards/HousingRoomCard.vue";
import {
  housingRoomsFixture,
  groupsFixture,
  areasFixture,
} from "@/tests/fixtures";
import { useAreasStore } from "@/stores";
import { HousingRoom } from "@/generated/api";

describe("HousingRoomCard", () => {
  let pinia: ReturnType<typeof setupTestPinia>;

  beforeEach(() => {
    pinia = setupTestPinia();
  });

  describe("Rendering", () => {
    it("renders room name correctly", () => {
      const room: HousingRoom = {
        ...housingRoomsFixture[0],
        meta: { ...housingRoomsFixture[0].meta, name: "Room 1" },
      };
      const wrapper = createWrapper(HousingRoomCard, {
        props: { room },
        pinia,
      });

      expect(wrapper.text()).toContain(room.meta.name);
    });

    it("displays number of beds", () => {
      const room: HousingRoom = {
        ...housingRoomsFixture[0],
        spec: { ...housingRoomsFixture[0].spec, beds: 5 },
      };
      const wrapper = createWrapper(HousingRoomCard, {
        props: { room },
        pinia,
      });

      expect(wrapper.text()).toContain(`${room.spec.beds} beds`);
    });

    it("shows location name when area is linked", () => {
      const areasStore = useAreasStore();
      areasStore.areas = areasFixture;

      const room: HousingRoom = {
        ...housingRoomsFixture[0],
        spec: { ...housingRoomsFixture[0].spec, areaId: "area-1" },
      };
      const wrapper = createWrapper(HousingRoomCard, {
        props: { room },
        pinia,
      });

      const areaName = areasFixture.find((a) => a.meta.id === room.spec.areaId)
        ?.meta.name;
      if (areaName) {
        expect(wrapper.text()).toContain(areaName);
      }
    });

    it("does not show location when no area is linked", () => {
      const room: HousingRoom = {
        ...housingRoomsFixture[0],
        spec: { ...housingRoomsFixture[0].spec, areaId: undefined },
      };
      const wrapper = createWrapper(HousingRoomCard, {
        props: { room },
        pinia,
      });

      expect(wrapper.find(".text-subtitle2").exists()).toBe(false);
    });
  });

  describe("Groups Display", () => {
    it("shows assigned groups when groups are provided", () => {
      const room: HousingRoom = {
        ...housingRoomsFixture[0],
        spec: { ...housingRoomsFixture[0].spec },
      };
      const groups = [groupsFixture[0], groupsFixture[1]].map((g) => ({
        ...g,
        meta: { ...g.meta, name: g.meta.name },
      }));
      const wrapper = createWrapper(HousingRoomCard, {
        props: {
          room,
          groups,
        },
        pinia,
      });

      expect(wrapper.text()).toContain("Family Groups:");
      expect(wrapper.text()).toContain(groups[0].meta.name);
      expect(wrapper.text()).toContain(groups[1].meta.name);
    });

    it("shows 'No groups assigned' when no groups", () => {
      const room: HousingRoom = {
        ...housingRoomsFixture[0],
        spec: { ...housingRoomsFixture[0].spec },
      };
      const wrapper = createWrapper(HousingRoomCard, {
        props: {
          room,
          groups: [],
        },
        pinia,
      });

      expect(wrapper.text()).toContain("No groups assigned");
    });

    it("displays all groups with correct styling", () => {
      const room: HousingRoom = {
        ...housingRoomsFixture[0],
        spec: { ...housingRoomsFixture[0].spec },
      };
      const groups = [groupsFixture[0], groupsFixture[1], groupsFixture[2]];
      const wrapper = createWrapper(HousingRoomCard, {
        props: {
          room,
          groups,
        },
        pinia,
      });

      const groupBadges = wrapper.findAll(".badge-success");
      expect(groupBadges).toHaveLength(3);
    });

    it("does not show family groups label when no groups", () => {
      const room: HousingRoom = {
        ...housingRoomsFixture[0],
        spec: { ...housingRoomsFixture[0].spec },
      };
      const wrapper = createWrapper(HousingRoomCard, {
        props: {
          room,
          groups: [],
        },
        pinia,
      });

      expect(wrapper.text()).not.toContain("Family Groups:");
    });
  });

  describe("Icon and Styling", () => {
    it("displays bed icon", () => {
      const room: HousingRoom = {
        ...housingRoomsFixture[0],
        spec: { ...housingRoomsFixture[0].spec },
      };
      const wrapper = createWrapper(HousingRoomCard, {
        props: { room },
        pinia,
      });

      const icon = wrapper.findComponent({ name: "Icon" });
      expect(icon.exists()).toBe(true);
    });

    it("has card-clickable class", () => {
      const room: HousingRoom = {
        ...housingRoomsFixture[0],
        spec: { ...housingRoomsFixture[0].spec },
      };
      const wrapper = createWrapper(HousingRoomCard, {
        props: { room },
        pinia,
      });

      expect(wrapper.classes()).toContain("card-clickable");
    });

    it("has card-horizontal class", () => {
      const room: HousingRoom = {
        ...housingRoomsFixture[0],
        spec: { ...housingRoomsFixture[0].spec },
      };
      const wrapper = createWrapper(HousingRoomCard, {
        props: { room },
        pinia,
      });

      expect(wrapper.classes()).toContain("card-horizontal");
    });
  });

  describe("Click Event", () => {
    it("emits click event with room when card is clicked", async () => {
      const room: HousingRoom = {
        ...housingRoomsFixture[0],
        spec: { ...housingRoomsFixture[0].spec },
      };
      const wrapper = createWrapper(HousingRoomCard, {
        props: { room },
        pinia,
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("click")).toBeTruthy();
      expect(wrapper.emitted("click")?.[0]).toEqual([room]);
    });
  });

  describe("Edge Cases", () => {
    it("handles room with many beds", () => {
      const room: HousingRoom = {
        ...housingRoomsFixture[0],
        spec: { ...housingRoomsFixture[0].spec, beds: 50 },
      };
      const wrapper = createWrapper(HousingRoomCard, {
        props: { room },
        pinia,
      });

      expect(wrapper.text()).toContain("50 beds");
    });

    it("handles room with single bed", () => {
      const room: HousingRoom = {
        ...housingRoomsFixture[0],
        spec: { ...housingRoomsFixture[0].spec, beds: 1 },
      };
      const wrapper = createWrapper(HousingRoomCard, {
        props: { room },
        pinia,
      });

      expect(wrapper.text()).toContain("1 beds");
    });

    it("handles room with many groups assigned", () => {
      const room: HousingRoom = {
        ...housingRoomsFixture[0],
        spec: { ...housingRoomsFixture[0].spec },
      };
      const manyGroups = Array.from({ length: 10 }, (_, i) => ({
        ...groupsFixture[0],
        meta: {
          ...groupsFixture[0].meta,
          id: `group-${i}`,
          name: `Group ${i + 1}`,
        },
      }));
      const wrapper = createWrapper(HousingRoomCard, {
        props: {
          room,
          groups: manyGroups,
        },
        pinia,
      });

      expect(wrapper.findAll(".badge-success")).toHaveLength(10);
    });
  });
});
