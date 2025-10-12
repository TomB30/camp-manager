<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Cabin' : 'Add New Cabin'"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label class="form-label">Cabin Name</label>
          <input v-model="localFormData.name" type="text" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Number of Beds</label>
          <input v-model.number="localFormData.beds" type="number" min="1" max="50" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Location (optional)</label>
          <Autocomplete
            v-model="localFormData.locationId"
            :options="locationOptions"
            placeholder="Select a location..."
            :required="false"
          />
          <p class="form-help-text">Select the physical location where this cabin is located</p>
        </div>
      </form>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="handleSave">
        {{ isEditing ? 'Update' : 'Add' }} Cabin
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import Autocomplete, { type AutocompleteOption } from '@/components/Autocomplete.vue';
import { useCampStore } from '@/stores/campStore';

interface RoomFormData {
  name: string;
  beds: number;
  locationId?: string;
}

export default defineComponent({
  name: 'SleepingRoomFormModal',
  components: {
    BaseModal,
    Autocomplete
  },
  props: {
    show: {
      type: Boolean,
      required: true
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object as PropType<RoomFormData>,
      required: true
    }
  },
  emits: ['close', 'save'],
  setup() {
    const store = useCampStore();
    return { store };
  },
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData))
    };
  },
  computed: {
    locationOptions(): AutocompleteOption[] {
      return this.store.locations.map(location => ({
        label: location.name,
        value: location.id
      }));
    }
  },
  watch: {
    formData: {
      handler(newVal) {
        this.localFormData = JSON.parse(JSON.stringify(newVal));
      },
      deep: true
    }
  },
  methods: {
    handleSave() {
      this.$emit('save', this.localFormData);
    }
  }
});
</script>

<style scoped>
.form-help-text {
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>

