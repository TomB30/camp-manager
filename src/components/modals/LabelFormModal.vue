<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Label' : 'Add New Label'"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label class="form-label">Label Name *</label>
          <input
            v-model="localFormData.name"
            type="text"
            class="form-input"
            placeholder="e.g., VIP, Beginner, Advanced"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea
            v-model="localFormData.description"
            class="form-input"
            placeholder="Optional description for this label"
            rows="2"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Color</label>
          <select v-model="localFormData.colorId" class="form-input">
            <option value="">No Color</option>
            <option v-for="color in colors" :key="color.id" :value="color.id">
              {{ color.name }}
            </option>
          </select>
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
      </form>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="handleSave">
        {{ isEditing ? "Update" : "Add" }} Label
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import { useColorsStore } from "@/stores";
import type { Color } from "@/types";

interface LabelFormData {
  name: string;
  description?: string;
  colorId?: string;
}

export default defineComponent({
  name: "LabelFormModal",
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
    };
  },
  computed: {
    colors(): Color[] {
      return this.colorsStore.colors;
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
    handleSave() {
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
