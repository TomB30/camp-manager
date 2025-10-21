<template>
  <div class="selection-container">
    <div v-if="hasSelection" class="selected-items">
      <div v-for="itemId in selectedIds" :key="itemId" class="selected-item">
        <div class="item-info">
          <div class="item-avatar">
            {{ getInitials(itemId) }}
          </div>
          <span>{{ getLabel(itemId) }}</span>
        </div>
        <BaseButton
          outline
          round
          dense
          color="red-9"
          size="sm"
          icon="close"
          @click="removeItem(itemId)"
          :disabled="disabled"
        />
      </div>
      <slot name="after-items" />
    </div>
    <div v-else>
      {{ emptyText }}
    </div>

    <div v-if="showAddSection" class="add-item-section">
      <Autocomplete
        class="autocomplete-select"
        v-model="selectedToAdd"
        @update:model-value="addItem"
        :options="availableOptions"
        :placeholder="placeholder"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import Autocomplete, {
  type AutocompleteOption,
} from "@/components/Autocomplete.vue";

export default defineComponent({
  name: "SelectionList",
  components: {
    Autocomplete,
  },
  props: {
    modelValue: {
      type: [Array, String] as PropType<string[] | string>,
      required: true,
    },
    items: {
      type: Array as PropType<any[]>,
      required: true,
    },
    itemType: {
      type: String,
      default: "item",
    },
    placeholder: {
      type: String,
      default: "Select an item...",
    },
    emptyText: {
      type: String,
      default: "No items selected",
    },
    addButtonText: {
      type: String,
      default: "Add",
    },
    mode: {
      type: String as PropType<"single" | "multiple">,
      default: "multiple",
      validator: (value: string) => ["single", "multiple"].includes(value),
    },
    getLabelFn: {
      type: Function as PropType<(item: any) => string>,
      required: true,
    },
    getInitialsFn: {
      type: Function as PropType<(item: any) => string>,
      required: true,
    },
    getOptionsFn: {
      type: Function as PropType<(item: any) => AutocompleteOption>,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      selectedToAdd: "",
    };
  },
  computed: {
    selectedIds(): string[] {
      if (this.mode === "single") {
        return this.modelValue ? [this.modelValue as string] : [];
      }
      return this.modelValue as string[];
    },
    hasSelection(): boolean {
      return this.selectedIds.length > 0;
    },
    showAddSection(): boolean {
      if (this.mode === "single") {
        return !this.modelValue;
      }
      return true;
    },
    availableItems(): any[] {
      return this.items.filter((item) => !this.selectedIds.includes(item.id));
    },
    availableOptions(): AutocompleteOption[] {
      return this.availableItems.map((item) => this.getOptionsFn(item));
    },
  },
  methods: {
    getLabel(itemId: string): string {
      const item = this.items.find((i) => i.id === itemId);
      return item ? this.getLabelFn(item) : "Unknown";
    },
    getInitials(itemId: string): string {
      const item = this.items.find((i) => i.id === itemId);
      return item ? this.getInitialsFn(item) : "??";
    },
    addItem(): void {
      if (!this.selectedToAdd) return;

      if (this.mode === "single") {
        this.$emit("update:modelValue", this.selectedToAdd);
      } else {
        const currentIds = this.modelValue as string[];
        if (!currentIds.includes(this.selectedToAdd)) {
          this.$emit("update:modelValue", [...currentIds, this.selectedToAdd]);
        }
      }
      this.selectedToAdd = "";
    },
    removeItem(itemId: string): void {
      if (this.mode === "single") {
        this.$emit("update:modelValue", "");
      } else {
        const currentIds = this.modelValue as string[];
        this.$emit(
          "update:modelValue",
          currentIds.filter((id) => id !== itemId),
        );
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.selection-container {
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 0.75rem;
  background: var(--background);
}

.selected-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.selected-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  transition: background 0.15s ease;
}

.selected-item:hover {
  background: var(--surface);
}

.item-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.item-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.btn-remove {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  padding: 0;
  line-height: 1;
}

.btn-remove:hover:not(:disabled) {
  transform: scale(1.1);
}

.btn-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-item-section {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  align-items: center;

  .autocomplete-select {
    width: 100%;
  }
}

.mb-2 {
  margin-bottom: 0.5rem;
}
</style>
