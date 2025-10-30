<template>
  <BaseModal :title="event?.meta.name || ''" @close="$emit('close')">
    <template #body>
      <div v-if="event">
        <div class="mb-3">
          <div class="text-sm text-grey-7 text-subtitle2 mb-1">Time</div>
          <div>
            {{ formatTime(event.spec.startDate) }} -
            {{ formatTime(event.spec.endDate) }}
          </div>
        </div>

        <div class="mb-3">
          <div class="text-sm text-grey-7 text-subtitle2 mb-1">Location</div>
          <div>{{ getLocationName(event.spec.locationId || "") }}</div>
        </div>

        <div class="mb-3" v-if="event.spec.capacity !== undefined">
          <div class="text-sm text-grey-7 text-subtitle2 mb-1">Capacity</div>
          <div>
            {{ enrolledCamperCount }}/{{ event.spec.capacity || 0 }}
            <span
              v-if="enrolledCamperCount >= (event.spec.capacity || 0)"
              class="badge badge-error ml-2"
            >
              Full
            </span>
          </div>
        </div>

        <div class="mb-3">
          <div class="text-sm text-grey-7 text-subtitle2 mb-1">
            Assigned Groups
          </div>
          <div
            v-if="event.spec.groupIds && event.spec.groupIds.length > 0"
            class="groups-list"
          >
            <div
              v-for="groupId in event.spec.groupIds"
              :key="groupId"
              class="group-item"
            >
              <div class="flex row justify-between items-center">
                <div>
                  <div class="group-badge">
                    {{ getGroupName(groupId) }}
                  </div>
                </div>
                <div>
                  <span class="text-xs text-grey-7 text-subtitle2">
                    {{ getGroupDetails(groupId) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-grey-8">No groups assigned</div>
        </div>

        <div class="mb-3">
          <div class="text-sm text-grey-7 text-subtitle2 mb-1">
            Participants
          </div>
          <div class="participants-summary">
            <div class="participant-count">
              <span class="font-medium">{{ enrolledCamperCount }}</span> campers
              <span
                v-if="
                  event.spec.excludeCamperIds &&
                  event.spec.excludeCamperIds.length > 0
                "
                class="text-xs text-grey-7 text-subtitle2 ml-2"
              >
                ({{ event.spec.excludeCamperIds.length }} excluded)
              </span>
            </div>
            <div class="participant-count">
              <span class="font-medium">{{ assignedStaffCount }}</span> staff
              <span
                v-if="
                  event.spec.excludeStaffIds &&
                  event.spec.excludeStaffIds.length > 0
                "
                class="text-xs text-grey-7 text-subtitle2 ml-2"
              >
                ({{ event.spec.excludeStaffIds.length }} excluded)
              </span>
            </div>
          </div>
        </div>

        <!-- Excluded Campers -->
        <div
          v-if="
            event.spec.excludeCamperIds &&
            event.spec.excludeCamperIds.length > 0
          "
          class="mb-3"
        >
          <div class="text-sm text-grey-7 text-subtitle2 mb-1">
            Excluded Campers
          </div>
          <div class="exclusions-list">
            <div
              v-for="camperId in event.spec.excludeCamperIds"
              :key="camperId"
              class="exclusion-item"
            >
              <span>{{ getCamperName(camperId) }}</span>
            </div>
          </div>
        </div>

        <!-- Excluded Staff -->
        <div
          v-if="
            event.spec.excludeStaffIds && event.spec.excludeStaffIds.length > 0
          "
          class="mb-3"
        >
          <div class="text-sm text-grey-7 text-subtitle2 mb-1">
            Excluded Staff
          </div>
          <div class="exclusions-list">
            <div
              v-for="staffId in event.spec.excludeStaffIds"
              :key="staffId"
              class="exclusion-item"
            >
              <span>{{ getStaffName(staffId) }}</span>
            </div>
          </div>
        </div>

        <div
          v-if="
            event.spec.requiredCertificationIds &&
            event.spec.requiredCertificationIds.length > 0
          "
          class="mb-3"
        >
          <div class="text-sm text-grey-7 text-subtitle2 mb-1">
            Required Certifications
          </div>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="certId in event.spec.requiredCertificationIds"
              :key="certId"
              class="certification-badge"
            >
              {{ getCertificationName(certId) }}
            </span>
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
import { format } from "date-fns";
import BaseModal from "@/components/BaseModal.vue";
import {
  useEventsStore,
  useCampersStore,
  useStaffMembersStore,
  useGroupsStore,
  useLocationsStore,
  useColorsStore,
  useCertificationsStore,
} from "@/stores";
import { useToastStore } from "@/stores/toastStore";
import type { Event } from "@/generated/api";

export default defineComponent({
  name: "EventDetailModal",
  components: {
    BaseModal,
  },
  props: {
    event: {
      type: Object as PropType<Event | null>,
      default: null,
    },
  },
  emits: ["close", "edit", "delete"],
  computed: {
    eventsStore() {
      return useEventsStore();
    },
    campersStore() {
      return useCampersStore();
    },
    staffMembersStore() {
      return useStaffMembersStore();
    },
    groupsStore() {
      return useGroupsStore();
    },
    locationsStore() {
      return useLocationsStore();
    },
    colorsStore() {
      return useColorsStore();
    },
    certificationsStore() {
      return useCertificationsStore();
    },
    toast() {
      return useToastStore();
    },
    enrolledCamperCount(): number {
      if (!this.event) return 0;
      return this.eventsStore.getEventCamperIds(this.event.meta.id).length;
    },
    assignedStaffCount(): number {
      if (!this.event) return 0;
      return this.eventsStore.getEventStaffIds(this.event.meta.id).length;
    },
  },
  methods: {
    getCertificationName(certId: string): string {
      const certification =
        this.certificationsStore.getCertificationById(certId);
      return certification?.meta.name || "Unknown Certification";
    },
    formatTime(dateStr: string): string {
      return format(new Date(dateStr), "h:mm a");
    },
    getLocationName(locationId: string): string {
      const location = this.locationsStore.getLocationById(locationId);
      return location?.meta.name || "Unknown Location";
    },
    getCamperName(camperId: string): string {
      const camper = this.campersStore.getCamperById(camperId);
      return camper ? camper.meta.name : "Unknown";
    },
    getStaffName(staffId: string): string {
      const staff = this.staffMembersStore.getStaffMemberById(staffId);
      return staff ? staff.meta.name : "Unknown";
    },
    getGroupName(groupId: string): string {
      // Check groups
      const group = this.groupsStore.getGroupById(groupId);
      if (group) return group.meta.name;

      return "Unknown Group";
    },
    getGroupDetails(groupId: string): string {
      // Check groups
      const group = this.groupsStore.getGroupById(groupId);
      if (group) {
        const camperCount = this.groupsStore.getCampersInGroup(groupId).length;
        return `${camperCount} campers`;
      }

      return "";
    },
    async removeGroup(groupId: string) {
      if (!this.event) return;

      try {
        await this.eventsStore.removeGroupFromEvent(
          this.event.meta.id,
          groupId,
        );
        this.toast.success("Group removed from event");
      } catch (error: any) {
        this.toast.error("Failed to remove group", error.message);
      }
    },
    async removeExclusion(type: "camper" | "staff", id: string) {
      if (!this.event) return;

      try {
        if (type === "camper") {
          await this.eventsStore.removeExcludedCamper(this.event.meta.id, id);
          this.toast.success("Camper is now included in the event");
        } else {
          await this.eventsStore.removeExcludedStaff(this.event.meta.id, id);
          this.toast.success("Staff member is now included in the event");
        }
      } catch (error: any) {
        this.toast.error("Failed to remove exclusion", error.message);
      }
    },
  },
});
</script>

<style scoped>
.enrolled-campers {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 100px;
  padding: 1rem;
  background: var(--background);
  border-radius: var(--radius);
  border: 2px dashed transparent;
  transition: all 0.15s ease;
}

.enrolled-campers.drag-over {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.enrolled-camper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--surface);
  border-radius: var(--radius);
  cursor: move;
  transition: all 0.15s ease;
}

.enrolled-camper:hover {
  background: var(--primary-light);
}

.drop-zone {
  min-height: 100px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.bg-background {
  background: var(--background);
}

.certification-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--primary-light);
  color: var(--primary-color);
  border-radius: var(--radius);
  font-size: 0.75rem;
  font-weight: 500;
}

.staff-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.staff-cert-status {
  font-size: 0.75rem;
  color: var(--text-grey-7 text-subtitle2);
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-item {
  padding: 0.75rem;
  background: var(--surface-secondary);
  border-radius: var(--radius);
}

.group-info {
  display: flex;
  justify-content: space-between;
  gap: 0.25rem;
  align-items: center;
}

.group-badge {
  display: inline-block;
  color: var(--text-primary);
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
}

.participants-summary {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--surface-secondary);
  border-radius: var(--radius);
}

.participant-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.exclusions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.exclusion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: var(--background);
  border-radius: var(--radius);
  font-size: 0.875rem;
}
</style>
