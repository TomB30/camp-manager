<template>
  <div>
    <div class="section-header">
      <h3>
        <Icon name="Home" :size="20" />
        Locations
      </h3>
      <BaseButton
        color="grey-8"
        outline
        icon="add"
        label="Location"
        @click="$emit('add-location')"
      />
    </div>

    <div v-if="locations.length > 0" class="section-content">
      <q-input
        v-model="searchQuery"
        outlined
        dense
        placeholder="Search locations..."
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

      <div class="locations-list">
        <transition-group name="list" tag="div" class="transition-wrapper">
          <ProgramLocationCard
            v-for="location in filteredLocations"
            :key="location.meta.id"
            :location="location"
            @remove="$emit('remove-location', location.meta.id)"
          />
        </transition-group>
      </div>

      <transition name="fade">
        <div v-if="filteredLocations.length === 0" class="empty-section">
          <p>No locations found matching "{{ searchQuery }}"</p>
        </div>
      </transition>
    </div>

    <div v-else class="empty-section">
      <p>No locations assigned. Add locations to this program.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import type { Location } from "@/generated/api";
import ProgramLocationCard from "../cards/ProgramLocationCard.vue";
import Icon from "../Icon.vue";

export default defineComponent({
  name: "ProgramLocationsSection",
  components: {
    ProgramLocationCard,
    Icon,
  },
  props: {
    locations: {
      type: Array as PropType<Location[]>,
      required: true,
    },
  },
  emits: ["add-location", "remove-location"],
  data() {
    return {
      searchQuery: "",
    };
  },
  computed: {
    filteredLocations(): Location[] {
      if (!this.searchQuery.trim()) {
        return this.locations;
      }
      const query = this.searchQuery.toLowerCase().trim();
      return this.locations.filter((location) =>
        location.meta.name.toLowerCase().includes(query)
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
  gap: .5rem;
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

