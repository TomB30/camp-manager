<template>
  <div
    class="card card-clickable card-horizontal"
    @click="$emit('click', camper)"
  >
    <AvatarInitials
      :first-name="camper.firstName"
      :last-name="camper.lastName"
      size="lg"
    />
    <div class="card-details">
      <h4>{{ camper.firstName }} {{ camper.lastName }}</h4>
      <div class="card-meta">
        <span class="badge badge-primary">Age {{ camper.age }}</span>
        <span class="badge badge-primary">{{ formattedGender }}</span>
        <span v-if="sessionName" class="badge badge-primary">{{
          sessionName
        }}</span>
        <span
          v-if="camper.allergies && camper.allergies.length > 0"
          class="badge badge-warning"
        >
          {{ camper.allergies.length }} Allergy(ies)
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Camper } from "@/types";
import AvatarInitials from "@/components/AvatarInitials.vue";

export default defineComponent({
  name: "CamperCard",
  components: {
    AvatarInitials,
  },
  props: {
    camper: {
      type: Object as PropType<Camper>,
      required: true,
    },
    formattedGender: {
      type: String,
      default: "",
    },
    sessionName: {
      type: String,
      default: "",
    },
  },
  emits: ["click"],
});
</script>

<style scoped>
@import "./card-styles.css";
</style>
