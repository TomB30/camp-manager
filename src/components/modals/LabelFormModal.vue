<template>
  <BaseModal
    :title="isEditing ? 'Edit Label' : 'Add New Label'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <div class="form-group">
          <label class="form-label">Label Name</label>
          <BaseInput
            v-model="localFormData.meta.name"
            placeholder="e.g., VIP, Beginner, Advanced"
            :rules="[(val: string) => !!val || 'Enter label name']"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <BaseInput
            v-model="descriptionModel"
            type="textarea"
            :rows="2"
            placeholder="Description for this label"
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
          :loading="loading"
          :label="isEditing ? 'Update Label' : 'Add Label'"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import { type QForm } from "quasar";
import { LabelCreationRequest } from "@/services";
import { useLabelsStore } from "@/stores";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "LabelFormModal",
  components: {
    BaseModal,
  },
  props: {
    labelId: {
      type: String as PropType<string>,
      required: false,
    },
  },
  emits: ["close", "save"],
  setup() {
    const labelsStore = useLabelsStore();
    const toast = useToast();
    return { labelsStore, toast };
  },
  data() {
    return {
      localFormData: {
        meta: {
          name: "",
          description: "",
        },
      } as LabelCreationRequest,
      formRef: null as any,
      loading: false,
    };
  },
  created() {
    if (!this.labelId) return;
    const label = this.labelsStore.getLabelById(this.labelId);
    if (!label) return;
    this.localFormData = {
      meta: {
        name: label.meta.name,
        description: label.meta.description || "",
      },
    };
  },
  computed: {
    isEditing(): boolean {
      return !!this.labelId;
    },
    descriptionModel: {
      get(): string {
        return this.localFormData.meta.description || "";
      },
      set(value: string) {
        this.localFormData.meta.description = value || undefined;
      },
    },
  },
  methods: {
    async handleSave() {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      if (this.labelId) {
        await this.updateLabel();
      } else {
        await this.createLabel();
      }
    },
    async updateLabel(): Promise<void> {
      if (!this.labelId) return;
      try {
        this.loading = true;
        await this.labelsStore.updateLabel(this.labelId, this.localFormData);
        this.toast.success("Label updated successfully");
      } catch (error) {
        this.toast.error((error as Error).message || "Failed to update label");
      } finally {
        this.loading = false;
        this.$emit("close");
      }
    },
    async createLabel() {
      try {
        this.loading = true;
        await this.labelsStore.addLabel(this.localFormData);
        this.toast.success("Label created successfully");
      } catch (error) {
        this.toast.error((error as Error).message || "Failed to create label");
      } finally {
        this.loading = false;
        this.$emit("close");
      }
    },
  },
});
</script>

<style scoped lang="scss">
.color-preview-large {
  height: 100px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--border-light);
  transition: all 0.2s ease;
}

.preview-label {
  color: white;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-size: 1.125rem;
  letter-spacing: 0.05em;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius);
}
</style>
