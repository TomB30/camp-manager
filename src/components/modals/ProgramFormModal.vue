<template>
  <BaseModal
    :title="isEditing ? 'Edit Program' : 'Create New Program'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <div class="form-group">
          <label class="form-label">Program Name</label>
          <BaseInput
            v-model="localFormData.meta.name"
            placeholder="e.g., Watersports, Arts & Crafts"
            :rules="[(val: string) => !!val || 'Enter program name']"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <BaseInput
            v-model="descriptionModel"
            type="textarea"
            :rows="3"
            placeholder="Describe this program..."
          />
        </div>

        <div class="form-group">
          <label class="form-label">Color</label>
          <ColorPicker v-model="localFormData.spec.colorId" />
        </div>
      </q-form>
    </template>

    <template #footer>
      <div class="flex q-gutter-x-sm">
        <BaseButton flat @click="$emit('close')" label="Cancel" />
        <BaseButton
          color="primary"
          @click="handleSave"
          :label="isEditing ? 'Update Program' : 'Create Program'"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import ColorPicker from "@/components/ColorPicker.vue";
import { useColorsStore, useProgramsStore } from "@/stores";
import type { QForm } from "quasar";
import type { Program, ProgramCreationRequest } from "@/types";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "ProgramFormModal",
  components: {
    BaseModal,
    ColorPicker,
  },
  props: {
    programId: {
      type: String as PropType<string>,
      required: false,
    },
  },
  emits: ["close"],
  setup() {
    const colorsStore = useColorsStore();
    const programsStore = useProgramsStore();
    const toast = useToast();
    return { colorsStore, programsStore, toast };
  },
  data() {
    return {
      editingProgram: null as Program | null,
      localFormData: {
        meta: {
          name: "",
          description: "",
        },
        spec: {
          colorId: undefined,
          activityIds: [],
          staffMemberIds: [],
          locationIds: [],
        },
      } as ProgramCreationRequest,
      formRef: null as any,
    };
  },
  created() {
    if (this.programId) {
      const program = this.programsStore.getProgramById(this.programId);
      if (!program) return;

      this.editingProgram = program;
      this.localFormData = {
        meta: {
          name: program.meta.name,
          description: program.meta.description || "",
        },
        spec: {
          colorId: program.spec.colorId || undefined,
          activityIds: program.spec.activityIds || [],
          staffMemberIds: program.spec.staffMemberIds || [],
          locationIds: program.spec.locationIds || [],
        },
      };
    }
  },
  computed: {
    isEditing() {
      return !!this.programId;
    },
    descriptionModel: {
      get(): string {
        return this.localFormData.meta.description || "";
      },
      set(value: string) {
        this.localFormData.meta.description = value || "";
      },
    },
  },
  methods: {
    async handleSave() {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      if (this.isEditing) {
        return this.updateProgram();
      } else {
        return this.createProgram();
      }
    },
    async updateProgram(): Promise<void> {
      if (!this.programId) return;
      try {
        await this.programsStore.updateProgram(
          this.programId,
          this.localFormData,
        );
        this.toast.success("Program updated successfully");
      } catch (error) {
        this.toast.error(
          (error as Error).message || "Failed to update program",
        );
      } finally {
        this.$emit("close");
      }
    },
    async createProgram(): Promise<void> {
      try {
        await this.programsStore.createProgram(this.localFormData);
        this.toast.success("Program created successfully");
      } catch (error) {
        this.toast.error(
          (error as Error).message || "Failed to create program",
        );
      } finally {
        this.$emit("close");
      }
    },
  },
});
</script>
