<template>
  <BaseModal
    :title="isEditing ? 'Edit Activity' : 'Create New Activity'"
    @close="$emit('close')"
  >
    <template #body>
      <ActivityForm
        v-model="localFormData"
        v-model:selected-certification-ids="selectedCertificationIds"
        v-model:is-custom-duration="isCustomDuration"
        :room-options="roomOptions"
        :certifications="certificationsStore.certifications"
        @submit="handleSave"
      />
    </template>

    <template #footer>
      <div class="flex q-gutter-x-sm">
        <BaseButton flat @click="$emit('close')" label="Cancel" />
        <BaseButton
          color="primary"
          @click="handleSave"
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
import ActivityForm, {
  type ActivityFormData,
} from "@/components/ActivityForm.vue";
import { type AutocompleteOption } from "@/components/Autocomplete.vue";
import type { Activity } from "@/types";

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
    return {
      programsStore,
      locationsStore,
      colorsStore,
      certificationsStore,
      activitiesStore,
    };
  },
  data() {
    return {
      localFormData: {
        name: "",
        description: "",
        duration: 60,
        defaultLocationId: "",
        requiredCertificationIds: [],
        minStaff: 0,
        defaultCapacity: 0,
        color: "#6366F1",
      } as ActivityFormData,
      selectedCertificationIds: [] as string[],
      isCustomDuration: false,
      editingActivity: null as Activity | null,
    };
  },
  created() {
    if (this.activityId) {
      const activity = this.activitiesStore.getActivityById(this.activityId);
      if (!activity) return;
      this.editingActivity = activity;
      this.localFormData = {
        name: activity.name,
        description: activity.description || "",
        duration: activity.duration || 60,
        defaultLocationId: activity.defaultLocationId || "",
        requiredCertificationIds: activity.requiredCertificationIds || [],
        minStaff: activity.minStaff || 0,
        defaultCapacity: activity.defaultCapacity || 0,
      };
    }
  },
  computed: {
    isEditing() {
      return !!this.activityId;
    },
    roomOptions(): AutocompleteOption[] {
      return this.locationsStore.locations.map((room) => ({
        value: room.id,
        label: `${room.name} (${room.type})`,
      }));
    },
  },
  methods: {
    getCertificationIdsFromNames(names: string[]): string[] {
      return names
        .map((name) => {
          const cert = this.certificationsStore.certifications.find(
            (c) => c.name === name
          );
          return cert ? cert.id : "";
        })
        .filter((id) => id !== "");
    },
    getCertificationNamesFromIds(ids: string[]): string[] {
      return ids
        .map((id) => {
          const cert = this.certificationsStore.getCertificationById(id);
          return cert ? cert.name : "";
        })
        .filter((name) => name !== "");
    },
    handleSave() {
      // Determine programIds for the activity
      let activityProgramIds: string[];

      if (this.editingActivity) {
        // Editing existing activity - keep its current programIds
        activityProgramIds = this.editingActivity.programIds;
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

      const now = new Date().toISOString();

      // Convert selected certification IDs to names
      const certifications = this.getCertificationNamesFromIds(
        this.selectedCertificationIds
      );

      const activityData: Activity = {
        id: this.editingActivity?.id || crypto.randomUUID(),
        name: this.localFormData.name,
        description: this.localFormData.description || undefined,
        programIds: activityProgramIds,
        duration: this.localFormData.duration,
        defaultLocationId: this.localFormData.defaultLocationId || undefined,
        requiredCertificationIds:
          certifications.length > 0 ? this.selectedCertificationIds : undefined,
        minStaff: this.localFormData.minStaff || undefined,
        defaultCapacity: this.localFormData.defaultCapacity || undefined,
        createdAt: this.editingActivity?.createdAt || now,
        updatedAt: now,
      };

      this.$emit("save", activityData);
    },
  },
});
</script>
