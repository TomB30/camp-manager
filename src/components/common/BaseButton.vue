<template>
    <q-btn
        v-bind="$attrs"
        no-caps
        @click="$emit('click')"
    >
        <slot></slot>
    </q-btn>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "BaseButton",
    emits: ["click"],
    methods: {
        handleClick() {
            this.$emit("click");
        },
    },
});
</script>