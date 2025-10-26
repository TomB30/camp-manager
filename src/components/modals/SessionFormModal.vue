<template>
  <BaseModal
    :title="isEditing ? 'Update Session' : 'Create Session'"
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
import { SessionCreationRequest } from "@/types";
import { useSessionsStore } from "@/stores";
import type { QForm } from "quasar";
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "SessionFormModal",
  components: {
    BaseModal,
  },
  props: {
    sessionId: {
      type: String as PropType<string>,
      required: false,
    },
  },
  emits: ["close"],
  setup() {
    const sessionsStore = useSessionsStore();
    const toast = useToast();
    return { sessionsStore, toast };
  },
  data() {
    return {
      formModel: {
        name: "",
        startDate: "",
        endDate: "",
        description: "",
      } as SessionCreationRequest,
      formRef: null as any,
      loading: false as boolean,
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
  },
  methods: {
    async handleSave() {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      if (this.isEditing) {
        return this.updateSession();
      } else {
        return this.createSession();
      }
    },
    async updateSession(): Promise<void> {
      if (!this.sessionId) return;
      try {
        this.loading = true;
        await this.sessionsStore.updateSession(this.sessionId, this.formModel);
        this.toast.success("Session updated successfully");
      } catch (error) {
        this.toast.error(
          (error as Error).message || "Failed to update session",
        );
      } finally {
        this.loading = false;
        this.$emit("close");
      }
    },
    async createSession(): Promise<void> {
      try {
        this.loading = true;
        await this.sessionsStore.createSession(this.formModel);
        this.toast.success("Session created successfully");
      } catch (error) {
        this.toast.error(
          (error as Error).message || "Failed to create session",
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
