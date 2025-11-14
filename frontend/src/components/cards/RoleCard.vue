<template>
  <div class="card" @click="$emit('click')">
    <div class="card-header">
      <div class="card-icon" :style="{ background: iconColor }">
        <slot name="icon">
          <Icon name="Shield" :size="28" :stroke-width="2" />
        </slot>
      </div>
      <div>
        <h4>{{ role.meta.name }}</h4>
        <p v-if="role.meta.description" class="card-description">
          {{ role.meta.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Role } from "@/generated/api";
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
.card-header {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
</style>
