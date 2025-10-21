<template>
  <BaseModal :title="group?.name || 'Group Details'" @close="$emit('close')">
    <template #body>
      <div v-if="group" class="group-details">
        <!-- Description -->
        <div v-if="group.description" class="detail-section">
          <div class="detail-label">Description</div>
          <p class="detail-value">{{ group.description }}</p>
        </div>

        <!-- Group Type Badge -->
        <div class="detail-section">
          <div class="detail-label">Group Type</div>
          <div class="group-type-badges">
            <span v-if="isNestedGroup" class="badge badge-info">
              <Icon name="FolderOpen" :size="14" />
              Nested Group
            </span>
            <span v-if="isFilterBasedCampers" class="badge badge-primary">
              <Icon name="Filter" :size="14" />
              Auto-assigned Campers
            </span>
            <span v-if="isManualCampers" class="badge badge-primary">
              <Icon name="Users" :size="14" />
              Manual Campers
            </span>
            <span v-if="isFilterBasedStaff" class="badge badge-success">
              <Icon name="Filter" :size="14" />
              Auto-assigned Staff
            </span>
            <span v-if="isManualStaff" class="badge badge-success">
              <Icon name="UserCheck" :size="14" />
              Manual Staff
            </span>
            <span v-if="group.housingRoomId" class="badge badge-secondary">
              <Icon name="Bed" :size="14" />
              Has Housing
            </span>
          </div>
        </div>

        <!-- Session and Housing Room -->
        <div
          v-if="group.sessionId || group.housingRoomId"
          class="detail-section"
        >
          <div class="detail-label">Session & Housing</div>
          <div class="detail-grid">
            <div v-if="group.sessionId" class="detail-item">
              <Icon name="Calendar" :size="16" />
              <div>
                <div class="detail-item-label">Session</div>
                <div class="detail-item-value">{{ sessionName }}</div>
              </div>
            </div>
            <div v-if="group.housingRoomId" class="detail-item">
              <Icon name="Bed" :size="16" />
              <div>
                <div class="detail-item-label">Housing Room</div>
                <div class="detail-item-value">{{ housingRoomName }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Labels -->
        <div
          v-if="group.labelIds && group.labelIds.length > 0"
          class="detail-section"
        >
          <div class="detail-label">Labels</div>
          <div class="labels-list">
            <span
              v-for="labelId in group.labelIds"
              :key="labelId"
              class="label-badge"
              :style="{ background: getLabelColor(labelId) }"
            >
              {{ getLabelName(labelId) }}
            </span>
          </div>
        </div>

        <!-- Nested Groups -->
        <div v-if="isNestedGroup" class="detail-section">
          <div class="detail-label">
            Child Groups ({{ childGroups.length }})
          </div>
          <div class="nested-groups-list">
            <div
              v-for="childGroup in childGroups"
              :key="childGroup.id"
              class="nested-group-item"
            >
              <Icon name="FolderOpen" :size="16" />
              <span>{{ childGroup.name }}</span>
            </div>
          </div>
        </div>

        <!-- Camper Filter Criteria -->
        <div
          v-if="group.camperFilters && hasAnyCamperFilters"
          class="detail-section"
        >
          <div class="detail-label">Camper Filter Criteria</div>
          <div class="filter-tags">
            <span v-if="group.camperFilters.gender" class="filter-tag">
              <strong>Gender:</strong>
              {{ formatGender(group.camperFilters.gender) }}
            </span>
            <span
              v-if="
                group.camperFilters.ageMin !== undefined ||
                group.camperFilters.ageMax !== undefined
              "
              class="filter-tag"
            >
              <strong>Age:</strong>
              {{
                formatAgeRange(
                  group.camperFilters.ageMin,
                  group.camperFilters.ageMax,
                )
              }}
            </span>
            <span
              v-if="group.camperFilters.hasAllergies !== undefined"
              class="filter-tag"
            >
              <strong>Allergies:</strong>
              {{
                group.camperFilters.hasAllergies
                  ? "Has allergies"
                  : "No allergies"
              }}
            </span>
            <span
              v-if="
                group.camperFilters.familyGroupIds &&
                group.camperFilters.familyGroupIds.length > 0
              "
              class="filter-tag"
            >
              <strong>Family Groups:</strong>
              {{ group.camperFilters.familyGroupIds.length }} selected
            </span>
          </div>
        </div>

        <!-- Staff Filter Criteria -->
        <div
          v-if="group.staffFilters && hasAnyStaffFilters"
          class="detail-section"
        >
          <div class="detail-label">Staff Filter Criteria</div>
          <div class="filter-tags">
            <span
              v-if="
                group.staffFilters.roles && group.staffFilters.roles.length > 0
              "
              class="filter-tag"
            >
              <strong>Roles:</strong> {{ group.staffFilters.roles.join(", ") }}
            </span>
            <span
              v-if="
                group.staffFilters.certificationIds &&
                group.staffFilters.certificationIds.length > 0
              "
              class="filter-tag"
            >
              <strong>Certifications:</strong>
              {{ certificationNames.join(", ") }}
            </span>
          </div>
        </div>

        <!-- Campers List -->
        <div class="detail-section">
          <div class="detail-label">
            Campers ({{ campers.length }})
            <span v-if="isFilterBasedCampers" class="text-secondary text-sm">
              - auto-assigned</span
            >
          </div>
          <slot name="campers-list">
            <div v-if="campers.length > 0" class="members-list">
              <div
                v-for="camper in campers"
                :key="camper.id"
                class="member-item"
              >
                <div class="member-avatar">
                  {{ camper.firstName.charAt(0)
                  }}{{ camper.lastName.charAt(0) }}
                </div>
                <div class="member-info">
                  <div class="member-name">
                    {{ camper.firstName }} {{ camper.lastName }}
                  </div>
                  <div class="member-meta">
                    Age {{ camper.age }} • {{ formatGender(camper.gender) }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-secondary">No campers in this group.</div>
          </slot>
        </div>

        <!-- Staff List -->
        <div v-if="staff.length > 0" class="detail-section">
          <div class="detail-label">
            Staff Members ({{ staff.length }})
            <span v-if="isFilterBasedStaff" class="text-secondary text-sm">
              - auto-assigned</span
            >
          </div>
          <slot name="staff-list">
            <div class="members-list">
              <div v-for="member in staff" :key="member.id" class="member-item">
                <div class="member-avatar staff-avatar">
                  {{ member.firstName.charAt(0)
                  }}{{ member.lastName.charAt(0) }}
                </div>
                <div class="member-info">
                  <div class="member-name">
                    {{ member.firstName }} {{ member.lastName }}
                  </div>
                  <div class="member-meta">{{ member.roleId }}</div>
                </div>
              </div>
            </div>
          </slot>
        </div>

        <!-- Timestamps -->
        <div class="detail-section timestamps">
          <div class="timestamp-item">
            <span class="timestamp-label">Created:</span>
            <span class="timestamp-value">{{
              formatDate(group.createdAt)
            }}</span>
          </div>
          <div v-if="group.updatedAt" class="timestamp-item">
            <span class="timestamp-label">Updated:</span>
            <span class="timestamp-value">{{
              formatDate(group.updatedAt)
            }}</span>
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
import Icon from "@/components/Icon.vue";
import type { Group, Camper, StaffMember } from "@/types";
import {
  useLabelsStore,
  useColorsStore,
  useHousingRoomsStore,
  useSessionsStore,
  useCertificationsStore,
  useGroupsStore,
} from "@/stores";
import { format } from "date-fns";

export default defineComponent({
  name: "GroupDetailModal",
  components: {
    BaseModal,
    Icon,
  },
  props: {
    group: {
      type: Object as PropType<Group | null>,
      default: null,
    },
    campers: {
      type: Array as PropType<Camper[]>,
      default: () => [],
    },
    staff: {
      type: Array as PropType<StaffMember[]>,
      default: () => [],
    },
  },
  emits: ["close", "edit", "delete"],
  computed: {
    labelsStore() {
      return useLabelsStore();
    },
    colorsStore() {
      return useColorsStore();
    },
    housingRoomsStore() {
      return useHousingRoomsStore();
    },
    sessionsStore() {
      return useSessionsStore();
    },
    certificationsStore() {
      return useCertificationsStore();
    },
    groupsStore() {
      return useGroupsStore();
    },
    isNestedGroup(): boolean {
      return !!(this.group?.groupIds && this.group.groupIds.length > 0);
    },
    isFilterBasedCampers(): boolean {
      return !!(this.group?.camperFilters && !this.group?.camperIds);
    },
    isManualCampers(): boolean {
      return !!(this.group?.camperIds && this.group.camperIds.length > 0);
    },
    isFilterBasedStaff(): boolean {
      return !!(this.group?.staffFilters && !this.group?.staffIds);
    },
    isManualStaff(): boolean {
      return !!(this.group?.staffIds && this.group.staffIds.length > 0);
    },
    hasAnyCamperFilters(): boolean {
      const f = this.group?.camperFilters;
      return !!(
        f &&
        (f.ageMin !== undefined ||
          f.ageMax !== undefined ||
          f.gender ||
          f.hasAllergies !== undefined ||
          (f.familyGroupIds && f.familyGroupIds.length > 0))
      );
    },
    hasAnyStaffFilters(): boolean {
      const f = this.group?.staffFilters;
      return !!(
        f &&
        ((f.roles && f.roles.length > 0) ||
          (f.certificationIds && f.certificationIds.length > 0))
      );
    },
    childGroups(): Group[] {
      if (!this.group?.groupIds) return [];
      return this.group.groupIds
        .map((id) => this.groupsStore.getGroupById(id))
        .filter((g): g is Group => g !== undefined);
    },
    sessionName(): string {
      if (!this.group?.sessionId) return "";
      const session = this.sessionsStore.sessions.find(
        (s) => s.id === this.group!.sessionId,
      );
      return session?.name || "Unknown Session";
    },
    housingRoomName(): string {
      if (!this.group?.housingRoomId) return "";
      const room = this.housingRoomsStore.getHousingRoomById(
        this.group.housingRoomId,
      );
      return room?.name || "Unknown Room";
    },
    certificationNames(): string[] {
      if (!this.group?.staffFilters?.certificationIds) return [];
      return this.group.staffFilters.certificationIds.map((id) => {
        const cert = this.certificationsStore.getCertificationById(id);
        return cert?.name || "Unknown";
      });
    },
  },
  methods: {
    getLabelName(labelId: string): string {
      const label = this.labelsStore.getLabelById(labelId);
      return label ? label.name : "Unknown Label";
    },
    getLabelColor(labelId: string): string {
      const label = this.labelsStore.getLabelById(labelId);
      if (label?.colorId) {
        const color = this.colorsStore.getColorById(label.colorId);
        return color?.hexValue || "#6366F1";
      }
      return "#6366F1";
    },
    formatGender(gender: string): string {
      return gender.charAt(0).toUpperCase() + gender.slice(1);
    },
    formatAgeRange(min?: number, max?: number): string {
      if (min !== undefined && max !== undefined) {
        return `${min}-${max} years`;
      } else if (min !== undefined) {
        return `${min}+ years`;
      } else if (max !== undefined) {
        return `Up to ${max} years`;
      }
      return "Any age";
    },
    formatDate(dateStr?: string): string {
      if (!dateStr) return "N/A";
      return format(new Date(dateStr), "MMM d, yyyy h:mm a");
    },
  },
});
</script>

<style scoped>
.group-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  color: var(--text-primary);
  margin: 0;
}

.group-type-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--background-secondary);
  border-radius: var(--radius);
}

.detail-item-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.detail-item-value {
  font-weight: 500;
  color: var(--text-primary);
}

.labels-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.label-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  border-radius: 9999px;
  white-space: nowrap;
}

.nested-groups-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nested-group-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--background-secondary);
  border-radius: var(--radius);
  font-weight: 500;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-tag {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: var(--background-secondary);
  border-radius: var(--radius);
  font-size: 0.875rem;
}

.filter-tag strong {
  color: var(--text-secondary);
  font-weight: 500;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--background-secondary);
  border-radius: var(--radius);
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.staff-avatar {
  background: #10b981;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-weight: 500;
  color: var(--text-primary);
}

.member-meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
}

.timestamps {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 2rem;
  font-size: 0.875rem;
}

.timestamp-item {
  display: flex;
  gap: 0.5rem;
}

.timestamp-label {
  color: var(--text-secondary);
}

.timestamp-value {
  color: var(--text-primary);
}

.badge-info {
  background-color: #3b82f6;
  color: white;
}

.badge-secondary {
  background-color: #64748b;
  color: white;
}

.badge-success {
  background-color: #10b981;
  color: white;
}
</style>
