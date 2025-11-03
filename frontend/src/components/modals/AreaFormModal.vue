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
            v-model="formData.meta.name"
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

        <div class="form-group">
          <label class="form-label">Capacity</label>
          <BaseInput
            v-model="capacityModel"
            type="number"
            placeholder="Optional capacity"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Equipment (comma-separated)</label>
          <BaseInput
            v-model="equipmentModel"
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
        <BaseButton
          color="primary"
          @click="handleSave"
          :label="isEditing ? 'Update Area' : 'Create Area'"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import BaseInput from "@/components/common/BaseInput.vue";
import type { Area, AreaCreationRequest } from "@/generated/api";
import type { QForm } from "quasar";
import { useAreasStore } from "@/stores";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "AreaFormModal",
  setup() {
    const toast = useToast();
    return {
      toast,
    };
  },
  components: {
    BaseModal,
    BaseInput,
  },
  props: {
    areaId: {
      type: String as PropType<string>,
      required: false,
    },
  },
  emits: ["close"],
  data() {
    return {
      areasStore: useAreasStore(),
      loading: false,
      formData: {
        meta: {
          name: "",
          description: "",
        },
        spec: {
          capacity: null as number | null,
          equipment: [],
          notes: "",
        },
      } as AreaCreationRequest,
      formRef: null as any,
    };
  },
  created() {
    if (!this.areaId) return;

    const area: Area | undefined = this.areasStore.getAreaById(this.areaId);
    if (!area) return;

    this.formData = {
      meta: {
        name: area.meta.name,
        description: area.meta.description,
      },
      spec: {
        capacity: area.spec.capacity,
        equipment: area.spec.equipment,
        notes: area.spec.notes,
      },
    };
  },
  computed: {
    isEditing(): boolean {
      return !!this.areaId;
    },
    descriptionModel: {
      get(): string {
        return this.formData.meta.description || "";
      },
      set(value: string) {
        this.formData.meta.description = value || "";
      },
    },
    equipmentModel: {
      get(): string {
        return this.formData.spec.equipment?.join(", ") || "";
      },
      set(value: string) {
        this.formData.spec.equipment = value.split(",").map((e) => e.trim());
      },
    },
    capacityModel: {
      get(): string {
        return this.formData.spec.capacity?.toString() || "";
      },
      set(value: string) {
        const num = parseInt(value);
        this.formData.spec.capacity = isNaN(num) ? undefined : num;
      },
    },
    notesModel: {
      get(): string {
        return this.formData.spec.notes || "";
      },
      set(value: string) {
        this.formData.spec.notes = value || "";
      },
    },
  },
  methods: {
    async handleSave(): Promise<void> {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      if (this.isEditing) {
        return this.handleUpdate();
      }
      return this.handleCreate();
    },
    async handleUpdate(): Promise<void> {
      try {
        if (!this.areaId) return;
        this.loading = true;
        await this.areasStore.updateArea(this.areaId, this.formData);
        this.toast.success("Area updated successfully");
      } catch (error) {
        this.toast.error((error as Error).message || "Failed to update area");
      } finally {
        this.loading = false;
        this.$emit("close");
      }
    },
    async handleCreate(): Promise<void> {
      try {
        this.loading = true;
        await this.areasStore.createArea(this.formData);
        this.toast.success("Area created successfully");
      } catch (error) {
        this.toast.error((error as Error).message || "Failed to create area");
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
