<template>
  <div class="selector-container rounded-borders" :class="{ flat: flat }">
    <q-select
      ref="selectRef"
      :model-value="modelValue"
      @update:model-value="updateModelValue"
      :options="filteredOptions"
      :multiple="multiple"
      :label="label"
      :disable="disable"
      outlined
      dense
      use-input
      hide-selected
      emit-value
      map-options
      @filter="filterFn"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            {{ noOptionText }}
          </q-item-section>
        </q-item>
      </template>
      <template v-slot:option="scope">
        <q-item :="scope.itemProps">
          <q-item-section>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>

          <q-tooltip v-if="scope.opt.disabledTooltip">{{
            scope.opt.disabledTooltip
          }}</q-tooltip>
        </q-item>
      </template>
    </q-select>
    <div v-if="selectedOptions.length > 0" class="selection-list q-mt-md">
      <div v-for="item in selectedOptions" :key="item.value">
        <div class="selection-list-item row justify-between items-center">
          <span>{{ item.label }}</span>
          <BaseButton
            outline
            color="red-9"
            icon="close"
            round
            dense
            size="sm"
            @click="removeItem(item.value)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { QSelect } from "quasar";
import { defineComponent, type PropType } from "vue";
// Types
export interface ISelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export default defineComponent({
  name: "SelectionList",
  props: {
    modelValue: {
      type: [Array, String] as PropType<string[] | string>,
      required: true,
    },
    options: {
      type: Array as PropType<ISelectOption[]>,
      required: true,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: "Select...",
    },
    disable: {
      type: Boolean,
      default: false,
    },
    disabledTooltip: {
      type: String,
      default: "",
    },
    flat: {
      type: Boolean,
      default: false,
    },
    noOptionText: {
      type: String,
      default: "No options found",
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      filteredOptions: [] as ISelectOption[],
    };
  },
  computed: {
    selectedOptions(): ISelectOption[] {
      return this.options.filter((option) =>
        this.modelValue.includes(option.value)
      );
    },
  },
  methods: {
    filterFn(val: string, update: (callback: () => void) => void) {
      if (val === "") {
        update(() => {
          this.filteredOptions = this.options;
        });
        return;
      }

      update(() => {
        const needle = val.toLowerCase();
        this.filteredOptions = this.options.filter((option) => {
          return option.label.toLowerCase().indexOf(needle) > -1;
        });
      });
    },
    removeItem(value: string) {
      if (this.multiple && Array.isArray(this.modelValue)) {
        this.$emit(
          "update:modelValue",
          this.modelValue.filter((item) => item !== value)
        );
      } else {
        this.$emit("update:modelValue", "");
      }
    },
    updateModelValue(value: string[] | string) {
      if (!this.multiple) {
        (this.$refs.selectRef as QSelect).blur();
      }
      this.$emit("update:modelValue", value);
    },
  },
});
</script>

<style lang="scss" scoped>
.selector-container {
  border: 1px solid var(--border-color);
  padding: 0.5rem;

  &.flat {
    border: none;
    padding: 0;
  }
}

.selection-list {
  display: grid;
  gap: 0.5rem;
}

.selection-list-item {
  border: 1px solid var(--border-light);
  padding: 0.5rem;
  background: var(--surface-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}
</style>
