<template>
  <BaseButton
    icon="close"
    aria-label="Close"
    @click="$emit('click')"
    outline
    round
    color="grey-8"
    size="sm"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CloseButton",
});
</script>
