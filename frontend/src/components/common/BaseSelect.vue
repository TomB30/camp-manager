<template>
  <q-select
    clearable
    outlined
    dense
    options-dense
    :label="label"
    :style="style"
    :model-value="modelValue"
    @update:model-value="updateModelValue"
    :options="options"
    map-options
    emit-value
  />
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { QSelectOption } from "quasar";

export default defineComponent({
  name: "BaseSelect",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    options: {
      type: Array as PropType<QSelectOption[]>,
      required: true,
    },
    label: {
      type: String,
      default: "",
    },
    style: {
      type: String,
      default: "width: 180px",
    },
  },
  emits: ["update:modelValue"],
  methods: {
    updateModelValue(value: string | number | null) {
      this.$emit("update:modelValue", value ?? "");
    },
  },
});
</script>
