<template>
  <section class="program-staff-group-card card row justify-between">
    <div class="column">
      <div class="staff-group-info">
        <h4>{{ staffGroup.meta.name }}</h4>
        <p v-if="staffGroup.meta.description" class="text-caption">
          {{ staffGroup.meta.description }}
        </p>
      </div>

      <div class="staff-group-meta">
        <span v-if="staffCount" class="meta-item">
          <Icon name="Users" :size="14" />
          {{ staffCount }} staff members
        </span>
      </div>
    </div>
    <div class="staff-group-actions">
      <BaseButton
        color="negative"
        outline
        size="sm"
        label="Remove"
        @click="$emit('remove', staffGroup.meta.id)"
      />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
// Types
import type { Group } from "@/generated/api";
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
    staffGroup: {
      type: Object as PropType<Group>,
      required: true,
    },
  },
  emits: ["remove"],
  setup() {
    const areasStore = useAreasStore();
    return { areasStore };
  },
  computed: {
    staffCount(): number {
      return this.staffGroup.spec.staffIds?.length || 0;
    },
  },
});
</script>

<style lang="scss" scoped>
.program-staff-group-card {
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.program-staff-group-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.staff-group-info h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
}

.staff-group-info p {
  margin: 0;
  font-size: 0.875rem;
}

.staff-group-meta {
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
