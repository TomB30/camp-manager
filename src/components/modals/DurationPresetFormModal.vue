<template>
  <BaseModal
    :title="isEditing ? 'Update Duration Preset' : 'Create Duration Preset'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <div class="form-group">
          <label class="form-label">Preset Name</label>
          <BaseInput
            v-model="formModel.meta.name"
            placeholder="e.g., Standard Session, Quick Activity"
            :rules="[(val: string) => !!val || 'Enter preset name']"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Duration (minutes)</label>
          <BaseInput
            v-model.number="formModel.spec.durationMinutes"
            type="number"
            min="1"
            placeholder="e.g., 60"
            :rules="[
              (val: number) => !!val || 'Enter duration',
              (val: number) => val > 0 || 'Duration must be positive',
            ]"
          />
          <div v-if="formModel.spec.durationMinutes" class="form-hint">
            {{ formatDuration(formModel.spec.durationMinutes) }}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <BaseInput
            v-model="descriptionModel"
            type="textarea"
            :rows="3"
            placeholder="Optional description for when to use this preset..."
          />
        </div>

        <div class="form-group">
          <BaseCheckbox
            v-model="formModel.spec.default"
            label="Set as default duration preset"
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
          :label="
            isEditing ? 'Update Duration Preset' : 'Create Duration Preset'
          "
        />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import { DurationPresetCreationRequest } from "@/types";
import { useDurationPresetsStore } from "@/stores";
import type { QForm } from "quasar";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "DurationPresetFormModal",
  components: {
    BaseModal,
  },
  props: {
    presetId: {
      type: String as PropType<string>,
      required: false,
    },
  },
  emits: ["close"],
  setup() {
    const durationPresetsStore = useDurationPresetsStore();
    const toast = useToast();
    return { durationPresetsStore, toast };
  },
  data() {
    return {
      formModel: {
        meta: {
          name: "",
          description: "",
        },
        spec: {
          durationMinutes: null as number | null,
          default: false,
        },
      } as DurationPresetCreationRequest,
      formRef: null as any,
      loading: false as boolean,
    };
  },
  created() {
    if (this.presetId) {
      const editingPreset = this.durationPresetsStore.getDurationPresetById(
        this.presetId,
      );
      if (editingPreset) {
        this.formModel = {
          meta: {
            name: editingPreset.meta.name,
            description: editingPreset.meta.description,
          },
          spec: {
            durationMinutes: editingPreset.spec.durationMinutes,
            default: editingPreset.spec.default || false,
          },
        };
      }
    }
  },
  computed: {
    isEditing(): boolean {
      return !!this.presetId;
    },
    descriptionModel: {
      get(): string {
        return this.formModel.meta.description || "";
      },
      set(value: string) {
        this.formModel.meta.description = value || undefined;
      },
    },
  },
  methods: {
    formatDuration(minutes: number): string {
      if (minutes < 60) {
        return `${minutes} minutes`;
      }
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} ${hours === 1 ? "hour" : "hours"}`;
      }
      return `${hours} ${hours === 1 ? "hour" : "hours"} ${remainingMinutes} minutes`;
    },
    async handleSave() {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      if (this.isEditing) {
        return this.updatePreset();
      } else {
        return this.createPreset();
      }
    },
    async updatePreset(): Promise<void> {
      if (!this.presetId) return;
      try {
        this.loading = true;
        await this.durationPresetsStore.updateDurationPreset(
          this.presetId,
          this.formModel as DurationPresetCreationRequest,
        );
        this.toast.success("Duration preset updated successfully");
        this.$emit("close");
      } catch (error) {
        this.toast.error(
          (error as Error).message || "Failed to update duration preset",
        );
      } finally {
        this.loading = false;
      }
    },
    async createPreset(): Promise<void> {
      try {
        this.loading = true;
        await this.durationPresetsStore.createDurationPreset(
          this.formModel as DurationPresetCreationRequest,
        );
        this.toast.success("Duration preset created successfully");
        this.$emit("close");
      } catch (error) {
        this.toast.error(
          (error as Error).message || "Failed to create duration preset",
        );
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>

<style scoped>
.form-hint {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>
