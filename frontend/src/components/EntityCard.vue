<template>
  <div
    class="entity-card card"
    :class="{ 'card-clickable': clickable }"
    :style="colorBorderStyle"
    @click="handleClick"
  >
    <div v-if="hasHeader" class="card-header">
      <h4>{{ title }}</h4>
      <slot name="header-badge">
        <span v-if="badge" class="badge badge-primary">{{ badge }}</span>
      </slot>
    </div>

    <p v-if="description" class="card-description">{{ description }}</p>

    <slot />

    <div v-if="hasStats" class="card-stats">
      <slot name="stats" />
    </div>

    <div v-if="hasFooter" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "EntityCard",
  props: {
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    badge: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "",
    },
    clickable: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["click"],
  computed: {
    hasHeader(): boolean {
      return !!(this.title || this.$slots["header-badge"]);
    },
    hasStats(): boolean {
      return !!this.$slots.stats;
    },
    hasFooter(): boolean {
      return !!this.$slots.footer;
    },
    colorBorderStyle(): string {
      if (this.color) {
        return `border-left: 4px solid ${this.color}`;
      }
      return "";
    },
  },
  methods: {
    handleClick() {
      if (this.clickable) {
        this.$emit("click");
      }
    },
  },
});
</script>

<style scoped>
.entity-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-clickable:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.card-header h4 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.card-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.card-stats :deep(.stat-item) {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.card-footer {
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-light);
}
</style>
