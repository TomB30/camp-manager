<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Session' : 'Add New Session'"
    modal-class="modal-lg"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label class="form-label">Session Name *</label>
          <input
            v-model="localFormData.name"
            type="text"
            class="form-input"
            placeholder="e.g., Week 1, Summer Session A"
            required
          />
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Start Date *</label>
            <input
              v-model="localFormData.startDate"
              type="date"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">End Date *</label>
            <input
              v-model="localFormData.endDate"
              type="date"
              class="form-input"
              :min="localFormData.startDate"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea
            v-model="localFormData.description"
            class="form-textarea"
            rows="3"
            placeholder="Optional description for this session..."
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Maximum Campers</label>
          <input
            v-model.number="localFormData.maxCampers"
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
        {{ isEditing ? "Update" : "Add" }} Session
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";

interface SessionFormData {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  maxCampers?: number;
}

export default defineComponent({
  name: "SessionFormModal",
  components: {
    BaseModal,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
    formData: {
      type: Object as PropType<SessionFormData>,
      required: true,
    },
  },
  emits: ["close", "save"],
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData)),
    };
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
    handleSave() {
      this.$emit("save", this.localFormData);
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
