<template>
  <BaseModal
    :title="camper ? `${camper.spec.firstName} ${camper.spec.lastName}` : ''"
    @close="$emit('close')"
  >
    <template #body>
      <div v-if="camper">
        <div class="detail-section">
          <div class="detail-label">Age</div>
          <div>{{ camper.spec.age }} years old</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Gender</div>
          <div>
            <span class="badge badge-primary">{{
              formatGender(camper.spec.gender)
            }}</span>
          </div>
        </div>

        <div v-if="camper.spec.registrationDate" class="detail-section">
          <div class="detail-label">Registration Date</div>
          <div>{{ formatDate(camper.spec.registrationDate) }}</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Session</div>
          <div v-if="camper.spec.sessionId">
            <span class="badge badge-primary">
              {{ getSessionName(camper.spec.sessionId) }}
            </span>
            <div class="text-xs text-caption mt-1">
              {{ getSessionDateRange(camper.spec.sessionId) }}
            </div>
          </div>
          <div v-else class="text-caption">Not registered for a session</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Family Group</div>
          <div
            v-if="camper.spec.familyGroupId && getGroupById(camper.spec.familyGroupId)"
          >
            <div class="family-group-info">
              <span class="badge">
                {{ getGroupById(camper.spec.familyGroupId)!.meta.name }}
              </span>
              <div
                v-if="getGroupById(camper.spec.familyGroupId)?.spec.housingRoomId"
                class="text-xs text-caption mt-1"
              >
                Room:
                {{
                  getSleepingRoomName(
                    getGroupById(camper.spec.familyGroupId)?.spec.housingRoomId || "",
                  )
                }}
              </div>
            </div>
          </div>
          <div v-else class="text-caption">Not assigned to a family group</div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Enrolled Events</div>
          <EventsByDate
            :events="getCamperEvents(camper.meta.id)"
            empty-message="No events enrolled"
          />
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
import EventsByDate from "@/components/EventsByDate.vue";
import type { Camper, Event, Group } from "@/types";
import { format } from "date-fns";
import {
  useSessionsStore,
  useEventsStore,
  useHousingRoomsStore,
  useColorsStore,
  useGroupsStore,
} from "@/stores";

export default defineComponent({
  name: "CamperDetailModal",
  components: {
    BaseModal,
    EventsByDate,
  },
  props: {
    camper: {
      type: Object as PropType<Camper | null>,
      default: null,
    },
  },
  emits: ["close", "edit", "delete"],
  computed: {
    sessionsStore() {
      return useSessionsStore();
    },
    eventsStore() {
      return useEventsStore();
    },
    housingRoomsStore() {
      return useHousingRoomsStore();
    },
    colorsStore() {
      return useColorsStore();
    },
    groupsStore() {
      return useGroupsStore();
    },
  },
  methods: {
    formatGender(gender: string): string {
      return gender.charAt(0).toUpperCase() + gender.slice(1);
    },
    formatDate(dateStr: string): string {
      return format(new Date(dateStr), "MMMM d, yyyy");
    },
    getSessionName(sessionId: string | undefined): string {
      if (!sessionId) return "No session";
      const session = this.sessionsStore.sessions.find(
        (s) => s.meta.id === sessionId,
      );
      return session?.meta.name || "Unknown Session";
    },
    getSessionDateRange(sessionId: string | undefined): string {
      if (!sessionId) return "";
      const session = this.sessionsStore.sessions.find(
        (s) => s.meta.id === sessionId,
      );
      if (!session) return "Unknown";
      const startDate = new Date(session.spec.startDate).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" },
      );
      const endDate = new Date(session.spec.endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${startDate} - ${endDate}`;
    },
    getGroupById(groupId: string): Group | null | undefined {
      return this.groupsStore.getGroupById(groupId);
    },
    getSleepingRoomName(housingRoomId: string): string {
      const room = this.housingRoomsStore.getHousingRoomById(housingRoomId);
      return room?.meta.name || "Unknown Room";
    },
    getCamperEvents(camperId: string): Event[] {
      return this.eventsStore.camperEvents(camperId);
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

.family-group-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
