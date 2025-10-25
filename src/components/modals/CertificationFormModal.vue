<template>
  <BaseModal
    :title="isEditing ? 'Edit Certification' : 'Add New Certification'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <div class="form-group">
          <label class="form-label">Certification Name</label>
          <BaseInput
            v-model="formModel.name"
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
        <BaseButton
          color="primary"
          @click="handleSave"
          :label="isEditing ? 'Update Certification' : 'Add Certification'"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import type { QForm } from "quasar";
import type { CertificationCreationRequest } from "@/types";
import { useCertificationsStore } from "@/stores";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "CertificationFormModal",
  components: {
    BaseModal,
  },
  props: {
    certificationId: {
      type: String as PropType<string>,
      required: false,
    },
  },
  emits: ["close"],
  data() {
    return {
      formModel: {
        name: "",
        description: "",
        validityPeriodMonths: undefined,
      } as CertificationCreationRequest,
      formRef: null as any,
      loading: false as boolean,
    };
  },
  created() {
    if (!this.certificationId) return;

    const certification = this.certificationsStore.getCertificationById(
      this.certificationId,
    );
    if (!certification) return;

    this.formModel = {
      name: certification.name,
      description: certification.description || "",
      validityPeriodMonths: certification.validityPeriodMonths || undefined,
    };
  },
  setup() {
    const certificationsStore = useCertificationsStore();
    const toast = useToast();
    return { certificationsStore, toast };
  },
  computed: {
    isEditing(): boolean {
      return !!this.certificationId;
    },
    descriptionModel: {
      get(): string {
        return this.formModel.description || "";
      },
      set(value: string) {
        this.formModel.description = value || "";
      },
    },
    validityPeriodModel: {
      get(): string {
        return this.formModel.validityPeriodMonths?.toString() || "";
      },
      set(value: string) {
        const num = parseInt(value);
        this.formModel.validityPeriodMonths = isNaN(num) ? undefined : num;
      },
    },
  },
  methods: {
    async handleSave(): Promise<void> {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      if (this.isEditing) {
        return this.updateCertification();
      }
      return this.createCertification();
    },
    async createCertification(): Promise<void> {
      try {
        this.loading = true;
        await this.certificationsStore.createCertification(this.formModel);
        this.toast.success("Certification created successfully");
      } catch (error) {
        this.toast.error(
          (error as Error).message || "Failed to create certification",
        );
      } finally {
        this.loading = false;
        this.$emit("close");
      }
    },
    async updateCertification(): Promise<void> {
      if (!this.certificationId) return;
      try {
        this.loading = true;
        await this.certificationsStore.updateCertification(
          this.certificationId,
          this.formModel,
        );
        this.toast.success("Certification updated successfully");
      } catch (error) {
        this.toast.error(
          (error as Error).message || "Failed to update certification",
        );
      } finally {
        this.loading = false;
        this.$emit("close");
      }
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
