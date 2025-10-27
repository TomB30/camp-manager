<template>
  <div
    class="card card-clickable card-horizontal role-card"
    @click="$emit('click')"
  >
    <div class="card-icon" :style="{ background: iconColor }">
      <slot name="icon">
        <Icon name="Shield" :size="28" :stroke-width="2" />
      </slot>
    </div>
    <div class="card-details">
      <h4>{{ role.meta.name }}</h4>
      <p v-if="role.meta.description" class="card-description">
        {{ role.meta.description }}
      </p>
      <p v-else class="card-description text-caption">
        No description provided
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Role } from "@/types";
import Icon from "../Icon.vue";

export default defineComponent({
  name: "RoleCard",
  components: {
    Icon,
  },
  props: {
    role: {
      type: Object as PropType<Role>,
      required: true,
    },
    iconColor: {
      type: String,
      default: "#6366f1",
    },
  },
  emits: ["click"],
});
</script>

<style scoped>
@import "./card-styles.css";

.role-card {
  min-height: 100px;
}
</style>
