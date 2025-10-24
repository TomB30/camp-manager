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
            v-model="localFormData.name"
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
          <ColorPicker v-model="localFormData.colorId" />
        </div>
      </q-form>
    </template>

    <template #footer>
      <div class="flex q-gutter-x-sm">
        <BaseButton flat @click="$emit('close')" label="Cancel" />
        <BaseButton
          color="primary"
          @click="handleSave"
          :label="isEditing ? 'Save Changes' : 'Create Program'"
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
import ColorPicker from "@/components/ColorPicker.vue";
import { useColorsStore, useProgramsStore } from "@/stores";
import type { Program } from "@/types";
import type { QForm } from "quasar";
import type { ProgramCreationRequest } from "@/types";


export default defineComponent({
  name: "ProgramFormModal",
  components: {
    BaseModal,
    BaseInput,
    BaseButton,
    ColorPicker,
  },
  props: {
    programId: {
      type: String as PropType<string>,
      required: false
    },
  },
  emits: ["close", "save"],
  setup() {
    const colorsStore = useColorsStore();
    const programsStore = useProgramsStore();
    return { colorsStore, programsStore };
  },
  data() {
    return {
      editingProgram: null as Program | null,
      localFormData: {
        name: "",
        description: "",
        colorId: "",
        activityIds: [],
        staffMemberIds: [],
        locationIds: [],
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
        name: program.name,
        description: program.description || "",
        colorId: program.colorId || "",
        activityIds: program.activityIds,
        staffMemberIds: program.staffMemberIds,
        locationIds: program.locationIds,
      };
    }
  },
  computed: {
    isEditing() {
      return !!this.programId;
    },
    descriptionModel: {
      get(): string {
        return this.localFormData.description || "";
      },
      set(value: string) {
        this.localFormData.description = value || "";
      },
    },
  },
  methods: {
    async handleSave() {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      const now = new Date().toISOString();

      const programData: Program = {
        id: this.programId || crypto.randomUUID(),
        name: this.localFormData.name,
        description: this.localFormData.description || undefined,
        colorId: this.localFormData.colorId,
        activityIds: this.localFormData.activityIds,
        staffMemberIds: this.localFormData.staffMemberIds,
        locationIds: this.localFormData.locationIds,
        createdAt: this.editingProgram?.createdAt || now,
        updatedAt: now,
      };

      this.$emit("save", programData);
    },
  },
});
</script>
