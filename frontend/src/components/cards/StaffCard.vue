<template>
  <div class="card clickable" @click="$emit('click', member)">
    <section class="card-header">
      <div class="card-icon">
        <AvatarInitials
          :first-name="getFirstName(member.meta.name)"
          :last-name="getLastName(member.meta.name)"
          size="lg"
        />
      </div>
      <div class="title-and-description-wrapper">
        <h4>{{ member.meta.name }}</h4>
        <p class="card-description">{{ formattedRole }}</p>
      </div>
    </section>

    <div class="row items-center gap-2">
      <div v-if="member.spec.phone" class="row items-center gap-1">
        <Icon name="Phone" :size="14" />
        {{ member.spec.phone }}
      </div>
      <div v-if="certificationCount > 0" class="row items-center">
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
