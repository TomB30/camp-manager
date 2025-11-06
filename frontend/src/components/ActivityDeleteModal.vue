<template>
  <BaseModal :title="activity?.meta.name || ''" @close="$emit('close')">
    <template #header>
      <h3>Delete Activity</h3>
    </template>
    <template #body>
      <div class="q-mb-md">
        <p>Are you sure you want to delete this activity?</p>
        <p>
          Deleting an activity will delete all the events that were created from
          it. This action cannot be undone.
        </p>
      </div>
    </template>
    <template #footer>
      <BaseButton flat color="grey-8" @click="$emit('close')" label="Cancel" />
      <BaseButton
        outline
        color="negative"
        @click="deleteActivity"
        label="Delete"
      />
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Activity } from "@/generated/api";
import BaseModal from "./BaseModal.vue";
import { useActivitiesStore } from "@/stores/activitiesStore";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "ActivityDeleteModal",
  components: {
    BaseModal,
  },
  props: {
    activity: {
      type: Object as PropType<Activity>,
      required: true,
    },
    programId: {
      type: String as PropType<string>,
      required: true,
    },
  },
  emits: ["close", "delete"],
  data() {
    return {
      activitiesStore: useActivitiesStore(),
    };
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  methods: {
    async deleteActivity() {
      try {
        await this.activitiesStore.deleteActivity(this.activity.meta.id);
        this.toast.success("Activity deleted successfully");
      } catch (error: any) {
        console.error("Error deleting activity", error);
        this.toast.error(error.message || "Failed to delete activity");
      }
      this.$emit("close");
    },
  },
});
</script>
