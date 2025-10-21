<template>
  <BaseModal
    show
    :title="isEditing ? 'Edit Session' : 'Add New Session'"
    modal-class="modal-lg"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label class="form-label">Session Name</label>
          <input
            v-model="formModel.name"
            type="text"
            class="form-input"
            placeholder="e.g., Week 1, Summer Session A"
            required
          />
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Start Date</label>
            <input
              v-model="formModel.startDate"
              type="date"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">End Date</label>
            <input
              v-model="formModel.endDate"
              type="date"
              class="form-input"
              :min="formModel.startDate"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea
            v-model="formModel.description"
            class="form-textarea"
            rows="3"
            placeholder="Optional description for this session..."
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Maximum Campers</label>
          <input
            v-model.number="formModel.maxCampers"
            type="number"
            class="form-input"
            min="1"
            placeholder="Optional capacity limit"
          />
        </div>
      </form>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="handleSave">
        {{ isEditing ? "Update" : "Create" }} Session
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import { SessionCreationRequest } from "@/types";
import { useSessionsStore } from "@/stores";

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
  emits: ["close", "save"],
  data() {
    return {
      sessionsStore: useSessionsStore(),
      formModel: {
        name: "",
        startDate: "",
        endDate: "",
        description: "",
      } as SessionCreationRequest
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
          description: editingSession.description,
          maxCampers: editingSession.maxCampers,
        };
      }
    }
  },
  computed: {
    isEditing(): boolean {
      return !!this.sessionId;
    },
  },
  methods: {
    handleSave() {
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
