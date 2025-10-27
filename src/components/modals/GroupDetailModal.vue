<template>
  <BaseModal :title="group?.meta.name || 'Group Details'" @close="$emit('close')">
    <template #body>
      <div v-if="group" class="group-details">
        <!-- Description -->
        <div v-if="group.meta.description" class="detail-section">
          <div class="detail-label">Description</div>
          <p class="detail-value">{{ group.meta.description }}</p>
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
            <span v-if="group.spec.housingRoomId" class="badge badge-secondary">
              <Icon name="Bed" :size="14" />
              Has Housing
            </span>
          </div>
        </div>

        <div
          v-if="group.spec.sessionId || group.spec.housingRoomId"
          class="detail-section"
        >
          <div class="detail-label">Session & Housing</div>
          <div class="detail-grid">
            <div v-if="group.spec.sessionId" class="detail-item">
              <Icon name="Calendar" :size="16" />
              <div>
                <div class="detail-item-label">Session</div>
                <div class="detail-item-value">{{ sessionName }}</div>
              </div>
            </div>
            <div v-if="group.spec.housingRoomId" class="detail-item">
              <Icon name="Bed" :size="16" />
              <div>
                <div class="detail-item-label">Housing</div>
                <div class="detail-item-value">{{ housingRoomName }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Labels -->
        <div
          v-if="group.spec.labelIds && group.spec.labelIds.length > 0"
          class="detail-section"
        >
          <div class="detail-label">Labels</div>
          <div class="labels-list">
            <span
              v-for="labelId in group.spec.labelIds"
              :key="labelId"
              class="label-badge"
            >
              {{ getLabelName(labelId) }}
            </span>
          </div>
        </div>

        <!-- Nested Groups -->
        <div v-if="isNestedGroup" class="detail-section">
          <div class="detail-label">
            Child Groups ({{ group.spec.groupIds?.length || 0 }})
          </div>
          <div class="nested-groups-list">
            <div
              v-for="childGroup in childGroups"
              :key="childGroup.meta.id"
              class="nested-group-item"
            >
              <Icon name="FolderOpen" :size="16" />
              <span>{{ childGroup.meta.name }}</span>
            </div>
          </div>
        </div>

        <!-- Camper Filter Criteria -->
        <div
          v-if="group.spec.camperFilters && hasAnyCamperFilters"
          class="detail-section"
        >
          <div class="detail-label">Camper Filter Criteria</div>
          <div class="filter-tags">
            <span v-if="group.spec.camperFilters.gender" class="filter-tag">
              <strong>Gender:</strong>
              {{ formatGender(group.spec.camperFilters.gender) }}
            </span>
            <span
              v-if="
                group.spec.camperFilters.ageMin !== undefined ||
                group.spec.camperFilters.ageMax !== undefined
              "
              class="filter-tag"
            >
              <strong>Age:</strong>
              {{
                formatAgeRange(
                  group.spec.camperFilters.ageMin,
                  group.spec.camperFilters.ageMax,
                )
              }}
            </span>
            <span
              v-if="group.spec.camperFilters.hasAllergies !== undefined"
              class="filter-tag"
            >
              <strong>Allergies:</strong>
              {{
                group.spec.camperFilters.hasAllergies
                  ? "Has allergies"
                  : "No allergies"
              }}
            </span>
            <span
              v-if="
                group.spec.camperFilters.familyGroupIds &&
                group.spec.camperFilters.familyGroupIds.length > 0
              "
              class="filter-tag"
            >
              <strong>Family Groups:</strong>
              {{ group.spec.camperFilters.familyGroupIds.length }} selected
            </span>
          </div>
        </div>

        <!-- Staff Filter Criteria -->
        <div
          v-if="group.spec.staffFilters && hasAnyStaffFilters"
          class="detail-section"
        >
          <div class="detail-label">Staff Filter Criteria</div>
          <div class="filter-tags">
            <span
              v-if="
                group.spec.staffFilters.roles && group.spec.staffFilters.roles.length > 0
              "
              class="filter-tag"
            >
              <strong>Roles:</strong> {{ group.spec.staffFilters.roles.join(", ") }}
            </span>
            <span
              v-if="
                group.spec.staffFilters.certificationIds &&
                group.spec.staffFilters.certificationIds.length > 0
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
                :key="camper.meta.id"
                class="member-item"
              >
                <div class="member-avatar">
                  {{ camper.spec.firstName.charAt(0)
                  }}{{ camper.spec.lastName.charAt(0) }}
                </div>
                <div class="member-info">
                  <div class="member-name">
                    {{ camper.spec.firstName }} {{ camper.spec.lastName }}
                  </div>
                  <div class="member-meta">
                    Age {{ camper.spec.age }} • {{ formatGender(camper.spec.gender) }}
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
              <div v-for="member in staff" :key="member.meta.id" class="member-item">
                <div class="member-avatar staff-avatar">
                  {{ member.spec.firstName.charAt(0)
                  }}{{ member.spec.lastName.charAt(0) }}
                </div>
                <div class="member-info">
                  <div class="member-name">
                    {{ member.spec.firstName }} {{ member.spec.lastName }}
                  </div>
                  <div class="member-meta">{{ getRoleName(member.spec.roleId) }}</div>
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
              formatDate(group.meta.createdAt)
            }}</span>
          </div>
          <div v-if="group.meta.updatedAt" class="timestamp-item">
            <span class="timestamp-label">Updated:</span>
            <span class="timestamp-value">{{
              formatDate(group.meta.updatedAt)
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
  useHousingRoomsStore,
  useSessionsStore,
  useCertificationsStore,
  useGroupsStore,
  useRolesStore,
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
    rolesStore() {
      return useRolesStore();
    },
    labelsStore() {
      return useLabelsStore();
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
      return !!(this.group?.spec.groupIds && this.group.spec.groupIds.length > 0);
    },
    isFilterBasedCampers(): boolean {
      return !!(this.group?.spec.camperFilters && !this.group?.spec.camperIds);
    },
    isManualCampers(): boolean {
      return !!(this.group?.spec.camperIds && this.group.spec.camperIds.length > 0);
    },
    isFilterBasedStaff(): boolean {
      return !!(this.group?.spec.staffFilters && !this.group?.spec.staffIds);
    },
    isManualStaff(): boolean {
      return !!(this.group?.spec.staffIds && this.group.spec.staffIds.length > 0);
    },
    hasAnyCamperFilters(): boolean {
      const f = this.group?.spec.camperFilters;
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
      const f = this.group?.spec.staffFilters;
      return !!(
        f &&
        ((f.roles && f.roles.length > 0) ||
          (f.certificationIds && f.certificationIds.length > 0))
      );
    },
    childGroups(): Group[] {
      if (!this.group?.spec.groupIds) return [];
      return this.group.spec.groupIds
        .map((id) => this.groupsStore.getGroupById(id))
        .filter((g): g is Group => g !== undefined);
    },
    sessionName(): string {
      if (!this.group?.spec.sessionId) return "";
      const session = this.sessionsStore.sessions.find(
        (s) => s.meta.id === this.group!.spec.sessionId,
      );
      return session?.meta.name || "Unknown Session";
    },
    housingRoomName(): string {
      if (!this.group?.spec.housingRoomId) return "";
      const room = this.housingRoomsStore.getHousingRoomById(
        this.group.spec.housingRoomId,
      );
      return room?.meta.name || "Unknown Room";
    },
    certificationNames(): string[] {
      if (!this.group?.spec.staffFilters?.certificationIds) return [];
      return this.group.spec.staffFilters.certificationIds.map((id) => {
        const cert = this.certificationsStore.getCertificationById(id);
        return cert?.meta.name || "Unknown";
      });
    },
  },
  methods: {
    getLabelName(labelId: string): string {
      const label = this.labelsStore.getLabelById(labelId);
      return label ? label.meta.name : "Unknown Label";
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
    getRoleName(roleId: string): string {
      const role = this.rolesStore.getRoleById(roleId);
      return role ? role.meta.name : "Unknown Role";
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
