<template>
  <div
    class="color-indicator"
    :class="[typeClass, sizeClass]"
    :style="{ background: color }"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ColorIndicator",
  props: {
    color: {
      type: String,
      default: "#6366F1",
    },
    type: {
      type: String,
      default: "dot",
      validator: (value: string) => ["dot", "bar"].includes(value),
    },
    size: {
      type: String,
      default: "md",
      validator: (value: string) => ["sm", "md", "lg"].includes(value),
    },
  },
  computed: {
    typeClass(): string {
      return `indicator-${this.type}`;
    },
    sizeClass(): string {
      return `indicator-${this.size}`;
    },
  },
});
</script>

<style scoped>
.color-indicator {
  flex-shrink: 0;
}

/* Dot style */
.indicator-dot {
  border-radius: 50%;
}

.indicator-dot.indicator-sm {
  width: 8px;
  height: 8px;
}

.indicator-dot.indicator-md {
  width: 10px;
  height: 10px;
}

.indicator-dot.indicator-lg {
  width: 12px;
  height: 12px;
}

/* Bar style */
.indicator-bar {
  border-radius: 2px;
  height: 100%;
}

.indicator-bar.indicator-sm {
  width: 2px;
}

.indicator-bar.indicator-md {
  width: 3px;
}

.indicator-bar.indicator-lg {
  width: 4px;
}
</style>
