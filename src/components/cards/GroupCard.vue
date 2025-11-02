<template>
  <div class="card card-clickable" @click="$emit('click', group)">
    <div class="card-header">
      <div class="card-header-main">
        <h4>{{ group.meta.name }}</h4>
        <div class="group-badges">
          <span v-if="isNestedGroup" class="badge badge-info">
            <Icon name="FolderOpen" :size="12" />
            Nested Group
          </span>
          <span v-if="group.spec.housingRoomId" class="badge badge-secondary">
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

    <p v-if="group.meta.description" class="card-description">
      {{ group.meta.description }}
    </p>

    <!-- Labels -->
    <div
      v-if="group.spec.labelIds && group.spec.labelIds.length > 0"
      class="card-labels"
    >
      <span
        v-for="labelId in group.spec.labelIds"
        :key="labelId"
        class="label-badge"
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

      <!-- Manual campers -->
      <div
        v-if="group.spec.camperIds && group.spec.camperIds.length > 0"
        class="info-item"
      >
        <Icon name="Users" :size="16" />
        <span>{{ group.spec.camperIds.length }} campers</span>
      </div>

      <!-- Manual staff -->
      <div
        v-if="group.spec.staffIds && group.spec.staffIds.length > 0"
        class="info-item"
      >
        <Icon name="Users" :size="16" />
        <span>{{ group.spec.staffIds.length }} staff</span>
      </div>

      <!-- Housing room -->
      <div v-if="group.spec.housingRoomId" class="info-item">
        <Icon name="Bed" :size="16" />
        <span>{{ housingRoomName }}</span>
      </div>

      <!-- Session -->
      <div v-if="group.spec.sessionId" class="info-item">
        <Icon name="Calendar" :size="16" />
        <span>{{ sessionName }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Group, Session } from "@/generated/api";
import {
  useLabelsStore,
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
    housingRoomsStore() {
      return useHousingRoomsStore();
    },
    sessionsStore() {
      return useSessionsStore();
    },
    isNestedGroup(): boolean {
      return !!(
        this.group.spec.groupIds && this.group.spec.groupIds.length > 0
      );
    },
    childGroupCount(): number {
      return this.group.spec.groupIds?.length || 0;
    },
    housingRoomName(): string {
      if (!this.group.spec.housingRoomId) return "";
      const room = this.housingRoomsStore.getHousingRoomById(
        this.group.spec.housingRoomId,
      );
      return room?.meta.name || "Unknown Room";
    },
    sessionName(): string {
      if (!this.group.spec.sessionId) return "";
      const session = this.sessionsStore.sessions.find(
        (s: Session) => s.meta.id === this.group.spec.sessionId,
      );
      return session?.meta.name || "Unknown Session";
    },
  },
  methods: {
    getLabelName(labelId: string): string {
      const label = this.labelsStore.getLabelById(labelId);
      return label ? label.meta.name : "Unknown Label";
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
