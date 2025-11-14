<template>
  <section class="card">
    <section class="card-header">
      <slot name="icon"></slot>
      <div class="card-header-content">
        <h3 class="card-title">
          <slot name="title"></slot>
        </h3>
        <p class="card-description">
          <slot name="description"></slot>
        </p>
      </div>
    </section>
    <section class="card-body">
      <slot name="body"></slot>
    </section>
    <section class="card-footer">
      <slot name="footer"></slot>
    </section>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BaseCard",
});
</script>

<style lang="scss" scoped></style>
