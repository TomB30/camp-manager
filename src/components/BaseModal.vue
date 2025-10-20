<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="handleOverlayClick">
      <div class="modal" :class="modalClass">
        <div class="modal-header">
          <div class="modal-header-content">
            <slot name="header">
              <h3>{{ title }}</h3>
              <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
            </slot>
          </div>
          <button
            class="btn btn-icon btn-secondary"
            @click="close"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div class="modal-body">
          <slot name="body"></slot>
        </div>

        <div v-if="$slots.footer || showDefaultFooter" class="modal-footer">
          <slot name="footer">
            <button class="btn btn-secondary" @click="close">
              {{ cancelText }}
            </button>
            <button
              v-if="primaryAction"
              class="btn btn-primary"
              @click="handlePrimaryAction"
              :disabled="primaryDisabled"
            >
              {{ primaryText }}
            </button>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BaseModal",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    subtitle: {
      type: String,
      default: "",
    },
    modalClass: {
      type: String,
      default: "",
    },
    closeOnOverlay: {
      type: Boolean,
      default: true,
    },
    showDefaultFooter: {
      type: Boolean,
      default: false,
    },
    primaryAction: {
      type: Boolean,
      default: false,
    },
    primaryText: {
      type: String,
      default: "Save",
    },
    primaryDisabled: {
      type: Boolean,
      default: false,
    },
    cancelText: {
      type: String,
      default: "Cancel",
    },
  },
  emits: ["close", "primary-action"],
  methods: {
    close() {
      this.$emit("close");
    },
    handleOverlayClick() {
      if (this.closeOnOverlay) {
        this.close();
      }
    },
    handlePrimaryAction() {
      this.$emit("primary-action");
    },
  },
});
</script>

<style scoped>
.modal-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  font-weight: normal;
}

.modal-header-content {
  flex: 1;
  min-width: 0;
}

.modal-header-content h3 {
  margin: 0;
}
</style>
