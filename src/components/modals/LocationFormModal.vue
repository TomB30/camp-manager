<template>
  <BaseModal
    :title="isEditing ? 'Edit Location' : 'Add New Location'"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label class="form-label">Location Name</label>
          <input
            v-model="localFormData.name"
            type="text"
            class="form-input"
            required
          />
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Type</label>
            <Autocomplete
              v-model="localFormData.type"
              :options="locationTypeOptions"
              placeholder="Select location type..."
              :required="true"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Capacity</label>
            <input
              v-model.number="localFormData.capacity"
              type="number"
              min="1"
              class="form-input"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Area (optional)</label>
          <Autocomplete
            v-model="localFormData.areaId"
            :options="locationOptions"
            placeholder="Select an area..."
            :required="false"
          />
          <p class="form-help-text">
            Select the physical area where this location is situated
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">Equipment (comma-separated)</label>
          <input
            v-model="equipmentInput"
            type="text"
            class="form-input"
            placeholder="e.g., Projector, Tables, Chairs"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Notes</label>
          <textarea
            v-model="localFormData.notes"
            class="form-textarea"
          ></textarea>
        </div>
      </form>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="handleSave">
        {{ isEditing ? "Update" : "Add" }} Location
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
import { useAreasStore } from "@/stores";
import type { Location } from "@/types";

interface LocationFormData {
  name: string;
  type: Location["type"];
  capacity: number;
  areaId?: string;
  equipment: string[];
  notes: string;
}

export default defineComponent({
  name: "LocationFormModal",
  components: {
    BaseModal,
    Autocomplete,
  },
  props: {
    isEditing: {
      type: Boolean,
      default: false,
    },
    formData: {
      type: Object as PropType<LocationFormData>,
      required: true,
    },
  },
  emits: ["close", "save"],
  setup() {
    const areasStore = useAreasStore();
    return { areasStore };
  },
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData)),
      equipmentInput: this.formData.equipment.join(", "),
      locationTypeOptions: [
        { label: "Classroom", value: "classroom" },
        { label: "Activity", value: "activity" },
        { label: "Sports", value: "sports" },
        { label: "Dining", value: "dining" },
        { label: "Outdoor", value: "outdoor" },
        { label: "Arts", value: "arts" },
      ] as AutocompleteOption[],
    };
  },
  computed: {
    locationOptions(): AutocompleteOption[] {
      return this.areasStore.areas.map((location) => ({
        label: location.name,
        value: location.id,
      }));
    },
  },
  watch: {
    formData: {
      handler(newVal) {
        this.localFormData = JSON.parse(JSON.stringify(newVal));
        this.equipmentInput = newVal.equipment.join(", ");
      },
      deep: true,
    },
  },
  methods: {
    handleSave() {
      const equipment = this.equipmentInput
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      this.$emit("save", {
        ...this.localFormData,
        equipment,
      });
    },
  },
});
</script>

<style scoped>
.form-help-text {
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>
