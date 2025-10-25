<template>
  <BaseModal
    :title="isEditing ? 'Edit Room' : 'Create Room'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <div class="form-group">
          <label class="form-label">Room Name</label>
          <BaseInput
            v-model="formModel.name"
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
            v-model="formModel.areaId"
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
          :label="isEditing ? 'Update Room' : 'Create Room'"
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
import { useAreasStore, useHousingRoomsStore } from "@/stores";
import type { QForm } from "quasar";
import { useToast } from "@/composables/useToast";
import type { HousingRoomCreationRequest } from "@/types";

export default defineComponent({
  name: "HousingRoomFormModal",
  components: {
    BaseModal,
    Autocomplete,
  },
  props: {
    roomId: {
      type: String as PropType<string>,
      required: false,
    },
  },
  emits: ["close"],
  setup() {
    const areasStore = useAreasStore();
    const housingRoomsStore = useHousingRoomsStore();
    const toast = useToast();
    return { areasStore, housingRoomsStore, toast };
  },
  data() {
    return {
      formModel: {
        name: "",
        beds: 0,
        areaId: undefined,
      } as HousingRoomCreationRequest,
      formRef: null as any,
      loading: false as boolean,
    };
  },
  created() {
    if (!this.roomId) return;
    const room = this.housingRoomsStore.getHousingRoomById(this.roomId);
    if (!room) return;
    this.formModel = {
      name: room.name,
      beds: room.beds,
      areaId: room.areaId,
    };
  },
  computed: {
    isEditing(): boolean {
      return !!this.roomId;
    },
    areaOptions(): AutocompleteOption[] {
      return this.areasStore.areas.map((area) => ({
        label: area.name,
        value: area.id,
      }));
    },
    bedsModel: {
      get(): string {
        return this.formModel.beds?.toString() || "";
      },
      set(value: string) {
        const num = parseInt(value);
        this.formModel.beds = isNaN(num) ? 0 : num;
      },
    },
  },
  methods: {
    async handleSave(): Promise<void> {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      if (this.isEditing) {
        return this.updateHousingRoom();
      }
      return this.createHousingRoom();
    },
    async updateHousingRoom(): Promise<void> {
      if (!this.roomId) return;
      try {
        this.loading = true;
        await this.housingRoomsStore.updateHousingRoom(this.roomId, this.formModel);
        this.toast.success("Room updated successfully");
      } catch (error) {
        this.toast.error((error as Error).message || "Failed to update room");
      } finally {
        this.loading = false;
        this.$emit("close");
      }
    },
    async createHousingRoom(): Promise<void> {
      try {
        this.loading = true;
        await this.housingRoomsStore.createHousingRoom(this.formModel);
        this.toast.success("Room created successfully");
      } catch (error) {
        this.toast.error((error as Error).message || "Failed to create room");
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
</style>
