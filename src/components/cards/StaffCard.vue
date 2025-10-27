<template>
  <div
    class="card card-clickable card-horizontal"
    @click="$emit('click', member)"
  >
    <AvatarInitials
      :first-name="member.spec.firstName"
      :last-name="member.spec.lastName"
      size="lg"
    />
    <div class="card-details">
      <h4>{{ member.spec.firstName }} {{ member.spec.lastName }}</h4>
      <div class="member-role">
        <span class="badge badge-primary">{{ formattedRole }}</span>
      </div>
      <div v-if="member.spec.email" class="member-contact text-caption mt-1">
        {{ member.spec.email }}
      </div>
      <div v-if="certificationCount > 0" class="member-certs text-xs mt-2">
        {{ certificationCount }} Certification(s)
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { StaffMember } from "@/types";
import AvatarInitials from "@/components/AvatarInitials.vue";

export default defineComponent({
  name: "StaffCard",
  components: {
    AvatarInitials,
  },
  props: {
    member: {
      type: Object as PropType<StaffMember>,
      required: true,
    },
    formattedRole: {
      type: String,
      required: true,
    },
  },
  emits: ["click"],
  computed: {
    certificationCount(): number {
      return this.member.spec.certificationIds?.length || 0;
    },
  },
});
</script>

<style scoped>
@import "./card-styles.css";
</style>
