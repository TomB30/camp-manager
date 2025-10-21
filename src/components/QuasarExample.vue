<template>
  <div class="q-pa-md">
    <div class="text-h4 q-mb-md">Quasar UI Components Example</div>

    <!-- Buttons -->
    <div class="q-mb-md">
      <div class="text-h6 q-mb-sm">Buttons</div>
      <div class="q-gutter-sm">
        <q-btn color="primary" label="Primary" />
        <q-btn color="secondary" label="Secondary" />
        <q-btn color="accent" label="Accent" />
        <q-btn outline color="primary" label="Outline" />
        <q-btn flat color="primary" label="Flat" />
      </div>
    </div>

    <!-- Card -->
    <div class="q-mb-md">
      <div class="text-h6 q-mb-sm">Card</div>
      <q-card class="my-card" style="max-width: 400px">
        <q-card-section>
          <div class="text-h6">Card Title</div>
          <div class="text-subtitle2">Card Subtitle</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          This is a Quasar card component. It's perfect for displaying grouped
          information in a clean, organized way.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat color="primary" label="Cancel" />
          <q-btn flat color="primary" label="OK" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Form Inputs -->
    <div class="q-mb-md" style="max-width: 400px">
      <div class="text-h6 q-mb-sm">Form Inputs</div>
      <q-input
        v-model="textInput"
        label="Text Input"
        class="q-mb-md"
        outlined
      />

      <q-select
        v-model="selectedOption"
        :options="options"
        label="Select"
        class="q-mb-md"
        outlined
      />

      <q-toggle v-model="toggleValue" label="Toggle Option" class="q-mb-md" />

      <q-checkbox v-model="checkboxValue" label="Checkbox Option" />
    </div>

    <!-- Icons -->
    <div class="q-mb-md">
      <div class="text-h6 q-mb-sm">Icons (Material Icons)</div>
      <div class="q-gutter-sm">
        <q-icon name="home" size="32px" color="primary" />
        <q-icon name="settings" size="32px" color="secondary" />
        <q-icon name="favorite" size="32px" color="red" />
        <q-icon name="star" size="32px" color="amber" />
        <q-icon name="info" size="32px" color="blue" />
      </div>
    </div>

    <!-- Chips -->
    <div class="q-mb-md">
      <div class="text-h6 q-mb-sm">Chips</div>
      <div class="q-gutter-sm">
        <q-chip color="primary" text-color="white" icon="bookmark">
          Chip with icon
        </q-chip>
        <q-chip color="secondary" text-color="white" removable>
          Removable chip
        </q-chip>
        <q-chip outline color="primary" icon="event"> Outlined chip </q-chip>
      </div>
    </div>

    <!-- Badge -->
    <div class="q-mb-md">
      <div class="text-h6 q-mb-sm">Badge</div>
      <q-btn color="primary" label="Notifications">
        <q-badge color="red" floating>5</q-badge>
      </q-btn>
    </div>

    <!-- Banner -->
    <div class="q-mb-md">
      <div class="text-h6 q-mb-sm">Banner</div>
      <q-banner v-if="showBanner" class="bg-primary text-white" rounded>
        <template #avatar>
          <q-icon name="info" />
        </template>
        This is a banner component for displaying important information.
        <template #action>
          <q-btn flat label="Dismiss" @click="showBanner = false" />
        </template>
      </q-banner>
      <q-btn
        v-else
        color="primary"
        label="Show Banner"
        @click="showBanner = true"
      />
    </div>

    <!-- Linear Progress -->
    <div class="q-mb-md">
      <div class="text-h6 q-mb-sm">Progress</div>
      <q-linear-progress :value="0.7" color="primary" class="q-mb-sm" />
      <q-linear-progress
        :value="0.5"
        color="secondary"
        stripe
        class="q-mb-sm"
      />
      <q-circular-progress
        :value="0.75"
        size="50px"
        color="primary"
        :thickness="0.22"
        track-color="grey-3"
      >
        75%
      </q-circular-progress>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const textInput = ref("");
const selectedOption = ref(null);
const options = ["Option 1", "Option 2", "Option 3"];
const toggleValue = ref(false);
const checkboxValue = ref(false);
const showBanner = ref(true);
</script>

<style scoped>
.my-card {
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}
</style>

