<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Color' : 'Add New Color'"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label class="form-label">Color Name *</label>
          <input
            v-model="localFormData.name"
            type="text"
            class="form-input"
            placeholder="e.g., Ocean Blue"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Hex Value *</label>
          <div class="color-input-group">
            <input
              v-model="localFormData.hexValue"
              type="text"
              class="form-input"
              placeholder="#3B82F6"
              pattern="^#[0-9A-Fa-f]{6}$"
              required
            />
            <input
              v-model="localFormData.hexValue"
              type="color"
              class="color-picker-input"
              title="Pick a color"
            />
          </div>
          <small class="form-hint">Format: #RRGGBB (e.g., #3B82F6)</small>
        </div>

        <div
          class="color-preview-large"
          :style="{ background: localFormData.hexValue || '#CCCCCC' }"
        >
          <span class="preview-label">Preview</span>
        </div>
      </form>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="handleSave">
        {{ isEditing ? "Update" : "Add" }} Color
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";

interface ColorFormData {
  name: string;
  hexValue: string;
}

export default defineComponent({
  name: "ColorFormModal",
  components: {
    BaseModal,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
    formData: {
      type: Object as PropType<ColorFormData>,
      required: true,
    },
  },
  emits: ["close", "save"],
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData)),
    };
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
    handleSave() {
      // Normalize hex value to uppercase
      this.localFormData.hexValue = this.localFormData.hexValue.toUpperCase();
      this.$emit("save", this.localFormData);
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
</style>
