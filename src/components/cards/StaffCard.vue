<template>
  <div 
    class="card card-clickable card-horizontal"
    @click="$emit('click', member)"
  >
    <AvatarInitials
      :first-name="member.firstName"
      :last-name="member.lastName"
      :color="roleColor"
      size="lg"
    />
    <div class="card-details">
      <h4>{{ member.firstName }} {{ member.lastName }}</h4>
      <div class="member-role">
        <span class="badge badge-primary">{{ formattedRole }}</span>
      </div>
      <div v-if="member.email" class="member-contact text-sm text-secondary mt-1">
        {{ member.email }}
      </div>
      <div v-if="certificationCount > 0" class="member-certs text-xs mt-2">
        {{ certificationCount }} Certification(s)
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { StaffMember } from '@/types';
import AvatarInitials from '@/components/AvatarInitials.vue';

export default defineComponent({
  name: 'StaffCard',
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
    roleColor: {
      type: String,
      default: '',
    },
  },
  emits: ['click'],
  computed: {
    certificationCount(): number {
      return this.member.certificationIds?.length || 0;
    }
  }
});
</script>

<style scoped>
@import './card-styles.css';
</style>

