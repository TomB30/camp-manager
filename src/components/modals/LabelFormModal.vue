<template>
  <BaseModal
    :title="isEditing ? 'Edit Label' : 'Add New Label'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <div class="form-group">
          <label class="form-label">Label Name *</label>
          <BaseInput
            v-model="localFormData.name"
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
            placeholder="Optional description for this label"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Color</label>
          <q-select
            v-model="localFormData.colorId"
            :options="colorOptions"
            outlined
            dense
            emit-value
            map-options
            option-value="value"
            option-label="label"
          />
          <small v-if="!colors.length" class="form-hint text-secondary">
            No colors available. Create colors in the Colors tab first.
          </small>
        </div>

        <div
          v-if="selectedColor"
          class="color-preview-large"
          :style="{ background: selectedColor.hexValue }"
        >
          <span class="preview-label">{{
            localFormData.name || "Label Preview"
          }}</span>
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
import { useColorsStore } from "@/stores";
import type { Color } from "@/types";
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
    const colorsStore = useColorsStore();
    const labelsStore = useLabelsStore();
    const toast = useToast();
    return { colorsStore, labelsStore, toast };
  },
  data() {
    return {
      localFormData: {
        name: "",
        description: "",
        colorId: "",
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
      name: label.name,
      description: label.description || "",
      colorId: label.colorId || "",
    };
  },
  computed: {
    isEditing(): boolean {
      return !!this.labelId;
    },
    descriptionModel: {
      get(): string {
        return this.localFormData.description || "";
      },
      set(value: string) {
        this.localFormData.description = value || undefined;
      },
    },
    colors(): Color[] {
      return this.colorsStore.colors;
    },
    colorOptions() {
      return [
        { label: "No Color", value: "" },
        ...this.colors.map((color) => ({
          label: color.name,
          value: color.id,
        })),
      ];
    },
    selectedColor(): Color | undefined {
      if (this.localFormData.colorId) {
        return this.colorsStore.getColorById(this.localFormData.colorId);
      }
      return undefined;
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
    }
  }
})
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
