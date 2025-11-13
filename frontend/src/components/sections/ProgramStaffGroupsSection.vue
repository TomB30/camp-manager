<template>
  <div>
    <div class="section-header">
      <h3>
        <Icon name="UsersRound" :size="20" />
        Staff Groups
      </h3>
      <BaseButton
        color="grey-8"
        outline
        icon="add"
        label="Staff Group"
        @click="$emit('add-staff-group')"
      />
    </div>

    <div v-if="staffGroups.length > 0" class="section-content">
      <q-input
        v-model="searchQuery"
        outlined
        dense
        placeholder="Search staff groups..."
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

      <div class="staff-list">
        <transition-group name="list" tag="div" class="transition-wrapper">
          <ProgramStaffGroupCard
            v-for="group in filteredStaffGroups"
            :key="group.meta.id"
            :staff-group="group"
            @remove="$emit('remove-staff-group', group.meta.id)"
          />
        </transition-group>
      </div>

      <transition name="fade">
        <div v-if="filteredStaffGroups.length === 0" class="empty-section">
          <p>No staff groups found matching "{{ searchQuery }}"</p>
        </div>
      </transition>
    </div>

    <div v-else class="empty-section">
      <p>No staff groups assigned. Add staff groups to this program.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import type { Group } from "@/generated/api";
import ProgramStaffGroupCard from "../cards/ProgramStaffGroupCard.vue";
import Icon from "../Icon.vue";

export default defineComponent({
  name: "ProgramStaffGroupsSection",
  components: {
    ProgramStaffGroupCard,
    Icon,
  },
  props: {
    staffGroups: {
      type: Array as PropType<Group[]>,
      required: true,
    },
  },
  emits: ["add-staff-group", "remove-staff-group"],
  data() {
    return {
      searchQuery: "",
    };
  },
  computed: {
    filteredStaffGroups(): Group[] {
      if (!this.searchQuery.trim()) {
        return this.staffGroups;
      }
      const query = this.searchQuery.toLowerCase().trim();
      return this.staffGroups.filter((group) =>
        group.meta.name.toLowerCase().includes(query)
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
  gap: 1rem;
}

.empty-section {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-section p {
  margin: 0;
}

/* List animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.list-move {
  transition: transform 0.3s ease;
}

/* Fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

