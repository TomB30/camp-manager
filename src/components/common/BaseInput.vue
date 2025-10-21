<template>
  <q-input
    outlined
    dense
    :model-value="modelValue"
    no-error-icon
    @update:model-value="updateModelValue"
    v-bind="$attrs"
  >
    <template v-slot:prepend>
      <slot name="prepend"></slot>
    </template>
    <template v-slot:append>
      <slot name="append"></slot>
    </template>
  </q-input>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BaseInput",
  props: {
    modelValue: {
      type: String,
      required: true,
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
