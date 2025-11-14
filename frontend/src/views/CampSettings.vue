<template>
  <div class="camp-settings-container">
    <RouterView />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CampSettings",
});
</script>

<style scoped>
.camp-settings-container {
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 2rem;
}
</style>
