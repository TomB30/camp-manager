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

        <div class="form-group">
          <label class="form-label">Camp Session</label>
          <SelectionList
            v-model="localFormData.sessionId"
            :items="sessions"
            item-type="session"
            placeholder="Select a session..."
            empty-text="No session selected yet"
            add-button-text="Select"
            mode="single"
            :get-label-fn="getSessionLabel"
            :get-initials-fn="getSessionInitials"
            :get-options-fn="getSessionOption"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Campers in this Group</label>
          <div v-if="!localFormData.sessionId" class="info-message mb-2">
            <Info :size="16" />
            Please select a session first to see available campers
          </div>
          <SelectionList
            v-model="localFormData.camperIds"
            :items="availableCampers"
            item-type="camper"
            placeholder="Add a camper..."
            empty-text="No campers available for this session"
            add-button-text="Add"
            mode="multiple"
            :get-label-fn="getCamperLabel"
            :get-initials-fn="getCamperInitials"
            :get-options-fn="getCamperOption"
            :disabled="!localFormData.sessionId"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Staff Members</label>
          <SelectionList
            v-model="localFormData.staffMemberIds"
            :items="staffMembers"
            item-type="staff member"
            placeholder="Add a staff member..."
            empty-text="No staff members assigned yet"
            add-button-text="Add"
            mode="multiple"
            :get-label-fn="getStaffLabel"
            :get-initials-fn="getStaffInitials"
            :get-options-fn="getStaffOption"
          />
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
          <SelectionList
            v-model="localFormData.sleepingRoomId"
            :items="sleepingRooms"
            item-type="sleeping room"
            placeholder="Select a sleeping room..."
            empty-text="No sleeping room assigned yet"
            add-button-text="Select"
            mode="single"
            :get-label-fn="getRoomLabel"
            :get-initials-fn="getRoomInitials"
            :get-options-fn="getRoomOption"
          >
            <template #after-items>
              <div v-if="selectedRoom && !canFitInRoom" class="capacity-warning">
                ⚠️ This room may not have enough beds for all campers and staff
              </div>
            </template>
          </SelectionList>
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
import SelectionList from '@/components/SelectionList.vue';
import ColorPicker from '@/components/ColorPicker.vue';
import type { Camper, StaffMember, SleepingRoom, FamilyGroup, CampSession } from '@/types/api';
import type { AutocompleteOption } from '@/components/Autocomplete.vue';
import { conflictDetector } from '@/services/conflicts';
import { Info } from 'lucide-vue-next';

interface FamilyGroupFormData {
  name: string;
  description: string;
  sessionId: string;
  sleepingRoomId: string;
  staffMemberIds: string[];
  camperIds: string[];
  color: string;
}

export default defineComponent({
  name: 'FamilyGroupFormModal',
  components: {
    BaseModal,
    SelectionList,
    ColorPicker,
    Info
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
    },
    familyGroups: {
      type: Array as PropType<FamilyGroup[]>,
      required: true
    },
    sessions: {
      type: Array as PropType<CampSession[]>,
      required: true
    },
    editingGroupId: {
      type: String as PropType<string | null>,
      default: null
    }
  },
  emits: ['close', 'save'],
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData))
    };
  },
  computed: {
    selectedSession(): CampSession | undefined {
      return this.sessions.find(s => s.id === this.localFormData.sessionId);
    },
    // Filter campers to only show those registered for the selected session
    availableCampers(): Camper[] {
      if (!this.localFormData.sessionId) {
        return [];
      }
      return this.campers.filter(camper => camper.sessionId === this.localFormData.sessionId);
    },
    totalPeople(): number {
      return this.localFormData.camperIds.length + this.localFormData.staffMemberIds.length;
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
    },
    // When session changes, clear camper selections
    'localFormData.sessionId'(newSessionId: string, oldSessionId: string) {
      if (newSessionId !== oldSessionId && oldSessionId) {
        // Clear campers when session changes
        this.localFormData.camperIds = [];
      }
    }
  },
  methods: {
    // Session methods
    getSessionLabel(session: CampSession): string {
      return session.name;
    },
    getSessionInitials(session: CampSession): string {
      const words = session.name.split(' ');
      if (words.length >= 2) {
        return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
      }
      return session.name.substring(0, 2).toUpperCase();
    },
    getSessionOption(session: CampSession): AutocompleteOption {
      const startDate = new Date(session.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endDate = new Date(session.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return {
        label: `${session.name} (${startDate} - ${endDate})`,
        value: session.id
      };
    },

    // Camper methods
    getCamperLabel(camper: Camper): string {
      return `${camper.firstName} ${camper.lastName}`;
    },
    getCamperInitials(camper: Camper): string {
      return `${camper.firstName.charAt(0)}${camper.lastName.charAt(0)}`;
    },
    getCamperOption(camper: Camper): AutocompleteOption {
      return {
        label: `${camper.firstName} ${camper.lastName} (Age ${camper.age})`,
        value: camper.id
      };
    },

    // Staff methods
    getStaffLabel(staff: StaffMember): string {
      return `${staff.firstName} ${staff.lastName} (${staff.role})`;
    },
    getStaffInitials(staff: StaffMember): string {
      return `${staff.firstName.charAt(0)}${staff.lastName.charAt(0)}`;
    },
    getStaffOption(staff: StaffMember): AutocompleteOption {
      return {
        label: `${staff.firstName} ${staff.lastName} (${staff.role})`,
        value: staff.id
      };
    },

    // Room methods
    getRoomLabel(room: SleepingRoom): string {
      return `${room.name} (${room.beds} beds)`;
    },
    getRoomInitials(room: SleepingRoom): string {
      const words = room.name.split(' ');
      if (words.length >= 2) {
        return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
      }
      return room.name.substring(0, 2).toUpperCase();
    },
    getRoomOption(room: SleepingRoom): AutocompleteOption {
      const hasEnoughBeds = room.beds >= this.totalPeople;
      
      // Check if the room is available for the selected session
      let isAvailable = true;
      let conflictMessage = '';
      
      if (this.localFormData.sessionId) {
        const validation = conflictDetector.canAssignFamilyGroupToRoomBySession(
          room.id,
          this.localFormData.sessionId,
          this.familyGroups,
          this.editingGroupId || undefined
        );
        
        isAvailable = validation.canAssign;
        
        if (!isAvailable && validation.conflictingGroups && validation.conflictingGroups.length > 0) {
          const groupNames = validation.conflictingGroups.map(g => g.name).join(', ');
          conflictMessage = ` - Occupied by: ${groupNames}`;
        }
      }
      
      const warnings: string[] = [];
      if (!hasEnoughBeds) warnings.push('Not enough beds');
      if (!isAvailable) warnings.push(conflictMessage || 'Occupied during this session');
      
      const warningText = warnings.length > 0 ? ' - ' + warnings.join(', ') : '';
      
      return {
        label: `${room.name} (${room.beds} beds)${warningText}`,
        value: room.id,
        disabled: !hasEnoughBeds || !isAvailable
      };
    },

    handleSave() {
      this.$emit('save', this.localFormData);
    }
  }
});
</script>

<style scoped>
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

.info-message {
  padding: 0.75rem;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: var(--radius);
  color: #1E40AF;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}
</style>

