<template>
  <div>
    <div class="section-header">
      <h3>
        <Icon name="ListChecks" :size="20" />
        Activities
      </h3>
      <BaseButton
        color="grey-8"
        outline
        icon="add"
        label="Activity"
        @click="$emit('add-activity')"
      />
    </div>

    <div v-if="activities.length > 0" class="section-content">
      <q-input
        v-model="searchQuery"
        outlined
        dense
        placeholder="Search activities..."
        class="search-input"
      >
        <template v-slot:prepend>
          <Icon name="Search" :size="16" />
        </template>
        <template v-slot:append>
          <q-icon
            v-if="searchQuery"
            name="close"
            class="cursor-pointer"
            @click="searchQuery = ''"
          />
        </template>
      </q-input>

      <div
        class="activities-list q-pr-xs"
        :style="{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }"
      >
        <transition-group name="list" tag="div" class="transition-wrapper">
          <ProgramActivityCard
            v-for="activity in filteredActivities"
            :key="activity.meta.id"
            :activity="activity"
            @remove="$emit('remove-activity', activity.meta.id)"
            @click="$emit('view-activity', activity)"
          />
        </transition-group>
      </div>

      <transition name="fade">
        <div v-if="filteredActivities.length === 0" class="empty-section">
          <p>No activities found matching "{{ searchQuery }}"</p>
        </div>
      </transition>
    </div>

    <div v-else class="empty-section">
      <p>No activities yet. Add activities to create event templates.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import type { Activity } from "@/generated/api";
import ProgramActivityCard from "../cards/ProgramActivityCard.vue";
import Icon from "../Icon.vue";

export default defineComponent({
  name: "ProgramActivitiesSection",
  components: {
    ProgramActivityCard,
    Icon,
  },
  props: {
    activities: {
      type: Array as PropType<Activity[]>,
      required: true,
    },
  },
  emits: ["add-activity", "remove-activity", "view-activity"],
  data() {
    return {
      searchQuery: "",
    };
  },
  computed: {
    filteredActivities(): Activity[] {
      if (!this.searchQuery.trim()) {
        return this.activities;
      }
      const query = this.searchQuery.toLowerCase().trim();
      return this.activities.filter((activity) =>
        activity.meta.name.toLowerCase().includes(query),
      );
    },
  },
});
</script>

<style lang="scss" scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-light);
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  @media (max-width: 768px) {
    font-size: 1rem;
  }
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-input {
  margin-bottom: 0.5rem;
}

.transition-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-section {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-section p {
  margin: 0;
}
</style>
