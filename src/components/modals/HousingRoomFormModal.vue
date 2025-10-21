<template>
  <BaseModal
    :title="isEditing ? 'Edit Room' : 'Add New Room'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <div class="form-group">
          <label class="form-label">Room Name</label>
          <BaseInput
            v-model="localFormData.name"
            placeholder="Enter room name"
            :rules="[(val: string) => !!val || 'Enter room name']"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Number of Beds</label>
          <BaseInput
            v-model="bedsModel"
            type="number"
            placeholder="Enter number of beds"
            :rules="[
              (val: string) => !!val || 'Enter number of beds',
              (val: string) => parseInt(val) >= 1 || 'Must be at least 1',
            ]"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Area (optional)</label>
          <Autocomplete
            v-model="localFormData.areaId"
            :options="areaOptions"
            placeholder="Select an area..."
            :required="false"
            hint="Select the physical area where this room is located"
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
          :label="isEditing ? 'Update Room' : 'Add Room'"
        />
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
import type { QForm } from "quasar";

interface RoomFormData {
  name: string;
  beds: number;
  areaId?: string;
}

export default defineComponent({
  name: "HousingRoomFormModal",
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
      type: Object as PropType<RoomFormData>,
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
    bedsModel: {
      get(): string {
        return this.localFormData.beds?.toString() || "";
      },
      set(value: string) {
        const num = parseInt(value);
        this.localFormData.beds = isNaN(num) ? 0 : num;
      },
    },
  },
  watch: {
    formData: {
      handler(newVal) {
        this.localFormData = JSON.parse(JSON.stringify(newVal));
      },
      deep: true,
    },
  },
  methods: {
    async handleSave() {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      this.$emit("save", this.localFormData);
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
