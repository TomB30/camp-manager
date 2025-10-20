<template>
  <BaseModal :show="show" :title="event?.title || ''" @close="$emit('close')">
    <template #body>
      <div v-if="event">
        <div class="mb-3">
          <div class="text-sm text-secondary mb-1">Time</div>
          <div>
            {{ formatTime(event.startDate) }} - {{ formatTime(event.endDate) }}
          </div>
        </div>

        <div class="mb-3">
          <div class="text-sm text-secondary mb-1">Location</div>
          <div>{{ getLocationName(event.locationId || "") }}</div>
        </div>

        <div class="mb-3">
          <div class="text-sm text-secondary mb-1">Capacity</div>
          <div>
            {{ enrolledCamperCount }}/{{ event.capacity || 0 }}
            <span
              v-if="enrolledCamperCount >= (event.capacity || 0)"
              class="badge badge-error ml-2"
            >
              Full
            </span>
          </div>
        </div>

        <div class="mb-3">
          <div class="text-sm text-secondary mb-1">Assigned Groups</div>
          <div
            v-if="event.groupIds && event.groupIds.length > 0"
            class="groups-list"
          >
            <div
              v-for="groupId in event.groupIds"
              :key="groupId"
              class="group-item"
            >
              <div class="group-info">
                <span
                  class="group-badge"
                  :style="{ background: getGroupColor(groupId) }"
                >
                  {{ getGroupName(groupId) }}
                </span>
                <span class="text-xs text-secondary">
                  {{ getGroupDetails(groupId) }}
                </span>
              </div>
              <button
                class="btn btn-sm btn-secondary"
                @click="removeGroup(groupId)"
              >
                Remove
              </button>
            </div>
          </div>
          <div v-else class="text-secondary">No groups assigned</div>
        </div>

        <div class="mb-3">
          <div class="text-sm text-secondary mb-1">Participants</div>
          <div class="participants-summary">
            <div class="participant-count">
              <span class="font-medium">{{ enrolledCamperCount }}</span> campers
              <span
                v-if="
                  event.excludeCamperIds && event.excludeCamperIds.length > 0
                "
                class="text-xs text-secondary ml-2"
              >
                ({{ event.excludeCamperIds.length }} excluded)
              </span>
            </div>
            <div class="participant-count">
              <span class="font-medium">{{ assignedStaffCount }}</span> staff
              <span
                v-if="event.excludeStaffIds && event.excludeStaffIds.length > 0"
                class="text-xs text-secondary ml-2"
              >
                ({{ event.excludeStaffIds.length }} excluded)
              </span>
            </div>
          </div>
        </div>

        <!-- Excluded Campers -->
        <div
          v-if="event.excludeCamperIds && event.excludeCamperIds.length > 0"
          class="mb-3"
        >
          <div class="text-sm text-secondary mb-1">Excluded Campers</div>
          <div class="exclusions-list">
            <div
              v-for="camperId in event.excludeCamperIds"
              :key="camperId"
              class="exclusion-item"
            >
              <span>{{ getCamperName(camperId) }}</span>
              <button
                class="btn btn-xs btn-secondary"
                @click="removeExclusion('camper', camperId)"
              >
                Include
              </button>
            </div>
          </div>
        </div>

        <!-- Excluded Staff -->
        <div
          v-if="event.excludeStaffIds && event.excludeStaffIds.length > 0"
          class="mb-3"
        >
          <div class="text-sm text-secondary mb-1">Excluded Staff</div>
          <div class="exclusions-list">
            <div
              v-for="staffId in event.excludeStaffIds"
              :key="staffId"
              class="exclusion-item"
            >
              <span>{{ getStaffName(staffId) }}</span>
              <button
                class="btn btn-xs btn-secondary"
                @click="removeExclusion('staff', staffId)"
              >
                Include
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="
            event.requiredCertificationIds &&
            event.requiredCertificationIds.length > 0
          "
          class="mb-3"
        >
          <div class="text-sm text-secondary mb-1">Required Certifications</div>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="certId in event.requiredCertificationIds"
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
      <button class="btn btn-error" @click="$emit('delete')">
        Delete Event
      </button>
      <button class="btn btn-secondary" @click="$emit('edit')">Edit</button>
      <button class="btn btn-secondary" @click="$emit('close')">Close</button>
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
import type { Event } from "@/types";

export default defineComponent({
  name: "EventDetailModal",
  components: {
    BaseModal,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
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
      return this.eventsStore.getEventCamperIds(this.event.id).length;
    },
    assignedStaffCount(): number {
      if (!this.event) return 0;
      return this.eventsStore.getEventStaffIds(this.event.id).length;
    },
  },
  methods: {
    getCertificationName(certId: string): string {
      const certification =
        this.certificationsStore.getCertificationById(certId);
      return certification?.name || "Unknown Certification";
    },
    formatTime(dateStr: string): string {
      return format(new Date(dateStr), "h:mm a");
    },
    getLocationName(locationId: string): string {
      const location = this.locationsStore.getLocationById(locationId);
      return location?.name || "Unknown Location";
    },
    getCamperName(camperId: string): string {
      const camper = this.campersStore.getCamperById(camperId);
      return camper ? `${camper.firstName} ${camper.lastName}` : "Unknown";
    },
    getStaffName(staffId: string): string {
      const staff = this.staffMembersStore.getStaffMemberById(staffId);
      return staff ? `${staff.firstName} ${staff.lastName}` : "Unknown";
    },
    getGroupName(groupId: string): string {
      // Check groups
      const group = this.groupsStore.getGroupById(groupId);
      if (group) return group.name;

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
    getGroupColor(groupId: string): string {
      // Check groups
      const group = this.groupsStore.getGroupById(groupId);
      if (group && group.colorId) {
        const color = this.colorsStore.getColorById(group.colorId);
        return color?.hexValue || "#6366F1";
      }

      return "#6366F1";
    },
    async removeGroup(groupId: string) {
      if (!this.event) return;

      try {
        await this.eventsStore.removeGroupFromEvent(this.event.id, groupId);
        this.toast.success("Group removed from event");
      } catch (error: any) {
        this.toast.error("Failed to remove group", error.message);
      }
    },
    async removeExclusion(type: "camper" | "staff", id: string) {
      if (!this.event) return;

      try {
        if (type === "camper") {
          await this.eventsStore.removeExcludedCamper(this.event.id, id);
          this.toast.success("Camper is now included in the event");
        } else {
          await this.eventsStore.removeExcludedStaff(this.event.id, id);
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
  color: var(--text-secondary);
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--surface);
  border-radius: var(--radius);
}

.group-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.group-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  color: white;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
}

.participants-summary {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--background);
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
