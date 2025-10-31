<template>
  <q-btn v-bind="$attrs" no-caps @click.stop="$emit('click')">
    <slot></slot>
  </q-btn>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BaseButton",
  emits: ["click"],
});
</script>
