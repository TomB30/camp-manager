<template>
  <BaseModal :title="isEditing ? 'Edit Certification' : 'Add New Certification'" @close="$emit('close')">
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <div class="form-group">
          <label class="form-label">Certification Name</label>
          <BaseInput
            v-model="localFormData.name"
            placeholder="Enter certification name"
            :rules="[(val: string) => !!val || 'Enter certification name']"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <BaseInput
            v-model="descriptionModel"
            type="textarea"
            :rows="3"
            placeholder="Optional description"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Validity Period (months)</label>
          <BaseInput
            v-model="validityPeriodModel"
            type="number"
            placeholder="e.g., 12, 24, 36"
            :min="1"
            hint="How many months the certification remains valid"
          />
        </div>
      </q-form>
    </template>

    <template #footer>
      <div class="flex q-gutter-x-sm">
        <BaseButton flat @click="$emit('close')" label="Cancel" />
        <BaseButton color="primary" @click="handleSave" :label="isEditing ? 'Update Certification' : 'Add Certification'" />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import BaseInput from "@/components/common/BaseInput.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import type { QForm } from "quasar";

interface CertificationFormData {
  name: string;
  description: string;
  validityPeriodMonths: number | undefined;
}

export default defineComponent({
  name: "CertificationFormModal",
  components: {
    BaseModal,
    BaseInput,
    BaseButton,
  },
  props: {
    isEditing: {
      type: Boolean,
      default: false,
    },
    formData: {
      type: Object as PropType<CertificationFormData>,
      required: true,
    },
  },
  emits: ["close", "save"],
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData)),
      formRef: null as any,
    };
  },
  computed: {
    descriptionModel: {
      get(): string {
        return this.localFormData.description || "";
      },
      set(value: string) {
        this.localFormData.description = value || "";
      },
    },
    validityPeriodModel: {
      get(): string {
        return this.localFormData.validityPeriodMonths?.toString() || "";
      },
      set(value: string) {
        const num = parseInt(value);
        this.localFormData.validityPeriodMonths = isNaN(num) ? undefined : num;
      },
    },
  },
  watch: {
    formData: {
      handler(newVal) {
        this.localFormData = JSON.parse(JSON.stringify(newVal));
      },
      deep: true,
    },
  },
  methods: {
    async handleSave() {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      this.$emit("save", this.localFormData);
    },
  },
});
</script>

<style scoped>
.form-checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.form-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.form-checkbox-label {
  font-weight: 500;
  color: var(--text-primary);
}

.form-help-text {
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>
