<template>
  <div class="loading-state">
    <div class="spinner-container">
      <div class="spinner"></div>
    </div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "LoadingState",
  props: {
    message: {
      type: String,
      default: "Loading...",
    },
  },
});
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  min-height: 300px;
}

.spinner-container {
  margin-bottom: 1.5rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-light);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-message {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--text-secondary);
  font-weight: 500;
}
</style>

