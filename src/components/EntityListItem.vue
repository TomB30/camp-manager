<template>
  <div class="entity-list-item">
    <slot name="avatar">
      <AvatarInitials 
        v-if="firstName || lastName"
        :first-name="firstName"
        :last-name="lastName"
        :color="avatarColor"
        size="md"
      />
    </slot>
    
    <div class="entity-info">
      <slot>
        <div class="entity-name">{{ title }}</div>
        <div v-if="subtitle" class="entity-subtitle text-secondary">{{ subtitle }}</div>
        <div v-if="$slots.metadata" class="entity-metadata">
          <slot name="metadata" />
        </div>
      </slot>
    </div>
    
    <slot name="actions">
      <button 
        v-if="removable"
        class="btn btn-sm btn-danger-outline"
        @click.stop="$emit('remove')"
      >
        Remove
      </button>
    </slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AvatarInitials from '@/components/AvatarInitials.vue';

export default defineComponent({
  name: 'EntityListItem',
  components: {
    AvatarInitials,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    firstName: {
      type: String,
      default: '',
    },
    lastName: {
      type: String,
      default: '',
    },
    avatarColor: {
      type: String,
      default: '',
    },
    removable: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['remove'],
});
</script>

<style scoped>
.entity-list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
}

.entity-info {
  flex: 1;
  min-width: 0;
}

.entity-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.entity-subtitle {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.entity-metadata {
  margin-top: 0.5rem;
}
</style>

