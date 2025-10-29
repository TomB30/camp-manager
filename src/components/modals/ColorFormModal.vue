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
            v-model="formModel.meta.name"
            placeholder="e.g., Ocean Blue"
            :rules="[(val: string) => !!val || 'Enter color name']"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Select Color</label>

          <div class="color-search-box">
            <BaseInput
              v-model="formModel.spec.hexValue"
              placeholder='Try "#00c4cc"'
              :rules="[validateHexColor]"
              class="hex-input"
            >
              <template #prepend>
                <q-icon name="search" size="20px" class="search-icon" />
              </template>
            </BaseInput>
          </div>

          <!-- Preset Colors -->
          <div class="preset-colors-section">
            <div class="color-grid">
              <div
                v-for="color in presetColors"
                :key="color.hex"
                class="color-swatch"
                :class="{ selected: formModel.spec.hexValue === color.hex }"
                :style="{ background: color.hex }"
                @click="selectColor(color.hex)"
                :title="color.name"
              >
                <q-icon
                  v-if="formModel.spec.hexValue === color.hex"
                  name="check"
                  color="white"
                  size="20px"
                />
              </div>

              <!-- Add Custom Color Button -->
              <div
                class="color-swatch add-custom-btn"
                @click="showColorPicker = true"
                title="Choose custom color"
              >
                <q-icon name="add" size="20px" />
              </div>
            </div>
          </div>

          <!-- Color Picker Dialog -->
          <q-dialog v-model="showColorPicker">
            <q-card style="min-width: 300px">
              <q-card-section>
                <div class="text-h6">Choose Custom Color</div>
              </q-card-section>
              <q-card-section>
                <q-color
                  v-model="formModel.spec.hexValue"
                  default-view="palette"
                  no-header
                />
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Done" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>

        <!-- Color Preview -->
        <div
          class="color-preview-large"
          :style="{ background: formModel.spec.hexValue || '#CCCCCC' }"
        >
          <span class="preview-label">Preview</span>
        </div>

        <div class="form-group">
          <q-checkbox
            v-model="formModel.spec.default"
            label="Set as default color"
          />
          <p class="form-help-text">
            The default color will be used for events not created from activity
            templates. Only one color can be set as default.
          </p>
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
import type { ColorCreationRequest } from "@/generated/api";
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
        meta: {
          name: "",
          description: "",
        },
        spec: {
          hexValue: "",
          default: false,
        },
      } as ColorCreationRequest,
      formRef: null as any,
      loading: false as boolean,
      showColorPicker: false as boolean,
      presetColors: [
        // Grayscale
        { name: "Black", hex: "#000000" },
        { name: "Dark Gray", hex: "#4A4A4A" },
        { name: "Medium Gray", hex: "#6B6B6B" },
        { name: "Gray", hex: "#9B9B9B" },
        { name: "Light Gray", hex: "#BDBDBD" },
        { name: "Silver", hex: "#D9D9D9" },
        { name: "White", hex: "#FFFFFF" },

        // Reds
        { name: "Red", hex: "#E53935" },
        { name: "Coral", hex: "#EF5350" },
        { name: "Pink", hex: "#EC407A" },
        { name: "Light Pink", hex: "#CE93D8" },
        { name: "Purple", hex: "#AB47BC" },
        { name: "Deep Purple", hex: "#7E57C2" },
        { name: "Indigo", hex: "#5E35B1" },

        // Blues
        { name: "Teal", hex: "#26A69A" },
        { name: "Cyan", hex: "#26C6DA" },
        { name: "Light Blue", hex: "#4DD0E1" },
        { name: "Sky Blue", hex: "#42A5F5" },
        { name: "Blue", hex: "#5C6BC0" },
        { name: "Navy Blue", hex: "#1E88E5" },
        { name: "Dark Blue", hex: "#1A237E" },

        // Greens & Yellows
        { name: "Green", hex: "#43A047" },
        { name: "Light Green", hex: "#7CB342" },
        { name: "Lime", hex: "#C0CA33" },
        { name: "Yellow", hex: "#FFD54F" },
        { name: "Amber", hex: "#FFCA28" },
        { name: "Orange", hex: "#FFA726" },
        { name: "Deep Orange", hex: "#FF7043" },

        // Additional Colors
        { name: "Maroon", hex: "#8D3E3E" },
        { name: "Brown", hex: "#795548" },
        { name: "Mint", hex: "#80CBC4" },
        { name: "Turquoise", hex: "#00BCD4" },
        { name: "Lavender", hex: "#B39DDB" },
        { name: "Peach", hex: "#FFAB91" },
        { name: "Olive", hex: "#9E9D24" },
      ],
    };
  },
  created() {
    if (this.colorId) {
      const editingColor = this.colorsStore.getColorById(this.colorId);
      if (editingColor) {
        this.formModel = {
          meta: {
            name: editingColor.meta.name,
            description: editingColor.meta.description,
          },
          spec: {
            hexValue: editingColor.spec.hexValue,
            default: editingColor.spec.default || false,
          },
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
    selectColor(hex: string): void {
      this.formModel.spec.hexValue = hex;
    },
    validateHexColor(val: string): boolean | string {
      if (!val) return "Please select or enter a color";

      // Allow common color names or hex values
      const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (hexPattern.test(val)) {
        return true;
      }

      return "Enter a valid hex color (e.g., #00c4cc)";
    },
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
        this.formModel.spec.hexValue =
          this.formModel.spec.hexValue.toUpperCase();
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
        this.formModel.spec.hexValue =
          this.formModel.spec.hexValue.toUpperCase();
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
.color-search-box {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-secondary);
  z-index: 1;
  pointer-events: none;
}

.color-search-box :deep(.q-field__control) {
  padding-left: 40px;
}

.hex-input {
  flex: 1;
}

.current-color-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--background-light);
  border-radius: var(--radius);
}

.current-color-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.75rem;
}

.color-hex-label {
  font-family: monospace;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.section-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.preset-colors-section {
  margin-bottom: 1.5rem;
}

.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.color-swatch {
  width: 35px;
  height: 35px;
  aspect-ratio: 1;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-swatch:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.color-swatch.selected {
  border-color: var(--primary-color);
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.color-swatch.add-custom-btn {
  background: white;
  border: 2px solid var(--border-light);
  color: var(--text-secondary);
  box-shadow: none;
}

.color-swatch.add-custom-btn:hover {
  border-color: var(--primary-color);
  border-style: solid;
  color: var(--primary-color);
  background: var(--background-light);
}

.form-help-text {
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.color-preview-large {
  height: 100px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .color-grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 0.5rem;
  }
}
</style>
