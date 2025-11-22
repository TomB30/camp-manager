<template>
  <div class="card clickable" @click="$emit('click', camper)">
    <section class="card-header">
      <div class="card-icon">
        <AvatarInitials
          :first-name="getFirstName(camper.meta.name)"
          :last-name="getLastName(camper.meta.name)"
          size="lg"
        />
      </div>
      <div class="title-and-description-wrapper">
        <h4>{{ camper.meta.name }}</h4>
        <p class="card-description">{{ formattedGender }}</p>
      </div>
    </section>
    <section class="card-details">
      <div class="card-meta row items-center gap-1">
        <span class="badge badge-primary">Age {{ age }}</span>
        <span class="badge badge-primary">{{ formattedGender }}</span>
        <span v-if="sessionName" class="badge badge-primary">{{
          sessionName
        }}</span>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Camper } from "@/generated/api";
import AvatarInitials from "@/components/AvatarInitials.vue";
import { dateUtils } from "@/utils/dateUtils";

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
  computed: {
    age(): number {
      return this.camper.spec.birthday
        ? dateUtils.calculateAge(this.camper.spec.birthday)
        : 0;
    },
  },
  methods: {
    getFirstName(fullName: string): string {
      return fullName.split(" ")[0] || "";
    },
    getLastName(fullName: string): string {
      return fullName.split(" ").slice(1).join(" ") || "";
    },
  },
});
</script>
