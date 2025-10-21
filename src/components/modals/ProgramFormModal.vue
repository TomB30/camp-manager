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
          <ColorPicker v-model="localFormData.color" />
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
import { useColorsStore } from "@/stores";
import type { Program, Color } from "@/types";
import type { QForm } from "quasar";

interface ProgramFormData {
  name: string;
  description: string;
  color: string;
  activityIds: string[];
  staffMemberIds: string[];
  locationIds: string[];
}

export default defineComponent({
  name: "ProgramFormModal",
  components: {
    BaseModal,
    BaseInput,
    BaseButton,
    ColorPicker,
  },
  props: {
    program: {
      type: Object as PropType<Program | null>,
      default: null,
    },
  },
  emits: ["close", "save"],
  setup() {
    const colorsStore = useColorsStore();
    return { colorsStore };
  },
  data() {
    return {
      localFormData: {
        name: "",
        description: "",
        color: "#6366F1",
        activityIds: [],
        staffMemberIds: [],
        locationIds: [],
      } as ProgramFormData,
      formRef: null as any,
    };
  },
  computed: {
    isEditing() {
      return !!this.program;
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
    resetForm() {
      if (this.program) {
        // Get color hex value from colorId
        let colorHex = "#6366F1";
        if (this.program.colorId) {
          const color = this.colorsStore.getColorById(this.program.colorId);
          colorHex = color?.hexValue || "#6366F1";
        }

        this.localFormData = {
          name: this.program.name,
          description: this.program.description || "",
          color: colorHex,
          activityIds: [...(this.program.activityIds || [])],
          staffMemberIds: [...(this.program.staffMemberIds || [])],
          locationIds: [...(this.program.locationIds || [])],
        };
      } else {
        this.localFormData = {
          name: "",
          description: "",
          color: "#6366F1",
          activityIds: [],
          staffMemberIds: [],
          locationIds: [],
        };
      }
    },
    async handleSave() {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      const now = new Date().toISOString();

      // Find color ID for the selected color
      let colorId: string | undefined = this.program?.colorId;
      if (this.localFormData.color) {
        const color = this.colorsStore.colors.find(
          (c: Color) => c.hexValue === this.localFormData.color,
        );
        colorId = color?.id;
      }

      const programData: Program = {
        id: this.program?.id || crypto.randomUUID(),
        name: this.localFormData.name,
        description: this.localFormData.description || undefined,
        colorId: colorId,
        activityIds: this.localFormData.activityIds,
        staffMemberIds: this.localFormData.staffMemberIds,
        locationIds: this.localFormData.locationIds,
        createdAt: this.program?.createdAt || now,
        updatedAt: now,
      };

      this.$emit("save", programData);
    },
  },
});
</script>
