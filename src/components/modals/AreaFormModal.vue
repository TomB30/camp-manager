<template>
  <BaseModal
    :title="isEditing ? 'Edit Area' : 'Add New Area'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <div class="form-group">
          <label class="form-label">Area Name</label>
          <BaseInput
            v-model="localFormData.name"
            placeholder="Enter area name"
            :rules="[(val: string) => !!val || 'Enter area name']"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <BaseInput
            v-model="descriptionModel"
            type="textarea"
            :rows="2"
            placeholder="Optional description"
          />
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Type</label>
            <Autocomplete
              v-model="localFormData.type"
              :options="areaTypeOptions"
              placeholder="Select area type..."
            />
          </div>

          <div class="form-group">
            <label class="form-label">Capacity</label>
            <BaseInput
              v-model="capacityModel"
              type="number"
              placeholder="Optional capacity"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Equipment (comma-separated)</label>
          <BaseInput
            v-model="equipmentInput"
            placeholder="e.g., Tables, Chairs, Sound System"
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
        <BaseButton color="primary" @click="handleSave" :label="isEditing ? 'Update Area' : 'Add Area'" />
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
import type { Area } from "@/types";
import type { QForm } from "quasar";

interface AreaFormData {
  name: string;
  description: string;
  type: Area["type"];
  capacity?: number;
  equipment: string[];
  notes: string;
}

export default defineComponent({
  name: "AreaFormModal",
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
      type: Object as PropType<AreaFormData>,
      required: true,
    },
  },
  emits: ["close", "save"],
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData)),
      equipmentInput: this.formData.equipment.join(", "),
      areaTypeOptions: [
        { label: "Indoor", value: "indoor" },
        { label: "Outdoor", value: "outdoor" },
        { label: "Facility", value: "facility" },
        { label: "Field", value: "field" },
        { label: "Water", value: "water" },
        { label: "Other", value: "other" },
      ] as AutocompleteOption[],
      formRef: null as any,
    };
  },
  computed: {
    descriptionModel: {
      get(): string {
        return this.localFormData.description || "";
      },
      set(value: string) {
        this.localFormData.description = value || "";
      },
    },
    capacityModel: {
      get(): string {
        return this.localFormData.capacity?.toString() || "";
      },
      set(value: string) {
        const num = parseInt(value);
        this.localFormData.capacity = isNaN(num) ? undefined : num;
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
