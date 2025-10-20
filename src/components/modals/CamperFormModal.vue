<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Camper' : 'Add New Camper'"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">First Name</label>
            <input
              v-model="localFormData.firstName"
              type="text"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Last Name</label>
            <input
              v-model="localFormData.lastName"
              type="text"
              class="form-input"
              required
            />
          </div>
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Age</label>
            <input
              v-model.number="localFormData.age"
              type="number"
              min="5"
              max="18"
              class="form-input"
              required
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
          <input
            v-model="localFormData.parentContact"
            type="text"
            class="form-input"
            required
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
          <input
            v-model="allergiesInput"
            type="text"
            class="form-input"
            placeholder="e.g., Peanuts, Dairy"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Medical Notes</label>
          <textarea
            v-model="localFormData.medicalNotes"
            class="form-textarea"
          ></textarea>
        </div>
      </form>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="handleSave">
        {{ isEditing ? "Update" : "Add" }} Camper
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import Autocomplete, {
  type AutocompleteOption,
} from "@/components/Autocomplete.vue";
import type { Session, Group } from "@/types";

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
    Autocomplete,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
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
    };
  },
  computed: {
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
    handleSave(): void {
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
