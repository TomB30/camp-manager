<template>
  <div 
    class="avatar-initials" 
    :class="[sizeClass]"
    :style="{ background: backgroundColor }"
  >
    {{ initials }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AvatarInitials',
  props: {
    firstName: {
      type: String,
      default: '',
    },
    lastName: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
    },
    color: {
      type: String,
      default: '',
    },
  },
  computed: {
    initials(): string {
      if (this.text) {
        return this.text.substring(0, 2).toUpperCase();
      }
      
      const first = this.firstName.charAt(0).toUpperCase();
      const last = this.lastName.charAt(0).toUpperCase();
      return `${first}${last}`;
    },
    backgroundColor(): string {
      return this.color || 'var(--accent-color)';
    },
    sizeClass(): string {
      return `avatar-${this.size}`;
    },
  },
});
</script>

<style scoped>
.avatar-initials {
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.avatar-xs {
  width: 24px;
  height: 24px;
  font-size: 0.625rem;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  font-size: 0.75rem;
}

.avatar-md {
  width: 48px;
  height: 48px;
  font-size: 1rem;
}

.avatar-lg {
  width: 64px;
  height: 64px;
  font-size: 1.25rem;
}

.avatar-xl {
  width: 80px;
  height: 80px;
  font-size: 1.5rem;
}
</style>

