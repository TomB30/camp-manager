<template>
  <BaseModal
    :title="isEditing ? 'Edit Session' : 'Add New Session'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <div class="form-group">
          <label class="form-label">Session Name</label>
          <BaseInput
            v-model="formModel.name"
            placeholder="e.g., Week 1, Summer Session A"
            :rules="[(val: string) => !!val || 'Enter session name']"
          />
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Start Date</label>
            <BaseInput
              v-model="formModel.startDate"
              type="date"
              :rules="[(val: string) => !!val || 'Enter start date']"
            />
          </div>

          <div class="form-group">
            <label class="form-label">End Date</label>
            <BaseInput
              v-model="formModel.endDate"
              type="date"
              :rules="[
                (val: string) => !!val || 'Enter end date',
                (val: string) =>
                  !formModel.startDate ||
                  val >= formModel.startDate ||
                  'End date must be after start date',
              ]"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <BaseInput
            v-model="descriptionModel"
            type="textarea"
            :rows="3"
            placeholder="Optional description for this session..."
          />
        </div>

        <div class="form-group">
          <label class="form-label">Maximum Campers</label>
          <BaseInput
            v-model="maxCampersModel"
            type="number"
            placeholder="Optional capacity limit"
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
          :label="isEditing ? 'Update Session' : 'Create Session'"
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
import { SessionCreationRequest } from "@/types";
import { useSessionsStore } from "@/stores";
import type { QForm } from "quasar";

export default defineComponent({
  name: "SessionFormModal",
  components: {
    BaseModal,
    BaseInput,
    BaseButton,
  },
  props: {
    sessionId: {
      type: String as PropType<string>,
      required: false,
    },
  },
  emits: ["close", "save"],
  data() {
    return {
      sessionsStore: useSessionsStore(),
      formModel: {
        name: "",
        startDate: "",
        endDate: "",
        description: "",
        maxCampers: undefined,
      } as SessionCreationRequest,
      formRef: null as any,
    };
  },
  created() {
    if (this.sessionId) {
      const editingSession = this.sessionsStore.getSessionById(this.sessionId);
      if (editingSession) {
        this.formModel = {
          name: editingSession.name,
          startDate: editingSession.startDate,
          endDate: editingSession.endDate,
          description: editingSession.description || "",
          maxCampers: editingSession.maxCampers,
        };
      }
    }
  },
  computed: {
    isEditing(): boolean {
      return !!this.sessionId;
    },
    descriptionModel: {
      get(): string {
        return this.formModel.description || "";
      },
      set(value: string) {
        this.formModel.description = value || undefined;
      },
    },
    maxCampersModel: {
      get(): string {
        return this.formModel.maxCampers?.toString() || "";
      },
      set(value: string) {
        const num = parseInt(value);
        this.formModel.maxCampers = isNaN(num) ? undefined : num;
      },
    },
  },
  methods: {
    async handleSave() {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      this.$emit("save", this.formModel);
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
