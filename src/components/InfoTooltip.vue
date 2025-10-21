<template>
  <div class="info-tooltip-wrapper">
    <BaseButton
      flat
      round
      dense
      color="grey-6"
      icon="info"
      aria-label="Information"
    >
      <q-tooltip max-width="400px">{{ tooltipText }}</q-tooltip>
    </BaseButton>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Icon from "./Icon.vue";

export default defineComponent({
  name: "InfoTooltip",
  components: {
    Icon,
  },
  props: {
    tooltipText: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isVisible: false,
    };
  },
  methods: {
    toggleTooltip() {
      this.isVisible = !this.isVisible;
    },
    hideTooltip() {
      // Delay to allow click events on tooltip content
      setTimeout(() => {
        this.isVisible = false;
      }, 150);
    },
  },
});
</script>

<style scoped>
.info-tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.15s ease;
  vertical-align: middle;
}

.info-icon:hover {
  color: var(--accent-color);
  background: var(--surface-secondary);
}

.info-icon:focus {
  outline: none;
  color: var(--accent-color);
}

.tooltip-content {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  min-width: 300px;
  max-width: 400px;
  padding: 0.75rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  z-index: 1000;
  animation: fadeInDown 0.15s ease;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .tooltip-content {
    min-width: 250px;
    max-width: calc(100vw - 4rem);
  }
}
</style>
