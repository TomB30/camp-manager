<template>
  <BaseModal
    :title="isEditing ? 'Edit Color' : 'Add New Color'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <div class="form-group">
          <label class="form-label">Color Name</label>
          <BaseInput
            v-model="formModel.name"
            placeholder="e.g., Ocean Blue"
            :rules="[(val: string) => !!val || 'Enter color name']"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Hex Value</label>
          <BaseInput
            v-model="formModel.hexValue"
            placeholder="#3B82F6"
            :rules="[(val: string) => !!val || 'Enter hex value']"
          >
            <template v-slot:append>
              <q-icon name="colorize" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-color v-model="formModel.hexValue" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </BaseInput>
        </div>

        <div
          class="color-preview-large"
          :style="{ background: formModel.hexValue || '#CCCCCC' }"
        >
          <span class="preview-label">Preview</span>
        </div>
      </q-form>
    </template>

    <template #footer>
      <div class="flex q-gutter-x-sm">
        <BaseButton flat @click="$emit('close')" label="Cancel" />
        <BaseButton
          color="primary"
          @click="handleSave"
          :label="isEditing ? 'Update color' : 'Create color'"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import type { ColorCreationRequest } from "@/types";
import { useColorsStore } from "@/stores";
import type { QForm } from "quasar";
import { useToast } from "@/composables/useToast";
export default defineComponent({
  name: "ColorFormModal",
  setup() {
    const colorsStore = useColorsStore();
    const toast = useToast();
    return { colorsStore, toast };
  },
  components: {
    BaseModal,
  },
  props: {
    colorId: {
      type: String as PropType<string>,
      required: false,
    },
  },
  emits: ["close"],
  data() {
    return {
      formModel: {
        name: "",
        hexValue: "",
      } as ColorCreationRequest,
      formRef: null as any,
      loading: false as boolean,
    };
  },
  created() {
    if (this.colorId) {
      const editingColor = this.colorsStore.getColorById(this.colorId);
      if (editingColor) {
        this.formModel = {
          name: editingColor.name,
          hexValue: editingColor.hexValue,
        };
      }
    }
  },
  computed: {
    isEditing(): boolean {
      return !!this.colorId;
    },
  },
  methods: {
    async handleSave(): Promise<void> {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      if (this.isEditing) {
        return this.updateColor();
      }
      return this.createColor();
    },
    async updateColor(): Promise<void> {
      if (!this.colorId) return;

      try {
        this.loading = true;
        this.formModel.hexValue = this.formModel.hexValue.toUpperCase();
        await this.colorsStore.updateColor(this.colorId, this.formModel);
        this.toast.success("Color updated successfully");
      } catch (error) {
        this.toast.error((error as Error).message || "Failed to update color");
      } finally {
        this.loading = false;
        this.$emit("close");
      }
    },
    async createColor(): Promise<void> {
      try {
        this.loading = true;
        this.formModel.hexValue = this.formModel.hexValue.toUpperCase();
        await this.colorsStore.createColor(this.formModel);
        this.toast.success("Color created successfully");
      } catch (error) {
        this.toast.error((error as Error).message || "Failed to create color");
      } finally {
        this.loading = false;
        this.$emit("close");
      }
    },
  },
});
</script>

<style scoped>
.color-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-input-group .form-input {
  flex: 1;
}

.color-picker-input {
  width: 60px;
  height: 42px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  padding: 4px;
  background: white;
}

.color-picker-input:hover {
  border-color: var(--primary-color);
}

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
}

.colors-form-modal-footer {
  width: 100%;
}
</style>
