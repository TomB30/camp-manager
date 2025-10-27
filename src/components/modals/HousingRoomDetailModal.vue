<template>
  <BaseModal
    :title="room?.meta.name || ''"
    modal-class="modal-lg"
    @close="$emit('close')"
  >
    <template #body>
      <div v-if="room">
        <div class="detail-section">
          <div class="detail-label">Beds</div>
          <div>
            <span class="badge badge-primary">{{ room.spec.beds }} beds</span>
          </div>
        </div>

        <div v-if="room.spec.areaId" class="detail-section">
          <div class="detail-label">Area</div>
          <div>{{ getAreaName(room.spec.areaId) }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Family Groups</div>
          <div v-if="groups.length > 0">
            <div class="groups-list">
              <div
                v-for="group in groups"
                :key="group.meta.id"
                class="group-assignment-item"
              >
                <div class="group-info">
                  <div class="font-medium">
                    {{ group.meta.name }}
                  </div>
                  <div class="text-xs text-grey-7 text-subtitle2">
                    {{ getGroupCamperCount(group.meta.id) }} campers
                    <span v-if="getGroupStaffCount(group.meta.id) > 0">
                      • {{ getGroupStaffCount(group.meta.id) }} staff
                    </span>
                  </div>
                  <div class="text-xs group-dates" v-if="group.spec.sessionId">
                    📅 {{ getSessionName(group.spec.sessionId) }} ({{
                      getSessionDateRange(group.spec.sessionId)
                    }})
                  </div>
                  <div
                    v-if="group.meta.description"
                    class="text-xs text-grey-7 text-subtitle2 mt-1"
                  >
                    {{ group.meta.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-grey-7">
            No family groups assigned to this room
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <BaseButton
        outline
        color="negative"
        @click="$emit('delete')"
        label="Delete"
      />
      <BaseButton outline color="grey-8" @click="$emit('edit')" label="Edit" />
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import type { Group, HousingRoom } from "@/types";
import { useAreasStore, useGroupsStore, useSessionsStore } from "@/stores";

export default defineComponent({
  name: "HousingRoomDetailModal",
  components: {
    BaseModal,
  },
  props: {
    room: {
      type: Object as PropType<HousingRoom | null>,
      default: null,
    },
    groups: {
      type: Array as PropType<Group[]>,
      default: () => [],
    },
  },
  emits: ["close", "edit", "delete", "view-group"],
  setup() {
    const areasStore = useAreasStore();
    const groupsStore = useGroupsStore();
    const sessionsStore = useSessionsStore();
    return { areasStore, groupsStore, sessionsStore };
  },
  methods: {
    getAreaName(areaId: string): string {
      const area = this.areasStore.getAreaById(areaId);
      return area?.meta.name || "Unknown";
    },
    getGroupCamperCount(groupId: string): number {
      return this.groupsStore.getCampersInGroup(groupId).length;
    },
    getGroupStaffCount(groupId: string): number {
      return this.groupsStore.getStaffInGroup(groupId).length;
    },
    getSessionName(sessionId: string): string {
      return (
        this.sessionsStore.sessions.find((s) => s.meta.id === sessionId)?.meta.name ||
        "Unknown Session"
      );
    },
    getSessionDateRange(sessionId: string): string {
      const session = this.sessionsStore.sessions.find(
        (s) => s.meta.id === sessionId,
      );
      if (!session) return "Unknown";
      return `${new Date(session.spec.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${new Date(session.spec.endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    },
  },
});
</script>

<style scoped>
.detail-section {
  margin-bottom: 1.5rem;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-assignment-item {
  padding: 0.75rem;
  background: var(--background);
  border-radius: var(--radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--border-color);
}

.group-info {
  flex: 1;
}

.group-dates {
  margin-top: 0.375rem;
  color: var(--text-primary);
  font-weight: 500;
}

.mt-1 {
  margin-top: 0.25rem;
}
</style>
