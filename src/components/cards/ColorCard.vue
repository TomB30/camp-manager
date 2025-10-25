<template>
  <div class="color-card">
    <div class="color-preview" :style="{ background: color.hexValue }">
      <div class="color-overlay">
        <button
          class="icon-btn"
          @click.stop="$emit('edit', color)"
          title="Edit"
        >
          <Icon name="Edit2" :size="18" />
        </button>
        <button
          class="icon-btn"
          @click.stop="$emit('delete', color)"
          title="Delete"
        >
          <Icon name="Trash2" :size="18" />
        </button>
      </div>
    </div>
    <div class="color-info">
      <div class="color-name">{{ color.name }}</div>
      <div class="color-hex">{{ color.hexValue }}</div>
      <span v-if="color.default" class="badge badge-default">Default</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Color } from "@/types";
import Icon from "../Icon.vue";

export default defineComponent({
  name: "ColorCard",
  components: {
    Icon,
  },
  props: {
    color: {
      type: Object as PropType<Color>,
      required: true,
    },
  },
  emits: ["edit", "delete"],
});
</script>

<style scoped>
.color-card {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: var(--shadow);
  cursor: pointer;
}

.color-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.color-preview {
  height: 120px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.color-card:hover .color-overlay {
  opacity: 1;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: var(--primary-color);
  color: white;
  transform: scale(1.1);
}

.color-info {
  padding: 0.75rem 1rem;
  text-align: center;
}

.color-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.color-hex {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-family: "Courier New", monospace;
}

.badge-default {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background: var(--primary-color);
  border-radius: var(--radius);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

@media (max-width: 768px) {
  .color-preview {
    height: 100px;
  }

  .icon-btn {
    width: 32px;
    height: 32px;
  }
}
</style>
