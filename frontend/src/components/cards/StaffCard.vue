<template>
  <div
    class="card card-clickable card-horizontal"
    @click="$emit('click', member)"
  >
    <AvatarInitials
      :first-name="getFirstName(member.meta.name)"
      :last-name="getLastName(member.meta.name)"
      size="lg"
    />
    <div class="card-details">
      <h4>{{ member.meta.name }}</h4>
      <div class="member-role">
        <span class="badge badge-primary">{{ formattedRole }}</span>
      </div>
      <div
        v-if="member.spec.phone"
        class="member-contact text-caption mt-1 row items-center gap-1"
      >
        <Icon name="Phone" :size="14" color="var(--text-secondary)" />
        {{ member.spec.phone }}
      </div>
      <div v-if="certificationCount > 0" class="member-certs text-xs mt-2">
        {{ certificationCount }} Certification(s)
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { StaffMember } from "@/generated/api";
import AvatarInitials from "@/components/AvatarInitials.vue";
import Icon from "@/components/Icon.vue";

export default defineComponent({
  name: "StaffCard",
  components: {
    AvatarInitials,
    Icon,
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

<style scoped>
@import "./card-styles.css";
</style>
