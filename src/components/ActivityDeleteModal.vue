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
          it.
          <span v-if="hasMultiplePrograms">
            <br />
            <strong>Note:</strong> If you choose not to delete the activity
            entirely (i.e., only remove it from one program), any events created
            from this activity <b>will not be deleted</b>.
          </span>
        </p>
      </div>
      <template v-if="hasMultiplePrograms">
        <p>This activity is assigned to multiple programs.</p>
        <q-option-group
          type="radio"
          inline
          v-model="deleteOption"
          :options="deleteOptions"
        />
      </template>
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
      deleteOption: "all",
      activitiesStore: useActivitiesStore(),
    };
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  computed: {
    deleteOptions(): { label: string; value: string }[] {
      return [
        { label: "Delete it from all programs", value: "all" },
        { label: "Delete it from this program", value: "this" },
      ];
    },
    hasMultiplePrograms(): boolean {
      return this.activity.spec.programIds.length > 1;
    },
  },
  methods: {
    async deleteActivity() {
      if (this.deleteOption === "all") {
        try {
          await this.activitiesStore.deleteActivity(this.activity.meta.id);
          this.toast.success("Activity deleted successfully");
        } catch (error: any) {
          console.error("Error deleting activity", error);
          this.toast.error(error.message || "Failed to delete activity");
        }
      } else {
        try {
          await this.activitiesStore.removeActivityFromProgram(
            this.activity.meta.id,
            this.programId,
          );
          this.toast.success("Activity removed from program successfully");
        } catch (error: any) {
          console.error("Error removing activity from program", error);
          this.toast.error(
            error.message || "Failed to remove activity from program",
          );
        }
      }
      this.$emit("close");
    },
  },
});
</script>
