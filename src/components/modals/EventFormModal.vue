<template>
  <BaseModal
    :show="show"
    title="Create New Event"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label class="form-label">Title</label>
          <input v-model="localFormData.title" type="text" class="form-input" required />
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Start Time</label>
            <input v-model="localFormData.startTime" type="time" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">End Time</label>
            <input v-model="localFormData.endTime" type="time" class="form-input" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Room</label>
          <Autocomplete
            v-model="localFormData.roomId"
            :options="roomOptions"
            placeholder="Select a room"
            :required="true"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Capacity</label>
          <input v-model.number="localFormData.capacity" type="number" min="1" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Type</label>
          <Autocomplete
            v-model="localFormData.type"
            :options="eventTypeOptions"
            placeholder="Select event type"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Color</label>
          <ColorPicker v-model="localFormData.color" />
        </div>

        <div class="form-group">
          <label class="form-label">Assign Camper Groups (Optional)</label>
          <div class="camper-groups-selector">
            <div v-for="group in camperGroups" :key="group.id" class="checkbox-item">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  :value="group.id" 
                  v-model="localFormData.camperGroupIds"
                  class="checkbox-input"
                />
                <span 
                  class="group-label" 
                  :style="{ borderLeft: `3px solid ${group.color || '#6366F1'}` }"
                >
                  {{ group.name }} ({{ getGroupCamperCount(group.id) }} campers)
                </span>
              </label>
            </div>
            <div v-if="camperGroups.length === 0" class="text-secondary text-sm">
              No camper groups available. Create groups in the Groups section.
            </div>
          </div>
          <div v-if="localFormData.camperGroupIds.length > 0" class="text-xs text-secondary mt-1">
            This will automatically enroll {{ getTotalCampersFromGroups() }} campers when the event is created.
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="handleSave">Create Event</button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import Autocomplete, { type AutocompleteOption } from '@/components/Autocomplete.vue';
import ColorPicker from '@/components/ColorPicker.vue';
import type { Event, Room, CamperGroup, Camper } from '@/types/api';

interface EventFormData {
  title: string;
  startTime: string;
  endTime: string;
  roomId: string;
  capacity: number;
  type: Event['type'];
  color: string;
  camperGroupIds: string[];
}

export default defineComponent({
  name: 'EventFormModal',
  components: {
    BaseModal,
    Autocomplete,
    ColorPicker
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    formData: {
      type: Object as PropType<EventFormData>,
      required: true,
    },
    rooms: {
      type: Array as PropType<Room[]>,
      required: true
    },
    camperGroups: {
      type: Array as PropType<CamperGroup[]>,
      required: true
    },
    campers: {
      type: Array as PropType<Camper[]>,
      required: true
    }
  },
  emits: ['close', 'save'],
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData)),
      eventTypeOptions: [
        { label: 'Activity', value: 'activity' },
        { label: 'Sports', value: 'sports' },
        { label: 'Arts', value: 'arts' },
        { label: 'Education', value: 'education' },
        { label: 'Meal', value: 'meal' },
        { label: 'Free Time', value: 'free-time' }
      ] as AutocompleteOption[]
    };
  },
  computed: {
    roomOptions(): AutocompleteOption[] {
      return this.rooms.map(room => ({
        label: `${room.name} (Capacity: ${room.capacity})`,
        value: room.id
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
    getGroupCamperCount(groupId: string): number {
      const group = this.camperGroups.find(g => g.id === groupId);
      if (!group) return 0;
      
      // Get base campers
      let baseCampers: Camper[];
      if (group.familyGroupIds && group.familyGroupIds.length > 0) {
        baseCampers = this.campers.filter(c => 
          c.familyGroupId && group.familyGroupIds!.includes(c.familyGroupId)
        );
      } else {
        baseCampers = this.campers;
      }
      
      // Apply filters
      return baseCampers.filter(camper => {
        if (group.filters.ageMin !== undefined && camper.age < group.filters.ageMin) return false;
        if (group.filters.ageMax !== undefined && camper.age > group.filters.ageMax) return false;
        if (group.filters.gender && camper.gender !== group.filters.gender) return false;
        if (group.filters.hasAllergies !== undefined) {
          const hasAllergies = camper.allergies && camper.allergies.length > 0;
          if (group.filters.hasAllergies !== hasAllergies) return false;
        }
        return true;
      }).length;
    },
    getTotalCampersFromGroups(): number {
      return this.localFormData.camperGroupIds.reduce((total: number, groupId: string) => {
        return total + this.getGroupCamperCount(groupId);
      }, 0);
    },
    handleSave() {
      this.$emit('save', this.localFormData);
    },
  },
});
</script>

<style scoped>
.camper-groups-selector {
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
}

.checkbox-item {
  margin-bottom: 0.5rem;
}

.checkbox-item:last-child {
  margin-bottom: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius);
  transition: background 0.15s ease;
}

.checkbox-label:hover {
  background: var(--background);
}

.checkbox-input {
  cursor: pointer;
}

.group-label {
  padding-left: 0.5rem;
  flex: 1;
}

.mt-1 {
  margin-top: 0.25rem;
}
</style>

