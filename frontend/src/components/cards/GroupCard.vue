<template>
  <div class="card clickable" @click="$emit('click', group)">
    <div class="card-header">
      <div class="card-icon" :style="{ background: '#3b82f6' }">
        <Icon name="Network" :size="24" :stroke-width="2" />
      </div>
      <div>
        <h4>{{ group.meta.name }}</h4>
        <p>{{ group.meta.description }}</p>
      </div>
    </div>

    <!-- Group type info -->
    <div class="row gap-2">
      <!-- Nested groups -->
      <div v-if="isNestedGroup" class="card-info-item">
        <Icon name="FolderOpen" :size="16" />
        <span
          >{{ childGroupCount }} child
          {{ childGroupCount === 1 ? "group" : "groups" }}</span
        >
      </div>

      <!-- Manual campers -->
      <div
        v-if="group.spec.camperIds && group.spec.camperIds.length > 0"
        class="card-info-item"
      >
        <Icon name="Users" :size="16" />
        <span>{{ group.spec.camperIds.length }} campers</span>
      </div>

      <!-- Manual staff -->
      <div
        v-if="group.spec.staffIds && group.spec.staffIds.length > 0"
        class="card-info-item"
      >
        <Icon name="Users" :size="16" />
        <span>{{ group.spec.staffIds.length }} staff</span>
      </div>

      <!-- Housing room -->
      <div v-if="group.spec.housingRoomId" class="card-info-item">
        <Icon name="Bed" :size="16" />
        <span>{{ housingRoomName }}</span>
      </div>

      <!-- Session -->
      <div v-if="group.spec.sessionId" class="card-info-item">
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
