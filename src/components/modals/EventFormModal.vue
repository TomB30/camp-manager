<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Edit Event' : 'Create New Event'"
    @close="$emit('close')"
  >
    <template #body>
      <form @submit.prevent="handleSave">
        <!-- Activity Template Selector (only show when creating new event) -->
        <div v-if="!isEditing" class="form-group">
          <label class="form-label">Create from Activity Template (Optional)</label>
          <Autocomplete
            v-model="selectedActivityId"
            :options="activityOptions"
            placeholder="Select an activity template..."
            @update:modelValue="applyActivityTemplate"
          />
          <div v-if="selectedActivityId" class="text-xs text-secondary mt-1">
            Event details will be pre-filled from the activity template. You can still modify them.
          </div>
        </div>

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
          <label class="form-label">Required Certifications (Optional)</label>
          <SelectionList
            v-model="selectedCertificationIds"
            :items="store.certifications"
            item-type="certification"
            placeholder="Select a certification..."
            empty-text="No certifications required"
            add-button-text="Add"
            mode="multiple"
            :get-label-fn="getCertificationLabel"
            :get-initials-fn="getCertificationInitials"
            :get-options-fn="getCertificationOption"
          />
          <p class="form-help-text">Staff assigned to this event should have these certifications</p>
        </div>

        <div class="form-group">
          <label class="form-label">Assign Staff Members (Optional)</label>
          <SelectionList
            v-model="localFormData.assignedStaffIds"
            :items="availableStaffMembers"
            item-type="staff member"
            placeholder="Select a staff member..."
            empty-text="No staff members assigned"
            add-button-text="Assign"
            mode="multiple"
            :get-label-fn="getStaffLabel"
            :get-initials-fn="getStaffInitials"
            :get-options-fn="getStaffOption"
          >
            <template #after-items>
              <div class="text-xs text-secondary mt-2">
                <div v-if="selectedCertificationIds.length > 0">✓ = Has all required certifications</div>
                <div>⚠️ = Already assigned to another event at this time</div>
              </div>
            </template>
          </SelectionList>
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
      <button class="btn btn-primary" @click="handleSave">{{ isEditing ? 'Save Changes' : 'Create Event' }}</button>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { useCampStore } from '@/stores/campStore';
import { conflictDetector } from '@/services/conflicts';
import BaseModal from '@/components/BaseModal.vue';
import Autocomplete, { type AutocompleteOption } from '@/components/Autocomplete.vue';
import ColorPicker from '@/components/ColorPicker.vue';
import SelectionList from '@/components/SelectionList.vue';
import type { Event, Room, CamperGroup, Camper, StaffMember, Certification } from '@/types/api';

interface EventFormData {
  title: string;
  startTime: string;
  endTime: string;
  roomId: string;
  capacity: number;
  type: Event['type'];
  color: string;
  requiredCertifications: string[];
  assignedStaffIds: string[];
  camperGroupIds: string[];
  programId?: string;
  activityId?: string;
}

export default defineComponent({
  name: 'EventFormModal',
  components: {
    BaseModal,
    Autocomplete,
    ColorPicker,
    SelectionList
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
      type: Object as PropType<EventFormData>,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    editingEventId: {
      type: String,
      default: null,
    },
    rooms: {
      type: Array as PropType<Room[]>,
      required: true
    },
    staffMembers: {
      type: Array as PropType<StaffMember[]>,
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
      selectedActivityId: '',
      selectedCertificationIds: [] as string[],
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
    store() {
      return useCampStore();
    },
    roomOptions(): AutocompleteOption[] {
      return this.rooms.map(room => ({
        label: `${room.name} (Capacity: ${room.capacity})`,
        value: room.id
      }));
    },
    activityOptions(): AutocompleteOption[] {
      // Group activities by program
      const optionsWithGroups: AutocompleteOption[] = [];
      
      this.store.programs.forEach(program => {
        const programActivities = this.store.getActivitiesInProgram(program.id);
        if (programActivities.length > 0) {
          programActivities.forEach(activity => {
            optionsWithGroups.push({
              label: `${activity.name} (${program.name})`,
              value: activity.id
            });
          });
        }
      });
      
      return optionsWithGroups;
    },
    availableStaffMembers(): StaffMember[] {
      // Return staff members with their original data
      return this.staffMembers;
    },
    eventStartDateTime(): Date | null {
      if (!this.localFormData.startTime) return null;
      const [hours, minutes] = this.localFormData.startTime.split(':').map(Number);
      const date = new Date(this.eventDate);
      date.setHours(hours, minutes, 0, 0);
      return date;
    },
    eventEndDateTime(): Date | null {
      if (!this.localFormData.endTime) return null;
      const [hours, minutes] = this.localFormData.endTime.split(':').map(Number);
      const date = new Date(this.eventDate);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
  },
  watch: {
    formData: {
      handler(newVal) {
        this.localFormData = JSON.parse(JSON.stringify(newVal));
        // Initialize certification IDs from names
        if (newVal.requiredCertifications && newVal.requiredCertifications.length > 0) {
          this.selectedCertificationIds = this.getCertificationIdsFromNames(newVal.requiredCertifications);
        } else {
          this.selectedCertificationIds = [];
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    applyActivityTemplate(activityId: string) {
      if (!activityId) return;
      
      const activity = this.store.getActivityById(activityId);
      if (!activity) return;
      
      // Auto-populate form fields from activity template
      this.localFormData.title = activity.name;
      
      // Calculate end time based on start time and duration
      if (this.localFormData.startTime) {
        const [hours, minutes] = this.localFormData.startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);
        
        const endDate = new Date(startDate.getTime() + activity.durationMinutes * 60000);
        const endHours = endDate.getHours().toString().padStart(2, '0');
        const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
        this.localFormData.endTime = `${endHours}:${endMinutes}`;
      }
      
      // Set default room if specified
      if (activity.defaultRoomId) {
        this.localFormData.roomId = activity.defaultRoomId;
      }
      
      // Set default capacity if specified
      if (activity.defaultCapacity) {
        this.localFormData.capacity = activity.defaultCapacity;
      }
      
      // Set color if specified
      if (activity.color) {
        this.localFormData.color = activity.color;
      }
      
      // Set required certifications if specified
      if (activity.requiredCertifications && activity.requiredCertifications.length > 0) {
        this.localFormData.requiredCertifications = [...activity.requiredCertifications];
        this.selectedCertificationIds = this.getCertificationIdsFromNames(activity.requiredCertifications);
      }
      
      // Set program and activity IDs for reference
      // Use the first program if activity belongs to multiple programs
      this.localFormData.programId = activity.programIds[0];
      this.localFormData.activityId = activity.id;
    },
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
    getCertificationIdsFromNames(names: string[]): string[] {
      return names
        .map(name => {
          const cert = this.store.certifications.find(c => c.name === name);
          return cert ? cert.id : '';
        })
        .filter(id => id !== '');
    },
    getCertificationNamesFromIds(ids: string[]): string[] {
      return ids
        .map(id => {
          const cert = this.store.getCertificationById(id);
          return cert ? cert.name : '';
        })
        .filter(name => name !== '');
    },
    getCertificationLabel(cert: Certification): string {
      return cert.name;
    },
    getCertificationInitials(cert: Certification): string {
      return cert.name.substring(0, 2).toUpperCase();
    },
    getCertificationOption(cert: Certification): AutocompleteOption {
      return {
        label: cert.name,
        value: cert.id
      };
    },
    staffHasRequiredCertifications(staff: StaffMember): boolean {
      if (this.selectedCertificationIds.length === 0) return true;
      if (!staff.certificationIds || staff.certificationIds.length === 0) return false;
      return this.selectedCertificationIds.every(certId => staff.certificationIds!.includes(certId));
    },
    isStaffAvailable(staff: StaffMember): { available: boolean; reason?: string } {
      if (!this.eventStartDateTime || !this.eventEndDateTime) {
        return { available: true };
      }

      const result = conflictDetector.canAssignStaff(
        this.eventStartDateTime,
        this.eventEndDateTime,
        staff.id,
        this.store.events,
        this.editingEventId || undefined
      );

      return { available: result.canAssign, reason: result.reason };
    },
    getStaffLabel(staff: StaffMember): string {
      const baseLabel = `${staff.firstName} ${staff.lastName} - ${staff.role}`;
      const availability = this.isStaffAvailable(staff);
      
      let prefix = '';
      
      // Check certifications
      if (this.selectedCertificationIds.length > 0) {
        const hasCerts = this.staffHasRequiredCertifications(staff);
        if (hasCerts) {
          prefix = '✓ ';
        }
      }
      
      // Check availability
      if (!availability.available) {
        return `⚠️ ${baseLabel} (${availability.reason})`;
      }
      
      return prefix + baseLabel;
    },
    getStaffInitials(staff: StaffMember): string {
      return `${staff.firstName[0]}${staff.lastName[0]}`.toUpperCase();
    },
    getStaffOption(staff: StaffMember): AutocompleteOption {
      const baseLabel = `${staff.firstName} ${staff.lastName} - ${staff.role}`;
      const availability = this.isStaffAvailable(staff);
      
      let prefix = '';
      
      // Check certifications
      if (this.selectedCertificationIds.length > 0) {
        const hasCerts = this.staffHasRequiredCertifications(staff);
        if (hasCerts) {
          prefix = '✓ ';
        }
      }
      
      // Check availability
      if (!availability.available) {
        return {
          label: `⚠️ ${baseLabel} (${availability.reason})`,
          value: staff.id
        };
      }
      
      return {
        label: prefix + baseLabel,
        value: staff.id
      };
    },
    handleSave() {
      // Convert certification IDs to names before saving
      this.localFormData.requiredCertifications = this.getCertificationNamesFromIds(this.selectedCertificationIds);
      this.$emit('save', this.localFormData);
    },
  },
});
</script>

<style scoped>
.form-help-text {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

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

.mt-2 {
  margin-top: 0.5rem;
}
</style>

