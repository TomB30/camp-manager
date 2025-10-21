<template>
  <BaseModal @close="cancel" modal-width="sm">
    <template #header>
      <h3>{{ title }}</h3>
    </template>
    <template #body>
      <p>{{ message }}</p>
      <p v-if="details" class="details">{{ details }}</p>
    </template>
    <template #footer>
      <BaseButton @click="cancel" label="Cancel" flat />
      <BaseButton
        :color="dangerMode ? 'negative' : 'primary'"
        outline
        @click="confirm"
        :label="confirmText"
      />
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseModal from "./BaseModal.vue";
import BaseButton from "./common/BaseButton.vue";

export default defineComponent({
  name: "ConfirmModal",
  props: {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      default: undefined,
    },
    confirmText: {
      type: String,
      default: "Confirm",
    },
    dangerMode: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    BaseModal,
    BaseButton,
  },
  emits: ["confirm", "cancel"],
  methods: {
    confirm() {
      this.$emit("confirm");
    },
    cancel() {
      this.$emit("cancel");
    },
  },
});
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
