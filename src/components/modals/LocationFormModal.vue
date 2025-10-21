<template>
  <BaseModal
    :title="isEditing ? 'Edit Location' : 'Add New Location'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <div class="form-group">
          <label class="form-label">Location Name</label>
          <BaseInput
            v-model="localFormData.name"
            placeholder="Enter location name"
            :rules="[(val: string) => !!val || 'Enter location name']"
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
            <BaseInput
              v-model="capacityModel"
              type="number"
              placeholder="Enter capacity"
              :rules="[
                (val: string) => !!val || 'Enter capacity',
                (val: string) => parseInt(val) > 0 || 'Must be greater than 0'
              ]"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Area (optional)</label>
          <Autocomplete
            v-model="localFormData.areaId"
            :options="areaOptions"
            placeholder="Select an area..."
            :required="false"
          />
          <p class="form-help-text">
            Select the physical area where this location is situated
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">Equipment (comma-separated)</label>
          <BaseInput
            v-model="equipmentInput"
            placeholder="e.g., Projector, Tables, Chairs"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Notes</label>
          <BaseInput
            v-model="notesModel"
            type="textarea"
            placeholder="Optional notes"
          />
        </div>
      </q-form>
    </template>

    <template #footer>
      <div class="flex q-gutter-x-sm">
        <BaseButton flat @click="$emit('close')" label="Cancel" />
        <BaseButton color="primary" @click="handleSave" :label="isEditing ? 'Update Location' : 'Add Location'" />
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
import { useAreasStore } from "@/stores";
import type { Location } from "@/types";
import type { QForm } from "quasar";

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
      formRef: null as any,
    };
  },
  computed: {
    areaOptions(): AutocompleteOption[] {
      return this.areasStore.areas.map((area) => ({
        label: area.name,
        value: area.id,
      }));
    },
    capacityModel: {
      get(): string {
        return this.localFormData.capacity?.toString() || "";
      },
      set(value: string) {
        const num = parseInt(value);
        this.localFormData.capacity = isNaN(num) ? 0 : num;
      },
    },
    notesModel: {
      get(): string {
        return this.localFormData.notes || "";
      },
      set(value: string) {
        this.localFormData.notes = value || "";
      },
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
    async handleSave() {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

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
