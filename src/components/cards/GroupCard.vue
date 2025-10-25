<template>
  <div
    class="card card-clickable"
    @click="$emit('click', group)"
  >
    <div class="card-header">
      <div class="card-header-main">
        <h4>{{ group.name }}</h4>
        <div class="group-badges">
          <span v-if="isNestedGroup" class="badge badge-info">
            <Icon name="FolderOpen" :size="12" />
            Nested Group
          </span>
          <span v-if="group.housingRoomId" class="badge badge-secondary">
            <Icon name="Bed" :size="12" />
            Housing
          </span>
        </div>
      </div>
      <div class="card-header-counts">
        <span v-if="campersCount > 0" class="badge badge-primary">
          {{ campersCount }} {{ campersCount === 1 ? "camper" : "campers" }}
        </span>
        <span v-if="staffCount > 0" class="badge badge-success">
          {{ staffCount }} staff
        </span>
      </div>
    </div>

    <p v-if="group.description" class="card-description">
      {{ group.description }}
    </p>

    <!-- Labels -->
    <div v-if="group.labelIds && group.labelIds.length > 0" class="card-labels">
      <span
        v-for="labelId in group.labelIds"
        :key="labelId"
        class="label-badge"
        :style="{ background: getLabelColor(labelId) }"
      >
        {{ getLabelName(labelId) }}
      </span>
    </div>

    <!-- Group type info -->
    <div class="group-info">
      <!-- Nested groups -->
      <div v-if="isNestedGroup" class="info-item">
        <Icon name="FolderOpen" :size="16" />
        <span
          >{{ childGroupCount }} child
          {{ childGroupCount === 1 ? "group" : "groups" }}</span
        >
      </div>

      <!-- Filter-based campers -->
      <div v-if="group.camperFilters" class="info-item">
        <Icon name="Filter" :size="16" />
        <span>Auto-assigned campers</span>
      </div>

      <!-- Manual campers -->
      <div
        v-if="group.camperIds && group.camperIds.length > 0"
        class="info-item"
      >
        <Icon name="Users" :size="16" />
        <span>{{ group.camperIds.length }} selected campers</span>
      </div>

      <!-- Filter-based staff -->
      <div v-if="group.staffFilters" class="info-item">
        <Icon name="Filter" :size="16" />
        <span>Auto-assigned staff</span>
      </div>

      <!-- Manual staff -->
      <div v-if="group.staffIds && group.staffIds.length > 0" class="info-item">
        <Icon name="Users" :size="16" />
        <span>{{ group.staffIds.length }} selected staff</span>
      </div>

      <!-- Housing room -->
      <div v-if="group.housingRoomId" class="info-item">
        <Icon name="Bed" :size="16" />
        <span>{{ housingRoomName }}</span>
      </div>

      <!-- Session -->
      <div v-if="group.sessionId" class="info-item">
        <Icon name="Calendar" :size="16" />
        <span>{{ sessionName }}</span>
      </div>
    </div>

    <!-- Filter criteria display -->
    <div
      v-if="group.camperFilters && hasAnyCamperFilters"
      class="group-filters"
    >
      <div class="filter-section-label">Camper Filters:</div>
      <span v-if="group.camperFilters.gender" class="filter-tag">
        <strong>Gender:</strong> {{ formatGender(group.camperFilters.gender) }}
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
          formatAgeRange(group.camperFilters.ageMin, group.camperFilters.ageMax)
        }}
      </span>
      <span
        v-if="group.camperFilters.hasAllergies !== undefined"
        class="filter-tag"
      >
        <strong>Allergies:</strong>
        {{
          group.camperFilters.hasAllergies ? "Has allergies" : "No allergies"
        }}
      </span>
    </div>

    <div v-if="group.staffFilters && hasAnyStaffFilters" class="group-filters">
      <div class="filter-section-label">Staff Filters:</div>
      <span
        v-if="group.staffFilters.roles && group.staffFilters.roles.length > 0"
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
        {{ group.staffFilters.certificationIds.length }} required
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Group, Session } from "@/types";
import {
  useLabelsStore,
  useColorsStore,
  useHousingRoomsStore,
  useSessionsStore,
} from "@/stores";
import Icon from "@/components/Icon.vue";

export default defineComponent({
  name: "GroupCard",
  components: {
    Icon,
  },
  props: {
    group: {
      type: Object as PropType<Group>,
      required: true,
    },
    campersCount: {
      type: Number,
      default: 0,
    },
    staffCount: {
      type: Number,
      default: 0,
    },
  },
  emits: ["click"],
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
    isNestedGroup(): boolean {
      return !!(this.group.groupIds && this.group.groupIds.length > 0);
    },
    childGroupCount(): number {
      return this.group.groupIds?.length || 0;
    },
    hasAnyCamperFilters(): boolean {
      const f = this.group.camperFilters;
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
      const f = this.group.staffFilters;
      return !!(
        f &&
        ((f.roles && f.roles.length > 0) ||
          (f.certificationIds && f.certificationIds.length > 0))
      );
    },
    housingRoomName(): string {
      if (!this.group.housingRoomId) return "";
      const room = this.housingRoomsStore.getHousingRoomById(
        this.group.housingRoomId,
      );
      return room?.name || "Unknown Room";
    },
    sessionName(): string {
      if (!this.group.sessionId) return "";
      const session = this.sessionsStore.sessions.find(
        (s: Session) => s.id === this.group.sessionId,
      );
      return session?.name || "Unknown Session";
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
  },
});
</script>

<style scoped>
@import "./card-styles.css";

.card-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.card-header-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.card-header-main h4 {
  margin: 0;
  flex: 1;
}

.group-badges {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.card-header-counts {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.card-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}

.label-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  border-radius: 9999px;
  white-space: nowrap;
}

.group-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.group-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.filter-section-label {
  width: 100%;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.filter-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--background-secondary);
  border-radius: var(--radius);
  font-size: 0.75rem;
}

.filter-tag strong {
  color: var(--text-secondary);
  font-weight: 500;
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
