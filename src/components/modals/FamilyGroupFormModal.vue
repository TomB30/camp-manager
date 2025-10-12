<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Family Group' : 'Create New Family Group'"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label class="form-label">Group Name</label>
          <input v-model="localFormData.name" type="text" class="form-input" required placeholder="e.g., Eagles Family" />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="localFormData.description" class="form-textarea" placeholder="Optional description..."></textarea>
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Start Date</label>
            <input v-model="localFormData.startDate" type="date" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">End Date</label>
            <input v-model="localFormData.endDate" type="date" class="form-input" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Campers in this Group</label>
          <div class="campers-selection">
            <div v-if="localFormData.camperIds.length > 0" class="selected-campers">
              <div 
                v-for="camperId in localFormData.camperIds"
                :key="camperId"
                class="selected-camper-item"
              >
                <div class="camper-info-sm">
                  <div class="camper-avatar-xs">
                    {{ getCamperInitials(camperId) }}
                  </div>
                  <span>{{ getCamperFullName(camperId) }}</span>
                </div>
                <button 
                  type="button"
                  class="btn-remove"
                  @click="removeCamper(camperId)"
                  title="Remove camper"
                >
                  ✕
                </button>
              </div>
            </div>
            <div v-else class="text-sm text-secondary mb-2">
              No campers assigned yet
            </div>
            
            <div class="add-camper-section">
              <Autocomplete
                v-model="selectedCamperToAdd"
                :options="availableCampersOptions"
                placeholder="Add a camper..."
              />
              <button 
                type="button"
                class="btn btn-sm btn-primary"
                @click="addCamper"
                :disabled="!selectedCamperToAdd"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Staff Members</label>
          <div class="checkbox-group">
            <label 
              v-for="staff in staffMembers" 
              :key="staff.id"
              class="checkbox-label"
            >
              <input 
                type="checkbox" 
                :value="staff.id"
                v-model="localFormData.staffMemberIds"
                class="checkbox-input"
              />
              <span>{{ staff.firstName }} {{ staff.lastName }} ({{ staff.role }})</span>
            </label>
            <div v-if="staffMembers.length === 0" class="text-sm text-secondary">
              No staff members available
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Sleeping Room</label>
          <div v-if="totalPeople > 0" class="capacity-info mb-2">
            <span class="badge badge-primary">
              {{ totalPeople }} {{ totalPeople === 1 ? 'person' : 'people' }} 
              ({{ localFormData.camperIds.length }} {{ localFormData.camperIds.length === 1 ? 'camper' : 'campers' }}
              + {{ localFormData.staffMemberIds.length }} staff)
            </span>
          </div>
          <Autocomplete
            v-model="localFormData.sleepingRoomId"
            :options="sleepingRoomOptions"
            placeholder="Select a sleeping room..."
            :required="true"
          />
          <div v-if="localFormData.sleepingRoomId && selectedRoom && !canFitInRoom" class="capacity-warning">
            ⚠️ This room may not have enough beds for all campers and staff
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Group Color</label>
          <ColorPicker v-model="localFormData.color" />
        </div>
      </form>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
      <button class="btn btn-primary" @click="handleSave">
        {{ isEditing ? 'Update' : 'Create' }} Group
      </button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import BaseModal from '@/components/BaseModal.vue';
import Autocomplete, { type AutocompleteOption } from '@/components/Autocomplete.vue';
import ColorPicker from '@/components/ColorPicker.vue';
import type { Camper, StaffMember, SleepingRoom } from '@/types/api';

interface FamilyGroupFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  sleepingRoomId: string;
  staffMemberIds: string[];
  camperIds: string[];
  color: string;
}

export default defineComponent({
  name: 'FamilyGroupFormModal',
  components: {
    BaseModal,
    Autocomplete,
    ColorPicker
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
      type: Object as PropType<FamilyGroupFormData>,
      required: true
    },
    campers: {
      type: Array as PropType<Camper[]>,
      required: true
    },
    staffMembers: {
      type: Array as PropType<StaffMember[]>,
      required: true
    },
    sleepingRooms: {
      type: Array as PropType<SleepingRoom[]>,
      required: true
    }
  },
  emits: ['close', 'save'],
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData)),
      selectedCamperToAdd: ''
    };
  },
  computed: {
    availableCampers(): Camper[] {
      return this.campers.filter(c => !this.localFormData.camperIds.includes(c.id));
    },
    availableCampersOptions(): AutocompleteOption[] {
      return this.availableCampers.map(camper => ({
        label: `${camper.firstName} ${camper.lastName} (Age ${camper.age})`,
        value: camper.id
      }));
    },
    totalPeople(): number {
      return this.localFormData.camperIds.length + this.localFormData.staffMemberIds.length;
    },
    sleepingRoomOptions(): AutocompleteOption[] {
      return this.sleepingRooms.map(room => ({
        label: `${room.name} (${room.beds} beds)${room.beds >= this.totalPeople ? '' : ' - Not enough beds'}`,
        value: room.id,
        disabled: room.beds < this.totalPeople
      }));
    },
    selectedRoom(): SleepingRoom | undefined {
      return this.sleepingRooms.find(r => r.id === this.localFormData.sleepingRoomId);
    },
    canFitInRoom(): boolean {
      return this.selectedRoom ? this.selectedRoom.beds >= this.totalPeople : false;
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
    getCamperFullName(camperId: string): string {
      const camper = this.campers.find(c => c.id === camperId);
      return camper ? `${camper.firstName} ${camper.lastName}` : 'Unknown';
    },
    getCamperInitials(camperId: string): string {
      const camper = this.campers.find(c => c.id === camperId);
      return camper ? `${camper.firstName.charAt(0)}${camper.lastName.charAt(0)}` : '??';
    },
    addCamper(): void {
      if (this.selectedCamperToAdd && !this.localFormData.camperIds.includes(this.selectedCamperToAdd)) {
        this.localFormData.camperIds.push(this.selectedCamperToAdd);
        this.selectedCamperToAdd = '';
      }
    },
    removeCamper(camperId: string): void {
      const index = this.localFormData.camperIds.indexOf(camperId);
      if (index > -1) {
        this.localFormData.camperIds.splice(index, 1);
      }
    },
    handleSave() {
      this.$emit('save', this.localFormData);
    }
  }
});
</script>

<style scoped>
.campers-selection {
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 0.75rem;
  background: var(--background);
}

.selected-campers {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.selected-camper-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  transition: background 0.15s ease;
}

.selected-camper-item:hover {
  background: var(--surface);
}

.camper-info-sm {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.camper-avatar-xs {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.btn-remove {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: var(--error-color, #ef4444);
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  padding: 0;
  line-height: 1;
}

.btn-remove:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.add-camper-section {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
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

.capacity-info {
  margin-bottom: 0.5rem;
}

.capacity-warning {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  border-radius: var(--radius);
  color: #92400E;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}
</style>

