<template>
  <BaseModal :title="isEditing ? 'Edit Camper' : 'Add New Camper'" @close="$emit('close')">
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">First Name</label>
            <BaseInput
              v-model="localFormData.firstName"
              placeholder="Enter first name"
              :rules="[(val: string) => !!val || 'Enter first name']"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Last Name</label>
            <BaseInput
              v-model="localFormData.lastName"
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
                (val: string) => parseInt(val) >= 5 && parseInt(val) <= 18 || 'Age must be between 5 and 18'
              ]"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Gender</label>
            <Autocomplete
              v-model="localFormData.gender"
              :options="genderOptions"
              placeholder="Select gender..."
              :required="true"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Parent Contact (Email/Phone)</label>
          <BaseInput
            v-model="localFormData.parentContact"
            placeholder="Enter email or phone"
            :rules="[(val: string) => !!val || 'Enter parent contact']"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Camp Session</label>
          <Autocomplete
            v-model="localFormData.sessionId"
            :options="sessionOptions"
            placeholder="Select a session..."
            :required="true"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Family Group</label>
          <Autocomplete
            v-model="localFormData.groupId"
            :options="availableGroupOptions"
            placeholder="Select a family group..."
            :disabled="!localFormData.sessionId"
          />
          <div
            v-if="!localFormData.sessionId"
            class="text-xs text-secondary mt-1"
          >
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
            v-model="allergiesInput"
            placeholder="e.g., Peanuts, Dairy"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Medical Notes</label>
          <BaseInput
            v-model="medicalNotesModel"
            type="textarea"
            placeholder="Optional medical notes"
          />
        </div>
      </q-form>
    </template>

    <template #footer>
      <div class="flex q-gutter-x-sm">
        <BaseButton flat @click="$emit('close')" label="Cancel" />
        <BaseButton color="primary" @click="handleSave" :label="isEditing ? 'Update Camper' : 'Add Camper'" />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import BaseInput from "@/components/common/BaseInput.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import Autocomplete, {
  type AutocompleteOption,
} from "@/components/Autocomplete.vue";
import type { Session, Group } from "@/types";
import type { QForm } from "quasar";

interface CamperFormData {
  firstName: string;
  lastName: string;
  age: number;
  gender: "male" | "female";
  parentContact: string;
  allergies: string[];
  medicalNotes: string;
  sessionId?: string;
  groupId?: string;
}

export default defineComponent({
  name: "CamperFormModal",
  components: {
    BaseModal,
    BaseInput,
    BaseButton,
    Autocomplete,
  },
  props: {
    isEditing: {
      type: Boolean,
      default: false,
    },
    formData: {
      type: Object as PropType<CamperFormData>,
      required: true,
    },
    groups: {
      type: Array as PropType<Group[]>,
      required: true,
    },
    sessions: {
      type: Array as PropType<Session[]>,
      required: true,
    },
  },
  emits: ["close", "save"],
  data() {
    return {
      localFormData: { ...this.formData },
      allergiesInput: this.formData.allergies.join(", "),
      genderOptions: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
      ] as AutocompleteOption[],
      formRef: null as any,
    };
  },
  computed: {
    ageModel: {
      get(): string {
        return this.localFormData.age?.toString() || "";
      },
      set(value: string) {
        const num = parseInt(value);
        this.localFormData.age = isNaN(num) ? 0 : num;
      },
    },
    medicalNotesModel: {
      get(): string {
        return this.localFormData.medicalNotes || "";
      },
      set(value: string) {
        this.localFormData.medicalNotes = value || "";
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
      if (!this.localFormData.sessionId) {
        return [];
      }

      const filteredGroups = this.groups.filter(
        (group) => group.sessionId === this.localFormData.sessionId,
      );

      return filteredGroups.map((group) => ({
        label: group.name,
        value: group.id,
      }));
    },
  },
  watch: {
    formData: {
      handler(newVal) {
        this.localFormData = { ...newVal };
        this.allergiesInput = newVal.allergies.join(", ");
      },
      deep: true,
    },
    // When session changes, clear family group if it doesn't match
    "localFormData.sessionId"(newSessionId: string, oldSessionId: string) {
      if (newSessionId !== oldSessionId && this.localFormData.groupId) {
        const currentGroup = this.groups.find(
          (g) => g.id === this.localFormData.groupId,
        );
        if (currentGroup && currentGroup.sessionId !== newSessionId) {
          this.localFormData.groupId = undefined;
        }
      }
    },
  },
  methods: {
    async handleSave(): Promise<void> {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      const allergies = this.allergiesInput
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      this.$emit("save", {
        ...this.localFormData,
        allergies,
      });
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
