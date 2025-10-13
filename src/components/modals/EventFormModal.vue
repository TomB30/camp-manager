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

        <div class="form-group">
          <label class="form-label">Event Date</label>
          <input v-model="localFormData.eventDate" type="date" class="form-input" required />
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

        <!-- Recurrence Section (only show when creating new event) -->
        <div v-if="!isEditing" class="form-group recurrence-section">
          <div class="recurrence-header">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="recurrenceData.enabled"
                class="checkbox-input"
              />
              <span class="form-label" style="margin: 0;">Repeat Event</span>
            </label>
          </div>

          <div v-if="recurrenceData.enabled" class="recurrence-content">
            <!-- Repeat Every -->
            <div class="recurrence-row">
              <label class="recurrence-label">Repeat every</label>
              <div class="recurrence-inputs">
                <NumberInput 
                  v-model="recurrenceData.interval"
                  :min="1"
                  :max="99"
                />
                <select v-model="recurrenceData.frequency" class="frequency-select">
                  <option value="daily">{{ recurrenceData.interval === 1 ? 'day' : 'days' }}</option>
                  <option value="weekly">{{ recurrenceData.interval === 1 ? 'week' : 'weeks' }}</option>
                  <option value="monthly">{{ recurrenceData.interval === 1 ? 'month' : 'months' }}</option>
                </select>
              </div>
            </div>

            <!-- Repeat On (for weekly) -->
            <div v-if="recurrenceData.frequency === 'weekly'" class="recurrence-row">
              <label class="recurrence-label">Repeat on</label>
              <div class="days-selector">
                <button
                  v-for="(day, index) in daysOfWeek"
                  :key="index"
                  type="button"
                  class="day-button"
                  :class="{ active: recurrenceData.daysOfWeek && recurrenceData.daysOfWeek.includes(index as any) }"
                  @click="toggleDay(index)"
                >
                  {{ day }}
                </button>
              </div>
              <p class="recurrence-help-text">
                Select which days of the week this event should occur. 
                Example: Select S, T, Th for every Sunday, Tuesday, and Thursday.
              </p>
            </div>

            <!-- Ends -->
            <div class="recurrence-row">
              <label class="recurrence-label">Ends</label>
              <div class="ends-options">
                <label class="radio-option">
                  <input 
                    type="radio" 
                    value="never" 
                    v-model="recurrenceData.endType"
                    class="radio-input"
                  />
                  <span>Never</span>
                </label>

                <label class="radio-option">
                  <input 
                    type="radio" 
                    value="on" 
                    v-model="recurrenceData.endType"
                    class="radio-input"
                  />
                  <span>On</span>
                  <input 
                    v-model="recurrenceData.endDate" 
                    type="date" 
                    class="date-input"
                    :disabled="recurrenceData.endType !== 'on'"
                    :min="localFormData.eventDate"
                  />
                </label>

                <label class="radio-option">
                  <input 
                    type="radio" 
                    value="after" 
                    v-model="recurrenceData.endType"
                    class="radio-input"
                  />
                  <span>After</span>
                  <NumberInput 
                    v-model="occurrencesValue"
                    :min="1"
                    :max="365"
                    :disabled="recurrenceData.endType !== 'after'"
                    :small="true"
                  />
                  <span>occurrences</span>
                </label>
              </div>
            </div>

            <!-- Recurrence Summary -->
            <div 
              v-if="recurrenceSummary" 
              class="recurrence-summary"
              :class="{ warning: recurrenceSummary.includes('⚠️') }"
            >
              <strong>Summary:</strong> {{ recurrenceSummary }}
            </div>
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
import NumberInput from '@/components/NumberInput.vue';
import type { Event, Room, CamperGroup, Camper, StaffMember, Certification } from '@/types/api';
import { type RecurrenceData, type DayOfWeek, formatRecurrenceRule, validateRecurrenceRule } from '@/utils/recurrence';

interface EventFormData {
  title: string;
  eventDate: string;
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
    SelectionList,
    NumberInput
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
      ] as AutocompleteOption[],
      recurrenceData: {
        enabled: false,
        frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
        interval: 1,
        daysOfWeek: [] as DayOfWeek[],
        endType: 'never' as 'never' | 'on' | 'after',
        endDate: '',
        occurrences: 10
      } as RecurrenceData,
      daysOfWeek: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
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
      if (!this.localFormData.startTime || !this.localFormData.eventDate) return null;
      const [hours, minutes] = this.localFormData.startTime.split(':').map(Number);
      const date = new Date(this.localFormData.eventDate);
      date.setHours(hours, minutes, 0, 0);
      return date;
    },
    eventEndDateTime(): Date | null {
      if (!this.localFormData.endTime || !this.localFormData.eventDate) return null;
      const [hours, minutes] = this.localFormData.endTime.split(':').map(Number);
      const date = new Date(this.localFormData.eventDate);
      date.setHours(hours, minutes, 0, 0);
      return date;
    },
    recurrenceSummary(): string | null {
      if (!this.recurrenceData.enabled) return null;
      
      const validation = validateRecurrenceRule(this.recurrenceData);
      if (!validation.valid) {
        return `⚠️ ${validation.error}`;
      }
      
      return formatRecurrenceRule(this.recurrenceData);
    },
    occurrencesValue: {
      get(): number {
        return this.recurrenceData.occurrences || 10;
      },
      set(value: number) {
        this.recurrenceData.occurrences = value;
      }
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
    },
    'recurrenceData.frequency': {
      handler(newFrequency, oldFrequency) {
        // Auto-select the event's day when switching to weekly mode
        if (newFrequency === 'weekly' && oldFrequency !== 'weekly') {
          if (!this.recurrenceData.daysOfWeek || this.recurrenceData.daysOfWeek.length === 0) {
            // Get the day of week from the event date
            const eventDate = new Date(this.localFormData.eventDate);
            const dayOfWeek = eventDate.getDay() as DayOfWeek;
            this.recurrenceData.daysOfWeek = [dayOfWeek];
          }
        }
      }
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
    toggleDay(day: number) {
      if (!this.recurrenceData.daysOfWeek) {
        this.recurrenceData.daysOfWeek = [];
      }
      const index = this.recurrenceData.daysOfWeek.indexOf(day as DayOfWeek);
      if (index > -1) {
        this.recurrenceData.daysOfWeek.splice(index, 1);
      } else {
        this.recurrenceData.daysOfWeek.push(day as DayOfWeek);
        this.recurrenceData.daysOfWeek.sort((a, b) => a - b);
      }
    },
    handleSave() {
      // Convert certification IDs to names before saving
      this.localFormData.requiredCertifications = this.getCertificationNamesFromIds(this.selectedCertificationIds);
      
      // Validate recurrence if enabled
      if (this.recurrenceData.enabled) {
        const validation = validateRecurrenceRule(this.recurrenceData);
        if (!validation.valid) {
          alert(validation.error);
          return;
        }
      }
      
      this.$emit('save', { 
        formData: this.localFormData, 
        recurrence: this.recurrenceData.enabled ? this.recurrenceData : null 
      });
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

/* Recurrence Styles */
.recurrence-section {
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem;
  background: var(--background);
}


.recurrence-header .checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
}

.recurrence-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1rem;
  background: var(--surface);
  border-radius: var(--radius);
}

.recurrence-row {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recurrence-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.recurrence-inputs {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.frequency-select {
  height: 42px;
  padding: 0 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: white;
  font-size: 0.95rem;
  cursor: pointer;
  min-width: 100px;
}

.days-selector {
  display: flex;
  gap: 0.5rem;
}

.day-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: white;
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.day-button:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.day-button.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.ends-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: white;
  cursor: pointer;
  transition: all 0.15s ease;
}

.radio-option:hover {
  background: var(--background);
}

.radio-input {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.date-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 0.9rem;
  background: white;
}

.date-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--background);
}

.recurrence-summary {
  padding: 0.75rem;
  background: var(--primary-light);
  border-left: 3px solid var(--primary-color);
  border-radius: var(--radius);
  font-size: 0.9rem;
  color: var(--text-primary);
}

.recurrence-summary strong {
  font-weight: 600;
  color: var(--primary-color);
}

.recurrence-summary.warning {
  background: #fffbeb;
  border-left: 3px solid #f59e0b;
  font-weight: 400;
}

.recurrence-summary.warning strong {
  color: #d97706;
  font-weight: 500;
}

.recurrence-help-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

@media (max-width: 768px) {
  .days-selector {
    justify-content: space-between;
  }
  
  .day-button {
    width: 36px;
    height: 36px;
    font-size: 0.85rem;
  }
  
  .recurrence-help-text {
    font-size: 0.8rem;
  }
}
</style>

