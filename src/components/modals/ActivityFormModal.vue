<template>
  <BaseModal
    :title="isEditing ? 'Edit Activity' : 'Create New Activity'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent ref="formRef">
        <ActivityForm v-model="formData" />
      </q-form>
    </template>

    <template #footer>
      <div class="flex q-gutter-x-sm">
        <BaseButton flat @click="$emit('close')" label="Cancel" />
        <BaseButton
          @click="handleSave"
          color="primary"
          type="submit"
          :label="isEditing ? 'Save Changes' : 'Create Activity'"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import {
  useProgramsStore,
  useLocationsStore,
  useColorsStore,
  useCertificationsStore,
  useActivitiesStore,
} from "@/stores";
import BaseModal from "@/components/BaseModal.vue";
import ActivityForm from "@/components/ActivityForm.vue";
import { type AutocompleteOption } from "@/components/Autocomplete.vue";
import type { Activity, ActivityCreationRequest } from "@/generated/api";
import { QForm } from "quasar";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "ActivityFormModal",
  components: {
    BaseModal,
    ActivityForm,
  },
  props: {
    activityId: {
      type: String,
      required: false,
    },
    programId: {
      type: String,
      required: true,
    },
    programIds: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  emits: ["close", "save"],
  setup() {
    const programsStore = useProgramsStore();
    const locationsStore = useLocationsStore();
    const colorsStore = useColorsStore();
    const certificationsStore = useCertificationsStore();
    const activitiesStore = useActivitiesStore();
    const toast = useToast();
    return {
      programsStore,
      locationsStore,
      colorsStore,
      certificationsStore,
      activitiesStore,
      toast,
    };
  },
  data() {
    return {
      formData: {
        meta: {
          name: "",
          description: "",
        },
        spec: {
          programIds: [],
          duration: 60,
          defaultLocationId: "",
          requiredCertificationIds: [],
          minStaff: null as number | null,
          defaultCapacity: null as number | null,
        },
      } as ActivityCreationRequest,
      isCustomDuration: false,
      editingActivity: null as Activity | null,
    };
  },
  created() {
    if (this.activityId) {
      const activity = this.activitiesStore.getActivityById(this.activityId);
      if (!activity) return;
      this.editingActivity = activity;
      this.formData = {
        meta: {
          name: activity.meta.name,
          description: activity.meta.description || "",
        },
        spec: {
          programIds: activity.spec.programIds,
          duration: activity.spec.duration || 60,
          defaultLocationId: activity.spec.defaultLocationId || "",
          requiredCertificationIds:
            activity.spec.requiredCertificationIds || [],
          minStaff: activity.spec.minStaff || 0,
          defaultCapacity: activity.spec.defaultCapacity || 0,
        },
      };
    }
  },
  computed: {
    isEditing() {
      return !!this.activityId;
    },
    roomOptions(): AutocompleteOption[] {
      return this.locationsStore.locations.map((location) => ({
        value: location.meta.id,
        label: location.meta.name,
      }));
    },
  },
  methods: {
    getCertificationIdsFromNames(names: string[]): string[] {
      return names
        .map((name) => {
          const cert = this.certificationsStore.certifications.find(
            (c) => c.meta.name === name
          );
          return cert ? cert.meta.id : "";
        })
        .filter((id) => id !== "");
    },
    getCertificationNamesFromIds(ids: string[]): string[] {
      return ids
        .map((id) => {
          const cert = this.certificationsStore.getCertificationById(id);
          return cert ? cert.meta.name : "";
        })
        .filter((name) => name !== "");
    },
    async handleSave() {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;
      // Determine programIds for the activity
      let activityProgramIds: string[];

      if (this.editingActivity) {
        // Editing existing activity - keep its current programIds
        activityProgramIds = this.editingActivity.spec.programIds;
      } else if (this.programIds && this.programIds.length > 0) {
        // Creating new activity with specified programIds
        activityProgramIds = this.programIds;
      } else if (this.programId) {
        // Creating new activity with single programId
        activityProgramIds = [this.programId];
      } else {
        console.error("programId or programIds is required for new activities");
        return;
      }

      const activityData: ActivityCreationRequest = {
        meta: {
          name: this.formData.meta.name,
          description: this.formData.meta.description || undefined,
        },
        spec: {
          programIds: activityProgramIds,
          duration: this.formData.spec.duration,
          defaultLocationId:
            this.formData.spec.defaultLocationId || undefined,
          requiredCertificationIds:
            this.formData.spec.requiredCertificationIds || undefined,
          minStaff: this.formData.spec.minStaff || undefined,
          defaultCapacity: this.formData.spec.defaultCapacity || undefined,
        },
      };

      if (this.activityId) {
        try {
          await this.activitiesStore.updateActivity(
            this.activityId,
            activityData
          );
          this.toast.success("Activity updated successfully");
        } catch (error: any) {
          this.toast.error(error.message || "Failed to update activity");
        }
      } else {
        try {
          await this.activitiesStore.addActivity(activityData);
          this.toast.success("Activity created successfully");
        } catch (error: any) {
          this.toast.error(error.message || "Failed to create activity");
        }
      }
      this.$emit("close");
    },
  },
});
</script>
