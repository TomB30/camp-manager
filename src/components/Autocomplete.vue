<template>
  <q-select
    class="autocomplete-select"
    outlined
    dense
    :model-value="selectedOption"
    @update:model-value="updateModelValue"
    use-input
    emit-value
    input-debounce="0"
    :options="filteredOptions"
    @filter="filterFn"
    @clear="clearSelection"
    clearable
    no-error-icon
    :disable="disabled"
    v-bind="$attrs"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey"> {{ noOptionText }} </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts">
import { QSelectOption } from "quasar";
import { defineComponent, type PropType } from "vue";

export interface AutocompleteOption {
  label: string;
  value: any;
  disabled?: boolean;
  [key: string]: any;
}

export default defineComponent({
  name: "Autocomplete",
  props: {
    modelValue: {
      type: [String, Number, Boolean] as PropType<
        string | number | boolean | null
      >,
      default: null,
    },
    options: {
      type: Array as PropType<AutocompleteOption[] | any[]>,
      required: true,
    },
    placeholder: {
      type: String,
      default: "Search...",
    },
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    disabledTooltip: {
      type: String,
      default: "",
    },
    // If true, options are plain strings/numbers, not objects
    primitive: {
      type: Boolean,
      default: false,
    },
    // Custom function to get the label from an option
    optionLabel: {
      type: [String, Function] as PropType<string | ((option: any) => string)>,
      default: "label",
    },
    // Custom function to get the value from an option
    optionValue: {
      type: [String, Function] as PropType<string | ((option: any) => any)>,
      default: "value",
    },
    // Custom function to check if option is disabled
    optionDisabled: {
      type: [String, Function] as PropType<string | ((option: any) => boolean)>,
      default: "disabled",
    },
    // Filter mode: 'contains' or 'startsWith'
    filterMode: {
      type: String as PropType<"contains" | "startsWith">,
      default: "contains",
    },
    // Maximum height for dropdown
    maxHeight: {
      type: Number,
      default: 300,
    },
    // Show clear button
    showClear: {
      type: Boolean,
      default: true,
    },
    noOptionText: {
      type: String,
      default: "No results",
    },
  },
  emits: ["update:modelValue", "change"],
  data() {
    return {
      filteredOptions: [] as QSelectOption[],
    };
  },
  computed: {
    selectedOption(): QSelectOption | null {
      return (
        this.options.find(
          (option: QSelectOption) => option.value === this.modelValue,
        ) || null
      );
    },
  },
  methods: {
    filterFn(
      val: string | number | boolean | null,
      update: (callback: () => void) => void,
    ) {
      if (val === "") {
        update(() => {
          this.filteredOptions = this.options;
        });
        return;
      }

      update(() => {
        const needle = val?.toString().toLowerCase() || "";
        this.filteredOptions = this.options.filter((option: QSelectOption) => {
          return option.label.toLowerCase().indexOf(needle) > -1;
        });
      });
    },
    updateModelValue(value: string | number | boolean | null) {
      this.$emit("update:modelValue", value ?? "");
    },
    clearSelection() {
      this.$emit("update:modelValue", null);
    },
  },
});
</script>

<style scoped></style>
