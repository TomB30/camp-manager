<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Room' : 'Add New Room'"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label class="form-label">Room Name</label>
          <input v-model="localFormData.name" type="text" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Number of Beds</label>
          <input v-model.number="localFormData.beds" type="number" min="1" max="50" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Area (optional)</label>
          <Autocomplete
            v-model="localFormData.areaId"
            :options="locationOptions"
            placeholder="Select an area..."
            :required="false"
          />
          <p class="form-help-text">Select the physical area where this room is located</p>
        </div>
      </form>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="handleSave">
        {{ isEditing ? 'Update' : 'Add' }} Room
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import Autocomplete, { type AutocompleteOption } from '@/components/Autocomplete.vue';
import { useAreasStore } from '@/stores';

interface RoomFormData {
  name: string;
  beds: number;
  areaId?: string;
}

export default defineComponent({
  name: 'HousingRoomFormModal',
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
    const areasStore = useAreasStore();
    return { areasStore };
  },
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData))
    };
  },
  computed: {
    locationOptions(): AutocompleteOption[] {
      return this.areasStore.areas.map(location => ({
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

