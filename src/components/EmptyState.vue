<template>
  <div class="empty-state">
    <slot name="icon">
      <Icon v-if="iconName" :name="iconName" :size="64" :stroke-width="1.5" />
    </slot>

    <h3 v-if="title">{{ title }}</h3>
    <p v-if="message">{{ message }}</p>

    <slot name="action">
      <button
        v-if="actionText"
        :class="['btn', actionButtonClass]"
        @click="$emit('action')"
      >
        <Icon
          v-if="!hideActionIcon"
          class="action-icon"
          name="Plus"
          color="white"
          :size="18"
        />
        {{ actionText }}
      </button>
    </slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import Icon, { IconName } from "@/components/Icon.vue";
export default defineComponent({
  name: "EmptyState",
  components: {
    Icon,
  },
  props: {
    type: {
      type: String as PropType<"empty" | "no-results">,
      default: "empty",
    },
    iconName: {
      type: String as PropType<IconName>,
      default: null,
    },
    title: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    actionText: {
      type: String,
      default: "",
    },
    actionButtonClass: {
      type: String,
      default: "btn-primary",
    },
    hideActionIcon: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["action"],
});
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-secondary);
  min-height: 300px;
}

.empty-state svg:not(.action-icon),
.empty-state :deep(svg:not(.action-icon)) {
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  font-size: 0.9375rem;
  color: var(--text-secondary);
  max-width: 400px;
}

.empty-state button {
  margin-top: 0.5rem;
}
</style>
