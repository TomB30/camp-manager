<template>
  <BaseModal
    :title="isEditing ? 'Update Location' : 'Create Location'"
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
                (val: string) => parseInt(val) > 0 || 'Must be greater than 0',
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
            v-model="equipmentModel"
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
        <BaseButton
          color="primary"
          @click="handleSave"
          :label="isEditing ? 'Update Location' : 'Create Location'"
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
import { useAreasStore, useLocationsStore } from "@/stores";
import type { Location, LocationCreationRequest } from "@/types";
import type { QForm } from "quasar";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "LocationFormModal",
  components: {
    BaseModal,
    Autocomplete,
  },
  props: {
    locationId: {
      type: String as PropType<string>,
      required: false,
    },
  },
  emits: ["close", "save"],
  setup() {
    const areasStore = useAreasStore();
    const locationsStore = useLocationsStore();
    const toast = useToast();
    return { areasStore, locationsStore, toast };
  },
  data() {
    return {
      localFormData: {
        name: "",
        type: "classroom" as Location["type"],
        capacity: 0,
        areaId: undefined,
        equipment: [],
        notes: "",
      } as LocationCreationRequest,
      locationTypeOptions: [
        { label: "Classroom", value: "classroom" },
        { label: "Activity", value: "activity" },
        { label: "Sports", value: "sports" },
        { label: "Dining", value: "dining" },
        { label: "Outdoor", value: "outdoor" },
        { label: "Arts", value: "arts" },
      ] as AutocompleteOption[],
      formRef: null as any,
      loading: false as boolean,
    };
  },
  created() {
    if (this.locationId) {
      const location = this.locationsStore.getLocationById(this.locationId);
      if (!location) return;
      this.localFormData = {
        name: location.name,
        type: location.type,
        capacity: location.capacity || 0,
        areaId: location.areaId,
        equipment: location.equipment || [],
        notes: location.notes || "",
      };
    }
  },
  computed: {
    isEditing(): boolean {
      return !!this.locationId;
    },
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
    equipmentModel: {
      get(): string {
        return this.localFormData.equipment?.join(", ") || "";
      },
      set(value: string) {
        this.localFormData.equipment = value
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e.length > 0);
      },
    },
  },
  methods: {
    async handleSave() {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      if (this.isEditing) {
        return this.handleUpdate();
      }
      return this.handleCreate();
    },
    async handleUpdate(): Promise<void> {
      if (!this.locationId) return;
      try {
        this.loading = true;
        await this.locationsStore.updateLocation(
          this.locationId,
          this.localFormData,
        );
        this.toast.success("Location updated successfully");
      } catch (error) {
        this.toast.error(
          (error as Error).message || "Failed to update location",
        );
      } finally {
        this.loading = false;
        this.$emit("close");
      }
    },
    async handleCreate(): Promise<void> {
      try {
        this.loading = true;
        await this.locationsStore.createLocation(this.localFormData);
        this.toast.success("Location created successfully");
      } catch (error) {
        this.toast.error(
          (error as Error).message || "Failed to create location",
        );
      } finally {
        this.loading = false;
        this.$emit("close");
      }
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
