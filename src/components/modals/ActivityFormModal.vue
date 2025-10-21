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
} from "@/stores";
import BaseModal from "@/components/BaseModal.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import ActivityForm, {
  type ActivityFormData,
} from "@/components/ActivityForm.vue";
import { type AutocompleteOption } from "@/components/Autocomplete.vue";
import type { Activity } from "@/types";

export default defineComponent({
  name: "ActivityFormModal",
  components: {
    BaseModal,
    BaseButton,
    ActivityForm,
  },
  props: {
    activity: {
      type: Object as PropType<Activity | null>,
      default: null,
    },
    programId: {
      type: String,
      default: null,
    },
    programIds: {
      type: Array as PropType<string[]>,
      default: null,
    },
  },
  emits: ["close", "save"],
  setup() {
    const programsStore = useProgramsStore();
    const locationsStore = useLocationsStore();
    const colorsStore = useColorsStore();
    const certificationsStore = useCertificationsStore();
    return { programsStore, locationsStore, colorsStore, certificationsStore };
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
    };
  },
  computed: {
    isEditing() {
      return !!this.activity;
    },
    roomOptions(): AutocompleteOption[] {
      return this.locationsStore.locations.map((room) => ({
        value: room.id,
        label: `${room.name} (${room.type})`,
      }));
    },
    presetDurations(): number[] {
      return [30, 60, 90, 120, 180, 240, 480];
    },
  },
  methods: {
    resetForm() {
      if (this.activity) {
        // Get color hex value from colorId
        let colorHex = "#6366F1";
        if (this.activity.colorId) {
          const color = this.colorsStore.getColorById(this.activity.colorId);
          colorHex = color?.hexValue || "#6366F1";
        }

        this.localFormData = {
          name: this.activity.name,
          description: this.activity.description || "",
          duration: this.activity.duration || 0,
          defaultLocationId: this.activity.defaultLocationId || "",
          requiredCertificationIds: this.activity.requiredCertificationIds
            ? [...this.activity.requiredCertificationIds]
            : [],
          minStaff: this.activity.minStaff || 0,
          defaultCapacity: this.activity.defaultCapacity || 0,
          color: colorHex,
        };
        // Convert certification names to IDs for the SelectionList
        this.selectedCertificationIds = this.getCertificationIdsFromNames(
          this.activity.requiredCertificationIds || [],
        );
        // Check if duration matches any preset
        this.isCustomDuration = !this.presetDurations.includes(
          this.activity!.duration || 0,
        );
      } else {
        this.localFormData = {
          name: "",
          description: "",
          duration: 60,
          defaultLocationId: "",
          requiredCertificationIds: [],
          minStaff: 0,
          defaultCapacity: 0,
          color: "#6366F1",
        };
        this.selectedCertificationIds = [];
        this.isCustomDuration = false;
      }
    },
    getCertificationIdsFromNames(names: string[]): string[] {
      return names
        .map((name) => {
          const cert = this.certificationsStore.certifications.find(
            (c) => c.name === name,
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

      if (this.activity) {
        // Editing existing activity - keep its current programIds
        activityProgramIds = this.activity.programIds;
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
        this.selectedCertificationIds,
      );

      // Find or create color ID for the selected color
      let colorId: string | undefined = this.activity?.colorId;
      if (this.localFormData.color) {
        const color = this.colorsStore.colors.find(
          (c) => c.hexValue === this.localFormData.color,
        );
        colorId = color?.id;
      }

      const activityData: Activity = {
        id: this.activity?.id || crypto.randomUUID(),
        name: this.localFormData.name,
        description: this.localFormData.description || undefined,
        programIds: activityProgramIds,
        duration: this.localFormData.duration,
        defaultLocationId: this.localFormData.defaultLocationId || undefined,
        requiredCertificationIds:
          certifications.length > 0 ? this.selectedCertificationIds : undefined,
        minStaff: this.localFormData.minStaff || undefined,
        defaultCapacity: this.localFormData.defaultCapacity || undefined,
        colorId: colorId,
        createdAt: this.activity?.createdAt || now,
        updatedAt: now,
      };

      this.$emit("save", activityData);
    },
  },
});
</script>
