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
          :label="isEditing ? 'Update Label' : 'Add Label'"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import BaseInput from "@/components/common/BaseInput.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import { useColorsStore } from "@/stores";
import type { Color } from "@/types";
import type { QForm } from "quasar";

interface LabelFormData {
  name: string;
  description?: string;
  colorId?: string;
}

export default defineComponent({
  name: "LabelFormModal",
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
      type: Object as PropType<LabelFormData>,
      required: true,
    },
  },
  emits: ["close", "save"],
  setup() {
    const colorsStore = useColorsStore();
    return { colorsStore };
  },
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
.form-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

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
