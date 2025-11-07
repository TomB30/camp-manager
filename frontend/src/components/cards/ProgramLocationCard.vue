<template>
  <section class="program-location-card card row justify-between">
    <div class="column">
      <div class="location-info">
        <h4>{{ location.meta.name }}</h4>
        <p v-if="location.meta.description" class="text-caption">
          {{ location.meta.description }}
        </p>
      </div>

      <div class="location-meta">
        <span v-if="location.spec.capacity" class="meta-item">
          <Icon name="Users" :size="14" />
          {{ location.spec.capacity }} max capacity
        </span>

        <span v-if="location.spec.areaId" class="meta-item">
          <Icon name="MapPin" :size="14" />
          {{ locationAreaName }}
        </span>
      </div>
    </div>
    <div class="location-actions">
      <BaseButton
        color="negative"
        outline
        size="sm"
        label="Remove"
        @click="$emit('remove', location.meta.id)"
      />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
// Types
import type { Location } from "@/generated/api";
// Stores
import { useAreasStore } from "@/stores";
// Components
import Icon from "../Icon.vue";

export default defineComponent({
  name: "ProgramLocationCard",
  components: {
    Icon,
  },
  props: {
    location: {
      type: Object as PropType<Location>,
      required: true,
    },
  },
  emits: ["remove"],
  setup() {
    const areasStore = useAreasStore();
    return { areasStore };
  },
  computed: {
    locationAreaName(): string {
      if (this.location.spec.areaId) {
        return (
          this.areasStore.getAreaById(this.location.spec.areaId)?.meta.name ||
          ""
        );
      }
      return "";
    },
  },
});
</script>

<style lang="scss" scoped>
.program-location-card {
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.program-location-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.location-info h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
}

.location-info p {
  margin: 0;
  font-size: 0.875rem;
}

.location-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
