<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="[`toast-${toast.type}`, { 'toast-with-details': toast.details }]"
          @click="removeToast(toast.id)"
        >
          <div class="toast-icon">
            <Icon name="CheckCircle" v-if="toast.type === 'success'" :size="20" />
            <Icon name="AlertCircle" v-if="toast.type === 'error'" :size="20" />
            <Icon name="Info" v-if="toast.type === 'info'" :size="20" />
            <Icon name="AlertTriangle" v-if="toast.type === 'warning'" :size="20" />
          </div>
          <div class="toast-content">
            <div class="toast-message">{{ toast.message }}</div>
            <div v-if="toast.details" class="toast-details">{{ toast.details }}</div>
          </div>
          <button class="toast-close" @click.stop="removeToast(toast.id)">
            <Icon name="X" :size="16" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Icon from './Icon.vue';
import { useToastStore } from '@/stores/toastStore';

export default defineComponent({
  name: 'Toast',
  components: {
    Icon,
  },
  setup() {
    const toastStore = useToastStore();

    const removeToast = (id: string) => {
      toastStore.removeToast(id);
    };

    return {
      toasts: toastStore.toasts,
      removeToast,
    };
  },
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
  max-width: 420px;
}

.toast {
  display: flex;
  align-items: start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--radius);
  background: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 320px;
  max-width: 420px;
}

.toast:hover {
  transform: translateX(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.toast-success {
  border-left: 4px solid #10B981;
}

.toast-success .toast-icon {
  color: #10B981;
}

.toast-error {
  border-left: 4px solid #EF4444;
}

.toast-error .toast-icon {
  color: #EF4444;
}

.toast-info {
  border-left: 4px solid #3B82F6;
}

.toast-info .toast-icon {
  color: #3B82F6;
}

.toast-warning {
  border-left: 4px solid #F59E0B;
}

.toast-warning .toast-icon {
  color: #F59E0B;
}

.toast-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-message {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  word-wrap: break-word;
}

.toast-with-details .toast-message {
  margin-bottom: 0.5rem;
}

.toast-details {
  font-size: 0.875rem;
  color: var(--text-secondary);
  white-space: pre-line;
  word-wrap: break-word;
  max-height: 200px;
  overflow-y: auto;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--error-color);
  border-radius: 4px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  background: #FEF2F2;
  color: #DC2626;
}

/* Toast animations */
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(50px) scale(0.95);
}

.toast-move {
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .toast-container {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    max-width: none;
  }

  .toast {
    min-width: auto;
    max-width: none;
  }
}
</style>

