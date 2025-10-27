<template>
  <div
    class="card card-clickable card-horizontal certification-card"
    @click="$emit('click')"
  >
    <div class="card-icon" :style="{ background: iconColor }">
      <slot name="icon">
        <Icon name="Award" :size="28" :stroke-width="2" />
      </slot>
    </div>
    <div class="card-details">
      <h4>{{ certification.meta.name }}</h4>
      <p v-if="certification.meta.description" class="card-description">
        {{ certification.meta.description }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Certification } from "@/types";
import Icon from "../Icon.vue";

export default defineComponent({
  name: "CertificationCard",
  components: {
    Icon,
  },
  props: {
    certification: {
      type: Object as PropType<Certification>,
      required: true,
    },
    iconColor: {
      type: String,
      default: "#10b981",
    },
  },
  emits: ["click"],
});
</script>

<style scoped>
@import "./card-styles.css";

.certification-card {
  min-height: 120px;
}

.badge .inline {
  vertical-align: middle;
  margin-right: 2px;
  margin-top: -2px;
}
</style>
