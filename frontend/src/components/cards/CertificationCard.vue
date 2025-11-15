<template>
  <div
    class="card clickable card-horizontal certification-card"
    @click="$emit('click')"
  >
    <div class="card-header">
      <div class="card-icon" :style="{ background: iconColor }">
        <slot name="icon">
          <Icon name="Award" :size="28" :stroke-width="2" />
        </slot>
      </div>
      <div>
        <h4>{{ certification.meta.name }}</h4>
        <p v-if="certification.meta.description" class="card-description">
          {{ certification.meta.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Certification } from "@/generated/api";
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
.card-header {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.badge .inline {
  vertical-align: middle;
  margin-right: 2px;
  margin-top: -2px;
}
</style>
