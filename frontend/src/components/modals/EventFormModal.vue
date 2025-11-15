<template>
  <BaseModal
    :title="isEditing ? 'Edit Event' : 'Create New Event'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <!-- Activity Template Selector (only show when creating new event) -->
        <div v-if="!isEditing" class="form-group">
          <label class="form-label flex items-center q-gutter-x-sm">
            <span>Create from Activity Template</span>
            <InfoTooltip
              tooltip-text="Event details will be filled from the selected activity template. You can
            still modify them."
            />
          </label>
          <Autocomplete
            v-model="selectedActivityId"
            :options="activityOptions"
            @update:modelValue="applyActivityTemplate"
          />
          <div
            v-if="selectedActivityId"
            class="text-xs text-secondary mt-1"
          ></div>
        </div>

        <div class="form-group">
          <label class="form-label">Title</label>
          <BaseInput
            v-model="formData.meta.name"
            placeholder="Enter event title"
            :rules="[(val: string) => !!val || 'Enter event title']"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Event Date</label>
          <BaseInput
            v-model="eventDate"
            type="date"
            :rules="[(val: string) => !!val || 'Enter event date']"
          />
        </div>

        <!-- Unified Event Time Section (for new events) -->
        <div v-if="!isEditing" class="form-group">
          <label class="form-label">Event Time</label>
          <div class="time-settings-container">
            <q-option-group
              inline
              v-model="timeSelectionMode"
              :options="[
                { label: 'Specific Time', value: 'specific' },
                { label: 'Time Block', value: 'timeblock' }
              ]"
              color="primary"
              class="time-mode-selector"
              :disable="selectedActivityHasTimeBlock || selectedActivityHasFixedTime || selectedActivityHasDuration"
            >
              <q-tooltip v-if="selectedActivityHasTimeBlock">
                Time mode is set by the activity template (uses time block)
              </q-tooltip>
              <q-tooltip v-else-if="selectedActivityHasFixedTime">
                Time mode is set by the activity template (fixed time)
              </q-tooltip>
              <q-tooltip v-else-if="selectedActivityHasDuration">
                Time mode is set by the activity template (duration-based)
              </q-tooltip>
            </q-option-group>

            <!-- Specific Time Inputs -->
            <div v-if="timeSelectionMode === 'specific'" class="time-input-section">
              <label class="time-input-label">Set Time</label>
              <div class="grid grid-cols-2">
                <div>
                  <label class="form-sublabel">Start Time</label>
                  <q-input
                    :model-value="startTime"
                    @update:model-value="handleStartTimeChange"
                    outlined
                    dense
                    type="time"
                    placeholder="HH:MM"
                    :rules="[(val: string) => !!val || 'Enter start time']"
                    :disable="selectedActivityHasFixedTime"
                  >
                    <q-tooltip v-if="selectedActivityHasFixedTime">
                      Start time is fixed by the activity template
                    </q-tooltip>
                  </q-input>
                </div>
                <div>
                  <label class="form-sublabel">End Time</label>
                  <q-input
                    v-model="endTime"
                    outlined
                    dense
                    type="time"
                    placeholder="HH:MM"
                    :rules="[
                      (val: string) => !!val || 'Enter end time',
                      endTimeBeforeStartTime,
                    ]"
                    :disable="selectedActivityHasFixedTime || selectedActivityHasDuration"
                  >
                    <q-tooltip v-if="selectedActivityHasFixedTime">
                      End time is fixed by the activity template
                    </q-tooltip>
                    <q-tooltip v-else-if="selectedActivityHasDuration">
                      End time is calculated based on the activity's {{ selectedActivityDuration }} minute duration
                    </q-tooltip>
                  </q-input>
                  <div v-if="selectedActivityHasDuration" class="duration-hint">
                    ({{ selectedActivityDuration }} min duration)
                  </div>
                </div>
              </div>
            </div>

            <!-- Time Block Selector -->
            <div v-if="timeSelectionMode === 'timeblock'" class="time-input-section">
              <label class="time-input-label">Select Time Block</label>
              <p class="form-help-text">
                Choose a time block. Time will be fixed once event is created.
              </p>
              <div class="autocomplete-wrapper">
                <Autocomplete
                  v-model="selectedTimeBlockId"
                  :options="filteredTimeBlocks"
                  @update:modelValue="applyTimeBlock"
                  :disable="selectedActivityHasTimeBlock"
                />
                <q-tooltip v-if="selectedActivityHasTimeBlock">
                  Time block is set by the activity template
                </q-tooltip>
              </div>
              <div v-if="selectedTimeBlockId && selectedTimeBlock" class="time-block-preview">
                <div class="time-preview-item">
                  <strong>Time:</strong> {{ selectedTimeBlock.spec.startTime }} - {{ selectedTimeBlock.spec.endTime }}
                </div>
                <div v-if="selectedTimeBlock.spec.daysOfWeek && selectedTimeBlock.spec.daysOfWeek.length > 0" class="time-preview-item">
                  <strong>Days:</strong> {{ formatDaysOfWeek(selectedTimeBlock.spec.daysOfWeek) }}
                </div>
                <div v-else class="time-preview-item">
                  <strong>Days:</strong> All days
                </div>
              </div>
            </div>

            <!-- Recurrence Section -->
            <div class="recurrence-section-container">
              <div class="recurrence-header">
                <q-checkbox
                  v-model="recurrenceData.enabled"
                  label="Repeat Event"
                  color="primary"
                />
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
                    <select
                      v-model="recurrenceData.frequency"
                      class="frequency-select"
                    >
                      <option value="daily">
                        {{ recurrenceData.interval === 1 ? "day" : "days" }}
                      </option>
                      <option value="weekly">
                        {{ recurrenceData.interval === 1 ? "week" : "weeks" }}
                      </option>
                      <option value="monthly">
                        {{ recurrenceData.interval === 1 ? "month" : "months" }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Repeat On (for weekly) -->
                <div
                  v-if="recurrenceData.frequency === 'weekly'"
                  class="recurrence-row"
                >
                  <label class="recurrence-label">Repeat on</label>
                  <div class="days-selector">
                    <button
                      v-for="(day, index) in daysOfWeek"
                      :key="index"
                      type="button"
                      class="day-button"
                      :class="{
                        active:
                          recurrenceData.daysOfWeek &&
                          recurrenceData.daysOfWeek.includes(index as any),
                      }"
                      @click="toggleDay(index)"
                    >
                      {{ day }}
                      <q-tooltip>{{ getDayFullName(index) }}</q-tooltip>
                    </button>
                  </div>
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
                        :min="defaultEventDate.toISOString()"
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
          </div>
        </div>

        <!-- Time Inputs for editing events -->
        <div v-else class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Start Time</label>
            <BaseInput
              :model-value="startTime"
              @update:model-value="handleStartTimeChange"
              type="time"
              :rules="[(val: string) => !!val || 'Enter start time']"
            />
          </div>

          <div class="form-group">
            <label class="form-label"> End Time </label>
            <BaseInput
              v-model="endTime"
              type="time"
              :rules="[
                (val: string) => !!val || 'Enter end time',
                endTimeBeforeStartTime,
              ]"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Location</label>
          <Autocomplete
            v-model="formData.spec.locationId"
            :options="locationOptions"
            :required="true"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Capacity</label>
          <BaseInput
            v-model="capacityModel"
            type="number"
            placeholder="Enter capacity"
            :min="0"
            :rules="[isValidCapacity]"
          />
        </div>

        <!-- Staff Position Assignments -->
        <div
          v-if="
            formData.spec.requiredStaff &&
            formData.spec.requiredStaff.length > 0
          "
          class="form-group"
        >
          <label class="form-label">Staff Position Assignments</label>
          <p class="form-help-text">
            Assign staff members to the required positions for this event
          </p>

          <div class="staff-positions-list">
            <div
              v-for="(position, index) in formData.spec.requiredStaff"
              :key="index"
              class="staff-position-assignment"
            >
              <div class="position-header">
                <div class="position-info">
                  <span class="position-name">{{ position.positionName }}</span>
                  <span
                    v-if="position.requiredCertificationId"
                    class="position-cert-badge"
                  >
                    {{ getCertificationName(position.requiredCertificationId) }}
                    required
                  </span>
                </div>
              </div>

              <Autocomplete
                label="Staff Member"
                v-model="position.assignedStaffId"
                :options="getStaffOptionsForPosition(position)"
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Assign Groups</label>
          <div class="help-text">
            Select camper groups and family groups to assign to this event.
            Staff will be automatically included from family groups.
          </div>
          <SelectionList
            v-model="groupIds"
            :options="groupOptions"
            multiple
            label="Select Groups"
          />
        </div>

        <!-- Exclude Individual Campers -->
        <div
          v-if="formData.spec.groupIds && formData.spec.groupIds.length > 0"
          class="form-group"
        >
          <label class="form-label"
            >Exclude Individual Campers (Optional)</label
          >
          <div class="help-text">
            Exclude specific campers from the assigned groups.
          </div>
          <SelectionList
            v-model="excludeCamperIds"
            :options="campersInAssignedGroupsOptions"
            multiple
            label="Select Campers to Exclude"
          />
        </div>

        <!-- Exclude Individual Staff -->
        <div
          v-if="formData.spec.groupIds && formData.spec.groupIds.length > 0"
          class="form-group"
        >
          <label class="form-label">Exclude Individual Staff (Optional)</label>
          <div class="help-text">
            Exclude specific staff members from the assigned groups.
          </div>
          <SelectionList
            v-model="excludeStaffIds"
            :options="staffInAssignedGroupsOptions"
            multiple
            label="Select Staff to Exclude"
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
          :label="isEditing ? 'Save Changes' : 'Create Event'"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import {
  useEventsStore,
  useCampersStore,
  useStaffMembersStore,
  useGroupsStore,
  useLocationsStore,
  useProgramsStore,
  useActivitiesStore,
  useColorsStore,
  useCertificationsStore,
  useSessionsStore,
  useTimeBlocksStore,
} from "@/stores";
import { conflictDetector } from "@/services/conflicts";
import { useToast } from "@/composables/useToast";
import BaseModal from "@/components/BaseModal.vue";
import Autocomplete, {
  type AutocompleteOption,
} from "@/components/Autocomplete.vue";
import NumberInput from "@/components/NumberInput.vue";
import type {
  Location,
  Camper,
  StaffMember,
  Group,
  EventCreationRequest,
  TimeBlock,
} from "@/generated/api";
import {
  type RecurrenceData,
  type DayOfWeek,
  formatRecurrenceRule,
  validateRecurrenceRule,
  generateRecurrenceDates,
} from "@/utils/recurrence";
import type { QForm } from "quasar";
import { compareAsc } from "date-fns";
import InfoTooltip from "../InfoTooltip.vue";
import type { ISelectOption } from "@/components/SelectionList.vue";
import SelectionList from "@/components/SelectionList.vue";

export default defineComponent({
  name: "EventFormModal",
  components: {
    BaseModal,
    Autocomplete,
    NumberInput,
    InfoTooltip,
    SelectionList,
  },
  props: {
    defaultEventDate: {
      type: Date as PropType<Date>,
      required: true,
    },
    eventId: {
      type: String as PropType<string>,
      required: false,
    },
  },
  emits: ["close"],
  setup() {
    const eventsStore = useEventsStore();
    const campersStore = useCampersStore();
    const staffMembersStore = useStaffMembersStore();
    const groupsStore = useGroupsStore();
    const locationsStore = useLocationsStore();
    const programsStore = useProgramsStore();
    const activitiesStore = useActivitiesStore();
    const colorsStore = useColorsStore();
    const certificationsStore = useCertificationsStore();
    const toast = useToast();
    const sessionsStore = useSessionsStore();
    const timeBlocksStore = useTimeBlocksStore();
    return {
      eventsStore,
      campersStore,
      staffMembersStore,
      groupsStore,
      locationsStore,
      programsStore,
      activitiesStore,
      colorsStore,
      certificationsStore,
      toast,
      sessionsStore,
      timeBlocksStore,
    };
  },
  data() {
    // Set default start time to 9:00 AM
    const defaultDate = new Date(this.defaultEventDate);
    defaultDate.setHours(9, 0, 0, 0);
    const startHours = "09";
    const startMinutes = "00";

    return {
      formData: {
        meta: {
          name: "",
          description: "",
        },
        spec: {
          startDate: defaultDate.toISOString(),
          endDate: "",
          locationId: "",
          capacity: null as number | null,
          colorId: "",
          groupIds: [],
          excludeCamperIds: [],
          excludeStaffIds: [],
          programId: "",
          activityId: "",
          requiredStaff: [] as Array<{
            positionName: string;
            requiredCertificationId?: string;
            assignedStaffId?: string;
          }>,
        },
      } as EventCreationRequest,
      internalEventDate: defaultDate.toISOString().split("T")[0],
      internalStartTime: `${startHours}:${startMinutes}`,
      internalEndTime: "",
      selectedActivityId: "",
      selectedTimeBlockId: "",
      timeSelectionMode: "specific" as "specific" | "timeblock",
      formRef: null as any,
      selectedActivityHasFixedTime: false,
      selectedActivityHasDuration: false,
      selectedActivityHasTimeBlock: false,
      selectedActivityDuration: 0,
      recurrenceData: {
        enabled: false,
        frequency: "weekly" as "daily" | "weekly" | "monthly",
        interval: 1,
        daysOfWeek: [] as DayOfWeek[],
        endType: "never" as "never" | "on" | "after",
        endDate: "",
        occurrences: 10,
      } as RecurrenceData,
      daysOfWeek: ["S", "M", "T", "W", "T", "F", "S"],
    };
  },
  async created() {
    // Load time blocks
    await this.timeBlocksStore.loadTimeBlocks();
    if (this.eventId) {
      const event = this.eventsStore.getEventById(this.eventId);
      if (!event) return;

      // Parse the start and end dates
      const startDate = new Date(event.spec.startDate);
      const endDate = new Date(event.spec.endDate);

      // Extract date part (YYYY-MM-DD)
      this.internalEventDate = startDate.toISOString().split("T")[0];

      // Extract time parts (HH:MM)
      this.internalStartTime = `${startDate.getHours().toString().padStart(2, "0")}:${startDate.getMinutes().toString().padStart(2, "0")}`;
      this.internalEndTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;

      this.formData = {
        meta: {
          name: event.meta.name,
          description: event.meta.description,
        },
        spec: {
          startDate: event.spec.startDate,
          endDate: event.spec.endDate,
          locationId: event.spec.locationId,
          capacity: event.spec.capacity,
          colorId: event.spec.colorId,
          groupIds: event.spec.groupIds,
          excludeCamperIds: event.spec.excludeCamperIds,
          excludeStaffIds: event.spec.excludeStaffIds,
          programId: event.spec.programId,
          activityId: event.spec.activityId,
          requiredStaff: event.spec.requiredStaff || [],
        },
      } as EventCreationRequest;
    } else {
      // For new events (not created from activity template), set default color
      if (!this.formData.spec.colorId) {
        const defaultColor = this.colorsStore.getDefaultColor;
        if (defaultColor) {
          this.formData.spec.colorId = defaultColor.meta.id;
        }
      }
    }
  },
  computed: {
    groupOptions(): ISelectOption[] {
      return this.groups.map((group: Group) => ({
        label: group.meta.name,
        value: group.meta.id,
      }));
    },
    isEditing(): boolean {
      return !!this.eventId;
    },
    eventDate: {
      get(): string {
        return this.internalEventDate;
      },
      set(value: string) {
        this.internalEventDate = value;
        this.updateFormDataDates();
      },
    },
    startTime: {
      get(): string {
        return this.internalStartTime;
      },
      set(value: string) {
        this.internalStartTime = value;
        this.updateFormDataDates();
      },
    },
    endTime: {
      get(): string {
        return this.internalEndTime;
      },
      set(value: string) {
        this.internalEndTime = value;
        this.updateFormDataDates();
      },
    },
    eventStartDateTime(): Date | null {
      if (!this.internalEventDate || !this.internalStartTime) {
        return null;
      }
      return new Date(`${this.internalEventDate}T${this.internalStartTime}:00`);
    },
    eventEndDateTime(): Date | null {
      if (!this.internalEventDate || !this.internalEndTime) {
        return null;
      }
      return new Date(`${this.internalEventDate}T${this.internalEndTime}:00`);
    },
    locations(): Location[] {
      return this.locationsStore.locations;
    },
    staffMembers(): StaffMember[] {
      return this.staffMembersStore.staffMembers;
    },
    groups(): Group[] {
      return this.groupsStore.groups;
    },
    groupIds: {
      get(): string[] {
        return this.formData.spec.groupIds || [];
      },
      set(value: string[]) {
        this.formData.spec.groupIds = value;
      },
    },
    excludeCamperIds: {
      get(): string[] {
        return this.formData.spec.excludeCamperIds || [];
      },
      set(value: string[]) {
        this.formData.spec.excludeCamperIds = value;
      },
    },
    excludeStaffIds: {
      get(): string[] {
        return this.formData.spec.excludeStaffIds || [];
      },
      set(value: string[]) {
        this.formData.spec.excludeStaffIds = value;
      },
    },
    capacityModel: {
      get(): string {
        return this.formData.spec.capacity?.toString() || "";
      },
      set(value: string) {
        if (!value) {
          this.formData.spec.capacity = undefined;
          return;
        }
        const num = parseInt(value);
        this.formData.spec.capacity = isNaN(num) ? 0 : num;
      },
    },
    programOptions(): AutocompleteOption[] {
      return [
        { label: "None", value: "" },
        ...this.programsStore.programs.map((program) => ({
          label: program.meta.name,
          value: program.meta.id,
        })),
      ];
    },
    locationOptions(): AutocompleteOption[] {
      return this.locations.map((location) => ({
        label: `${location.meta.name} (Capacity: ${location.spec.capacity})`,
        value: location.meta.id,
      }));
    },
    activityOptions(): AutocompleteOption[] {
      // Group activities by program
      const optionsWithGroups: AutocompleteOption[] = [];

      this.programsStore.programs.forEach((program) => {
        const programActivities = this.activitiesStore.getActivitiesInProgram(
          program.meta.id,
        );
        if (programActivities.length > 0) {
          programActivities.forEach((activity) => {
            optionsWithGroups.push({
              label: `(${program.meta.name}) ${activity.meta.name}`,
              value: activity.meta.id,
            });
          });
        }
      });

      return optionsWithGroups;
    },
    filteredTimeBlocks(): AutocompleteOption[] {
      // Filter time blocks based on event date's day of week
      const eventDayOfWeek = this.getDayOfWeekFromDate(this.internalEventDate);
      
      return this.timeBlocksStore.timeBlocks
        .filter((timeBlock) => {
          // If no days are specified, time block applies to all days
          if (!timeBlock.spec.daysOfWeek || timeBlock.spec.daysOfWeek.length === 0) {
            return true;
          }
          // Check if event's day is in the time block's days
          return timeBlock.spec.daysOfWeek.some(
            (day) => day.toLowerCase() === eventDayOfWeek.toLowerCase()
          );
        })
        .map((timeBlock) => ({
          label: `${timeBlock.meta.name} (${timeBlock.spec.startTime} - ${timeBlock.spec.endTime})`,
          value: timeBlock.meta.id,
        }));
    },
    selectedTimeBlock(): TimeBlock | undefined {
      if (!this.selectedTimeBlockId) return undefined;
      return this.timeBlocksStore.getTimeBlockById(this.selectedTimeBlockId);
    },
    allGroups(): Array<Group> {
      // Filter groups by session dates
      const eventDate = this.eventDate;
      if (!eventDate) {
        return this.groups;
      }

      // Parse event date as YYYY-MM-DD
      const eventDateObj = new Date(eventDate);
      eventDateObj.setHours(0, 0, 0, 0);

      return this.groups.filter((group) => {
        // Groups without session assignment are assignable to all events
        if (!group.spec.sessionId) {
          return true;
        }

        // Find the session for this group
        const session = this.sessionsStore.getSessionById(group.spec.sessionId);
        if (!session || !session.spec.startDate || !session.spec.endDate) {
          // If the session or its dates are missing, exclude the group
          return false;
        }

        // Parse session start/end dates as YYYY-MM-DD
        const start = new Date(session.spec.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(session.spec.endDate);
        end.setHours(0, 0, 0, 0);

        // Check if event date is within the session's date range (inclusive)
        return eventDateObj >= start && eventDateObj <= end;
      });
      return this.groups;
    },
    campersInAssignedGroupsOptions(): ISelectOption[] {
      if (
        !this.formData.spec.groupIds ||
        this.formData.spec.groupIds.length === 0
      ) {
        return [] as ISelectOption[];
      }

      const camperIds = new Set<string>();

      // Get campers from all assigned groups
      this.formData.spec.groupIds.forEach((groupId: string) => {
        // Check if it's a camper group
        const group = this.groupsStore.getGroupById(groupId);
        if (group) {
          const campers = this.groupsStore.getCampersInGroup(groupId);
          campers.forEach((camper) => camperIds.add(camper.meta.id));
        }
      });

      // Return full camper objects
      return this.campersStore.campers
        .filter((c) => camperIds.has(c.meta.id))
        .map((c: Camper) => ({
          label: c.meta.name,
          value: c.meta.id,
        }));
    },
    staffInAssignedGroupsOptions(): ISelectOption[] {
      if (
        !this.formData.spec.groupIds ||
        this.formData.spec.groupIds.length === 0
      ) {
        return [] as ISelectOption[];
      }

      const staffIds = new Set<string>();

      // Get staff from all assigned family groups
      this.formData.spec.groupIds.forEach((groupId: string) => {
        const group = this.groupsStore.getGroupById(groupId);
        if (group && group.spec.staffIds) {
          group.spec.staffIds.forEach((staffId: string) =>
            staffIds.add(staffId),
          );
        }
      });

      // Return full staff member objects
      return this.staffMembersStore.staffMembers
        .filter((s) => staffIds.has(s.meta.id))
        .map((s: StaffMember) => ({
          label: s.meta.name,
          value: s.meta.id,
        }));
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
      },
    },
  },
  watch: {
    timeSelectionMode(newMode) {
      // Clear time block selection when switching to specific time
      if (newMode === "specific") {
        this.selectedTimeBlockId = "";
      }
    },
    "recurrenceData.frequency": {
      handler(newFrequency, oldFrequency) {
        // Auto-select the event's day when switching to weekly mode
        if (newFrequency === "weekly" && oldFrequency !== "weekly") {
          if (
            !this.recurrenceData.daysOfWeek ||
            this.recurrenceData.daysOfWeek.length === 0
          ) {
            // Get the day of week from the event date
            const eventDate = new Date(this.defaultEventDate);
            const dayOfWeek = eventDate.getDay() as DayOfWeek;
            this.recurrenceData.daysOfWeek = [dayOfWeek];
          }
        }
      },
    },
  },
  methods: {
    isValidCapacity(value: string): boolean | string {
      if (!value) return true;
      return parseInt(value) > 0 || "Must be greater than 0";
    },
    endTimeBeforeStartTime(): boolean | string {
      return (
        compareAsc(
          new Date(`${this.internalEventDate}T${this.internalStartTime}:00`),
          new Date(`${this.internalEventDate}T${this.internalEndTime}:00`),
        ) === -1 || "End time must be later than start time"
      );
    },
    handleStartTimeChange(value: string | number | null): void {
      if (typeof value !== 'string') return;
      
      this.internalStartTime = value;

      // If activity has a fixed duration, recalculate end time
      if (
        this.selectedActivityHasDuration &&
        this.selectedActivityDuration > 0
      ) {
        const [hours, minutes] = value.split(":").map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);

        const endDate = new Date(
          startDate.getTime() + this.selectedActivityDuration * 60000,
        );
        const endHours = endDate.getHours().toString().padStart(2, "0");
        const endMinutes = endDate.getMinutes().toString().padStart(2, "0");
        this.internalEndTime = `${endHours}:${endMinutes}`;
        this.updateFormDataDates();
        return;
      }

      // If endTime is set, keep the interval between startTime and endTime when startTime is changed
      if (this.internalEndTime) {
        const [oldStartHour, oldStartMinute] = this.internalStartTime
          .split(":")
          .map(Number);
        const [endHour, endMinute] = this.internalEndTime
          .split(":")
          .map(Number);
        // Calculate old duration in minutes
        const oldStart = new Date(0, 0, 0, oldStartHour, oldStartMinute);
        const oldEnd = new Date(0, 0, 0, endHour, endMinute);
        let duration = (oldEnd.getTime() - oldStart.getTime()) / 60000;
        // If duration is negative or 0, treat as 0
        if (duration <= 0) {
          duration = 0;
        }

        // Use the NEW start time ("startTime") and shift endTime by this interval
        if (this.startTime) {
          const [newStartHour, newStartMinute] = this.startTime
            .split(":")
            .map(Number);
          const newStart = new Date(0, 0, 0, newStartHour, newStartMinute);
          const newEnd = new Date(newStart.getTime() + duration * 60000);
          const newEndHour = newEnd.getHours().toString().padStart(2, "0");
          const newEndMinute = newEnd.getMinutes().toString().padStart(2, "0");
          this.endTime = `${newEndHour}:${newEndMinute}`;
        }
      } else {
        const result = compareAsc(
          new Date(`${this.internalEventDate}T${this.internalStartTime}:00`),
          new Date(`${this.internalEventDate}T${this.internalEndTime}:00`),
        );
        if (result === 1) {
          this.endTime = this.startTime;
        }
      }
    },
    updateFormDataDates() {
      // Combine date and time into ISO datetime strings
      if (this.internalEventDate && this.internalStartTime) {
        const startDateTime = new Date(
          `${this.internalEventDate}T${this.internalStartTime}:00`,
        );
        this.formData.spec.startDate = startDateTime.toISOString();
      }

      if (this.internalEventDate && this.internalEndTime) {
        const endDateTime = new Date(
          `${this.internalEventDate}T${this.internalEndTime}:00`,
        );
        this.formData.spec.endDate = endDateTime.toISOString();
      }
    },
    applyActivityTemplate(activityId: string) {
      if (!activityId) {
        // Reset activity constraints when no activity is selected
        this.selectedActivityHasFixedTime = false;
        this.selectedActivityHasDuration = false;
        this.selectedActivityHasTimeBlock = false;
        this.selectedActivityDuration = 0;
        this.timeSelectionMode = 'specific';
        this.selectedTimeBlockId = '';
        this.formData.spec.requiredStaff = [];
        this.formData.spec.programId = "";
        this.formData.spec.activityId = "";
        this.formData.spec.locationId = "";
        this.formData.meta.name = "";
        return;
      }

      const activity = this.activitiesStore.getActivityById(activityId);
      if (!activity) return;

      // Auto-populate form fields from activity template
      this.formData.meta.name = activity.meta.name;

      // Handle time setting: either timeBlockId, fixedTime, or duration
      if (activity.spec.timeBlockId) {
        // Use time block from activity - get the actual times from the time block
        const timeBlock = this.timeBlocksStore.getTimeBlockById(
          activity.spec.timeBlockId,
        );
        if (timeBlock) {
          this.selectedActivityHasTimeBlock = true;
          this.selectedActivityHasFixedTime = false;
          this.selectedActivityHasDuration = false;
          this.selectedActivityDuration = 0;
          this.timeSelectionMode = 'timeblock';
          this.selectedTimeBlockId = activity.spec.timeBlockId;
          this.internalStartTime = timeBlock.spec.startTime;
          this.internalEndTime = timeBlock.spec.endTime;
          this.updateFormDataDates();
        }
      } else if (activity.spec.fixedTime) {
        // Use fixed time from activity - this is locked and cannot be changed
        this.selectedActivityHasFixedTime = true;
        this.selectedActivityHasDuration = false;
        this.selectedActivityHasTimeBlock = false;
        this.selectedActivityDuration = 0;
        this.timeSelectionMode = 'specific';
        this.internalStartTime = activity.spec.fixedTime.startTime;
        this.internalEndTime = activity.spec.fixedTime.endTime;
        this.updateFormDataDates();
      } else if (activity.spec.duration) {
        // Use duration from activity - start time is editable, end time is calculated
        this.selectedActivityHasFixedTime = false;
        this.selectedActivityHasDuration = true;
        this.selectedActivityHasTimeBlock = false;
        this.selectedActivityDuration = activity.spec.duration;
        this.timeSelectionMode = 'specific';

        // Calculate end time based on start time and duration
        if (this.internalStartTime) {
          const [hours, minutes] = this.internalStartTime
            .split(":")
            .map(Number);
          const startDate = new Date();
          startDate.setHours(hours, minutes, 0, 0);

          const endDate = new Date(
            startDate.getTime() + (activity.spec.duration || 0) * 60000,
          );
          const endHours = endDate.getHours().toString().padStart(2, "0");
          const endMinutes = endDate.getMinutes().toString().padStart(2, "0");
          this.internalEndTime = `${endHours}:${endMinutes}`;
          this.updateFormDataDates();
        }
      } else {
        // No time constraints from activity
        this.selectedActivityHasFixedTime = false;
        this.selectedActivityHasDuration = false;
        this.selectedActivityHasTimeBlock = false;
        this.selectedActivityDuration = 0;
      }

      // Set default location if specified
      if (activity.spec.defaultLocationId) {
        this.formData.spec.locationId = activity.spec.defaultLocationId;
      }

      // Inherit color from the program
      if (activity.spec.programId) {
        const program = this.programsStore.getProgramById(
          activity.spec.programId,
        );
        if (program && program.spec.colorId) {
          this.formData.spec.colorId = program.spec.colorId;
        }
      }

      // Set required staff positions if specified
      if (
        activity.spec.requiredStaff &&
        activity.spec.requiredStaff.length > 0
      ) {
        this.formData.spec.requiredStaff = activity.spec.requiredStaff.map(
          (position: any) => ({
            positionName: position.positionName,
            requiredCertificationId: position.requiredCertificationId,
            assignedStaffId: undefined, // Start with no staff assigned
          }),
        );
      }

      // Set program and activity IDs for reference
      this.formData.spec.programId = activity.spec.programId;
      this.formData.spec.activityId = activity.meta.id;
    },
    applyTimeBlock(timeBlockId: string) {
      if (!timeBlockId) return;

      const timeBlock = this.timeBlocksStore.getTimeBlockById(timeBlockId);
      if (!timeBlock) return;

      // Set the event times from the time block
      this.internalStartTime = timeBlock.spec.startTime;
      this.internalEndTime = timeBlock.spec.endTime;
      this.updateFormDataDates();
    },
    getDayOfWeekFromDate(dateString: string): string {
      const date = new Date(dateString);
      const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      return days[date.getDay()];
    },
    formatDaysOfWeek(days: string[]): string {
      const dayMap: Record<string, string> = {
        sunday: "Sun",
        monday: "Mon",
        tuesday: "Tue",
        wednesday: "Wed",
        thursday: "Thu",
        friday: "Fri",
        saturday: "Sat",
      };
      return days.map((day) => dayMap[day.toLowerCase()] || day).join(", ");
    },
    getDayFullName(index: number): string {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return days[index] || "";
    },
    getCertificationName(certificationId: string): string {
      const cert =
        this.certificationsStore.getCertificationById(certificationId);
      return cert ? cert.meta.name : "Unknown Certification";
    },
    getStaffOptionsForPosition(position: {
      positionName: string;
      requiredCertificationId?: string;
      assignedStaffId?: string;
    }): AutocompleteOption[] {
      // Get all staff members
      let availableStaff = this.staffMembers;

      // Filter by required certification if specified
      if (position.requiredCertificationId) {
        availableStaff = availableStaff.filter((staff) => {
          return (
            staff.spec.certificationIds &&
            staff.spec.certificationIds.includes(
              position.requiredCertificationId!,
            )
          );
        });
      }

      // Map to autocomplete options with availability indicators
      return [
        { label: "None", value: "" },
        ...availableStaff.map((staff) => {
          const availability = this.isStaffAvailable(staff);
          const baseLabel = `${staff.meta.name}`;

          if (!availability.available) {
            return {
              label: `⚠️ ${baseLabel} (${availability.reason})`,
              value: staff.meta.id,
            };
          }

          return {
            label: baseLabel,
            value: staff.meta.id,
          };
        }),
      ];
    },
    isStaffAvailable(staff: StaffMember): {
      available: boolean;
      reason?: string;
    } {
      if (!this.eventStartDateTime || !this.eventEndDateTime) {
        return { available: true };
      }

      const result = conflictDetector.canAssignStaff(
        this.eventStartDateTime,
        this.eventEndDateTime,
        staff.meta.id,
        this.eventsStore.events,
        this.eventId
          ? new Map<string, string[]>([[this.eventId, []]])
          : undefined,
      );

      return { available: result.canAssign, reason: result.reason };
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
    async handleSave() {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      // Ensure formData dates are up to date
      this.updateFormDataDates();

      // Validate recurrence if enabled
      if (this.recurrenceData.enabled) {
        const validation = validateRecurrenceRule(this.recurrenceData);
        if (!validation.valid) {
          this.toast.error("Invalid recurrence settings", validation.error);
          return;
        }
      }

      if (this.isEditing) {
        return this.updateEvent();
      }
      return this.createEvent();
    },
    async updateEvent(): Promise<void> {
      if (!this.eventId) return;
      try {
        await this.eventsStore.updateEvent(this.eventId, this.formData);
        this.toast.success("Event updated successfully");
      } catch (error: any) {
        this.toast.error("Failed to update event", error.message);
      } finally {
        this.$emit("close");
      }
    },
    async createEvent(): Promise<void> {
      if (this.recurrenceData.enabled) {
        return this.createRecurringEvents(
          this.formData,
          this.recurrenceData,
          new Date(this.formData.spec.startDate),
          new Date(this.formData.spec.endDate),
        );
      } else {
        return this.createSingleEvent();
      }
    },
    async createRecurringEvents(
      formData: EventCreationRequest,
      recurrence: RecurrenceData,
      startDate: Date,
      endDate: Date,
    ): Promise<void> {
      try {
        // Generate all occurrence dates
        const occurrenceDates = generateRecurrenceDates(startDate, recurrence);

        if (occurrenceDates.length === 0) {
          this.toast.error("Failed to generate recurring events");
          return;
        }

        // Show loading toast for large batches
        if (occurrenceDates.length > 10) {
          this.toast.info(
            `Creating ${occurrenceDates.length} recurring events...`,
          );
        }

        // Generate a unique recurrence ID for this series
        const recurrenceId = `recurrence-${Date.now()}`;

        // Calculate the duration in milliseconds
        const duration = endDate.getTime() - startDate.getTime();

        // Create all events in memory first (fast)
        const eventCreationRequestsPromises: Promise<EventCreationRequest>[] =
          [];

        for (let i = 0; i < occurrenceDates.length; i++) {
          const occurrenceStart = occurrenceDates[i];
          const occurrenceEnd = new Date(occurrenceStart.getTime() + duration);

          const event: EventCreationRequest = {
            meta: {
              name: formData.meta.name,
              description: formData.meta.description,
            },
            spec: {
              startDate: occurrenceStart.toISOString(),
              endDate: occurrenceEnd.toISOString(),
              locationId: formData.spec.locationId,
              capacity: formData.spec.capacity,
              colorId: formData.spec.colorId,
              groupIds: formData.spec.groupIds || [],
              excludeCamperIds: formData.spec.excludeCamperIds || [],
              excludeStaffIds: formData.spec.excludeStaffIds || [],
              programId: formData.spec.programId,
              activityId: formData.spec.activityId,
              recurrenceId: recurrenceId,
              isRecurrenceParent: i === 0, // First event is the parent
            },
          };

          eventCreationRequestsPromises.push(
            this.eventsStore.createEvent(event),
          );
        }

        await Promise.all(eventCreationRequestsPromises);
        this.toast.success(
          `Successfully created ${occurrenceDates.length} recurring events`,
        );
      } catch (error: any) {
        this.toast.error("Failed to create recurring events", error.message);
      } finally {
        this.$emit("close");
      }
    },
    async createSingleEvent(): Promise<void> {
      try {
        await this.eventsStore.createEvent(this.formData);
        this.toast.success("Event created successfully");
      } catch (error: any) {
        this.toast.error("Failed to create event", error.message);
      } finally {
        this.$emit("close");
      }
    },
  },
});
</script>

<style scoped>
.form-label-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.form-label-with-action .form-label {
  margin-bottom: 0;
}

.btn-sm {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

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
.recurrence-section-container {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.recurrence-header {
  margin-bottom: 0.5rem;
}

.recurrence-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1rem;
  background: var(--surface);
  border-radius: var(--radius);
  margin-top: 1rem;
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
  gap: 0.75rem;
  flex-wrap: wrap;
}

.day-button {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #e8eaf6;
  color: #5c6bc0;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-button:hover {
  background: #c5cae9;
}

.day-button.active {
  background: #5c6bc0;
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

.help-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.staff-positions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.staff-position-assignment {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--background);
}

.position-header {
  margin-bottom: 0.75rem;
}

.position-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.position-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.position-cert-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: var(--primary-light);
  color: var(--primary-color);
  border-radius: var(--radius);
  display: inline-block;
  width: fit-content;
}

/* Activity Time Constraint Styles */
.fixed-time-display {
  gap: 1rem;
  width: 100%;
}

.time-display-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.time-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.time-value {
  color: var(--text-primary);
}

.duration-badge {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--primary-color);
  margin-left: 0.5rem;
}

.calculated-time-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--surface-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  height: 40px;
}

.calculated-time-display .time-value {
  color: var(--text-primary);
}

.duration-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-style: italic;
}

@media (max-width: 640px) {
  .fixed-time-display {
    flex-direction: column;
    gap: 1rem;
  }
}

.time-settings-container {
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  background: var(--background);
}

.time-mode-selector {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.time-input-section {
  animation: slideDown 0.2s ease-out;
}

.time-input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.form-sublabel {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
}

.time-block-preview {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--background-secondary);
  border-radius: 0.375rem;
  border: 1px solid var(--border-color);
}

.time-preview-item {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.time-preview-item:last-child {
  margin-bottom: 0;
}

.duration-hint {
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-style: italic;
}

.autocomplete-wrapper {
  position: relative;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
