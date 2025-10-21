<template>
  <q-dialog model-value @hide="close">
    <q-card class="modal" :style="{ width: modalWidthPx, maxWidth: modalWidthPx }">
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
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "BaseModal",
  props: {
    title: {
      type: String,
      default: "",
    },
    subtitle: {
      type: String,
      default: "",
    },
    modalWidth: {
      type: String as PropType<"sm" | "md" | "lg">,
      default: "md",
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
  computed: {
    modalWidthPx(): string {
      switch (this.modalWidth) {
        case "sm":
          return "400px";
        case "md":
          return "600px";
        case "lg":
          return "800px";
        default:
          return "800px";
      }
    },
  },
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
.modal-sm {
  max-width: 400px !important;
}

.modal-md {
  max-width: 600px !important;
}

.modal-lg {
  max-width: 800px !important;
}

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
