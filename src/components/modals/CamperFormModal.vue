<template>
  <BaseModal
    :title="isEditing ? 'Edit Camper' : 'Create New Camper'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">First Name</label>
            <BaseInput
              v-model="formData.firstName"
              placeholder="Enter first name"
              :rules="[(val: string) => !!val || 'Enter first name']"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Last Name</label>
            <BaseInput
              v-model="formData.lastName"
              placeholder="Enter last name"
              :rules="[(val: string) => !!val || 'Enter last name']"
            />
          </div>
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Age</label>
            <BaseInput
              v-model="ageModel"
              type="number"
              placeholder="Enter age"
              :rules="[
                (val: string) => !!val || 'Enter age',
                (val: string) =>
                  (parseInt(val) >= 5 && parseInt(val) <= 18) ||
                  'Age must be between 5 and 18',
              ]"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Gender</label>
            <Autocomplete
              v-model="formData.gender"
              :options="genderOptions"
              placeholder="Select gender..."
              :required="true"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Camp Session</label>
          <Autocomplete
            v-model="formData.sessionId"
            :options="sessionOptions"
            placeholder="Select a session..."
            :required="true"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Family Group</label>
          <Autocomplete
            v-model="formData.familyGroupId"
            :options="availableGroupOptions"
            placeholder="Select a family group..."
            :disabled="!formData.sessionId"
          />
          <div v-if="!formData.sessionId" class="text-xs text-secondary mt-1">
            Please select a session first
          </div>
          <div
            v-else-if="availableGroupOptions.length === 0"
            class="text-xs text-warning mt-1"
          >
            No family groups available for this session
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Allergies (comma-separated)</label>
          <BaseInput
            v-model="allergiesModel"
            placeholder="e.g., Peanuts, Dairy"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Medical Notes</label>
          <BaseInput
            v-model="formData.medicalNotes"
            type="textarea"
            placeholder="Optional medical notes"
          />
        </div>
      </q-form>
    </template>

    <template #footer>
      <div class="flex q-gutter-x-sm">
        <BaseButton flat @click="$emit('close')" label="Cancel" />
        <BaseButton
          color="primary"
          @click="handleSave"
          :label="isEditing ? 'Update Camper' : 'Add Camper'"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import Autocomplete, {
  type AutocompleteOption,
} from "@/components/Autocomplete.vue";
import type { Session, Group, CamperCreationRequest } from "@/types";
import type { QForm } from "quasar";
import { useCampersStore, useGroupsStore, useSessionsStore } from "@/stores";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "CamperFormModal",
  components: {
    BaseModal,
    Autocomplete,
  },
  props: {
    camperId: {
      type: String as PropType<string>,
      required: false,
    },
  },
  emits: ["close"],
  data() {
    return {
      sessionsStore: useSessionsStore(),
      groupsStore: useGroupsStore(),
      campersStore: useCampersStore(),
      toast: useToast(),
      formData: {
        firstName: "",
        lastName: "",
        age: 0,
        gender: "male",
        sessionId: "",
        allergies: [],
        medicalNotes: "",
        photoUrl: "",
      } as CamperCreationRequest,
      genderOptions: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
      ] as AutocompleteOption[],
      formRef: null as any,
      loading: false,
    };
  },
  created() {
    if (!this.camperId) return;
    const camper = this.campersStore.getCamperById(this.camperId);
    if (!camper) return;
    this.formData = {
      firstName: camper.firstName,
      lastName: camper.lastName,
      age: camper.age,
      gender: camper.gender,
      sessionId: camper.sessionId || "",
      allergies: camper.allergies || [],
      medicalNotes: camper.medicalNotes || "",
      familyGroupId: camper.familyGroupId || "",
      photoUrl: camper.photoUrl || "",
    };
  },
  computed: {
    isEditing(): boolean {
      return !!this.camperId;
    },
    allergiesModel: {
      get(): string {
        return this.formData.allergies?.join(", ") || "";
      },
      set(value: string) {
        this.formData.allergies = value.split(",").map((a) => a.trim());
      },
    },
    sessions(): Session[] {
      return this.sessionsStore.sessions;
    },
    groups(): Group[] {
      return this.groupsStore.groups;
    },
    ageModel: {
      get(): string {
        return this.formData.age?.toString() || "";
      },
      set(value: string) {
        const num = parseInt(value);
        this.formData.age = isNaN(num) ? 0 : num;
      },
    },
    sessionOptions(): AutocompleteOption[] {
      return this.sessions.map((session) => {
        const startDate = new Date(session.startDate).toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric" },
        );
        const endDate = new Date(session.endDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        return {
          label: `${session.name} (${startDate} - ${endDate})`,
          value: session.id,
        };
      });
    },
    availableGroupOptions(): AutocompleteOption[] {
      // Only show family groups that match the selected session
      if (!this.formData.sessionId) {
        return [];
      }

      const filteredGroups = this.groups.filter(
        (group) => group.sessionId === this.formData.sessionId,
      );

      return filteredGroups.map((group) => ({
        label: group.name,
        value: group.id,
      }));
    },
  },
  methods: {
    async handleSave(): Promise<void> {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      if (this.camperId) {
        this.updateCamper();
      } else {
        this.createCamper();
      }
    },
    async updateCamper(): Promise<void> {
      if (!this.camperId) return;

      try {
        this.loading = true;
        await this.campersStore.updateCamper(this.camperId, this.formData);
        this.toast.success("Camper updated successfully");
      } catch (error) {
        this.toast.error((error as Error).message || "Failed to update camper");
      } finally {
        this.loading = false;
        this.$emit("close");
      }
    },
    async createCamper(): Promise<void> {
      try {
        this.loading = true;
        await this.campersStore.createCamper(this.formData);
        this.toast.success("Camper created successfully");
      } catch (error) {
        this.toast.error((error as Error).message || "Failed to create camper");
      } finally {
        this.loading = false;
        this.$emit("close");
      }
    },
  },
});
</script>

<style scoped>
.grid {
  display: grid;
  gap: 1rem;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

@media (max-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>
