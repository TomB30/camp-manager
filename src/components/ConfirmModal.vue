<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="cancel">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3>{{ title }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
          <p v-if="details" class="details">{{ details }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancel">Cancel</button>
          <button 
            class="btn" 
            :class="dangerMode ? 'btn-error' : 'btn-primary'" 
            @click="confirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps<{
  show: boolean;
  title: string;
  message: string;
  details?: string;
  confirmText?: string;
  dangerMode?: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const confirm = () => {
  emit('confirm');
};

const cancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.confirm-modal {
  max-width: 500px;
}

.modal-body p {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.details {
  color: var(--text-secondary);
  font-size: 0.875rem;
  padding: 0.75rem;
  background: var(--surface-secondary);
  border-radius: var(--radius);
  border-left: 3px solid var(--warning-color);
}
</style>

