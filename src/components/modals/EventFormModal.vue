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

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Start Time</label>
            <BaseInput
              v-model="startTime"
              @update:model-value="handleStartTimeChange"
              type="time"
              :rules="[(val: string) => !!val || 'Enter start time']"
            />
          </div>

          <div class="form-group">
            <label class="form-label">End Time</label>
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

        <!-- Duration Presets -->
        <div class="form-group">
          <label class="form-label">Quick Duration (Optional)</label>
          <div class="duration-presets">
            <button
              v-for="preset in durationPresetsStore.sortedDurationPresets"
              :key="preset.meta.id"
              type="button"
              class="duration-preset-btn"
              :class="{
                active: selectedDurationPreset === preset.spec.durationMinutes,
              }"
              @click="applyDurationPreset(preset.spec.durationMinutes)"
              :title="preset.meta.description || ''"
            >
              {{ formatDuration(preset.spec.durationMinutes) }}
            </button>
          </div>
          <p class="form-help-text">
            Click a preset to automatically calculate end time based on start
            time
          </p>
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
              <span class="form-label" style="margin: 0">Repeat Event</span>
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
                </button>
              </div>
              <p class="recurrence-help-text">
                Select which days of the week this event should occur. Example:
                Select S, T, Th for every Sunday, Tuesday, and Thursday.
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

        <div class="form-group">
          <label class="form-label">Program (Optional)</label>
          <Autocomplete
            v-model="formData.spec.programId"
            :options="programOptions"
            @update:modelValue="onProgramSelected"
          />
          <p class="form-help-text">
            Selecting a program helps auto-suggest staff members from that
            program
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">Required Certifications (Optional)</label>
          <SelectionList
            v-model="selectedCertificationIds"
            :options="certificationOptions"
            multiple
            label="Select Certifications"
          />
          <p class="form-help-text">
            Staff assigned to this event should have these certifications
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">Assign Groups (Optional)</label>
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
  useDurationPresetsStore,
  useSessionsStore,
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
} from "@/generated/api";
import type { Certification } from "@/generated/api";
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
    const durationPresetsStore = useDurationPresetsStore();
    const toast = useToast();
    const sessionsStore = useSessionsStore();
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
      durationPresetsStore,
      toast,
      sessionsStore,
    };
  },
  data() {
    // Round defaultEventDate to the next round hour
    const roundedDefaultEventDate = new Date(this.defaultEventDate);
    if (
      roundedDefaultEventDate.getMinutes() > 0 ||
      roundedDefaultEventDate.getSeconds() > 0 ||
      roundedDefaultEventDate.getMilliseconds() > 0
    ) {
      roundedDefaultEventDate.setHours(roundedDefaultEventDate.getHours() + 1);
      roundedDefaultEventDate.setMinutes(0, 0, 0);
    }
    const defaultDate = roundedDefaultEventDate;
    const startHours = defaultDate.getHours().toString().padStart(2, "0");
    const startMinutes = defaultDate.getMinutes().toString().padStart(2, "0");

    return {
      formData: {
        meta: {
          name: "",
          description: "",
        },
        spec: {
          title: "",
          startDate: defaultDate.toISOString(),
          endDate: "",
          locationId: "",
          capacity: null as number | null,
          colorId: "",
          requiredCertificationIds: [],
          groupIds: [],
          excludeCamperIds: [],
          excludeStaffIds: [],
          programId: "",
          activityId: "",
        },
      } as EventCreationRequest,
      internalEventDate: defaultDate.toISOString().split("T")[0],
      internalStartTime: `${startHours}:${startMinutes}`,
      internalEndTime: "",
      selectedActivityId: "",
      selectedDurationPreset: null as number | null,
      formRef: null as any,
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
  created() {
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
          requiredCertificationIds: event.spec.requiredCertificationIds,
          groupIds: event.spec.groupIds,
          excludeCamperIds: event.spec.excludeCamperIds,
          excludeStaffIds: event.spec.excludeStaffIds,
          programId: event.spec.programId,
          activityId: event.spec.activityId,
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
    certificationOptions(): ISelectOption[] {
      return this.certificationsStore.certifications.map(
        (certification: Certification) => ({
          label: certification.meta.name,
          value: certification.meta.id,
        }),
      );
    },
    selectedCertificationIds: {
      get(): string[] {
        return this.formData.spec.requiredCertificationIds || [];
      },
      set(value: string[]) {
        this.formData.spec.requiredCertificationIds = value;
      },
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
        } else if (group && group.spec.staffFilters) {
          const staff = this.staffMembersStore.getStaffMembersByFilters(
            group.spec.staffFilters,
          );
          staff.forEach((s: StaffMember) => staffIds.add(s.meta.id));
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
    handleStartTimeChange(): void {
      const result = compareAsc(
        new Date(`${this.internalEventDate}T${this.internalStartTime}:00`),
        new Date(`${this.internalEventDate}T${this.internalEndTime}:00`),
      );
      if (result === 1) {
        this.endTime = this.startTime;
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
      if (!activityId) return;

      const activity = this.activitiesStore.getActivityById(activityId);
      if (!activity) return;

      // Auto-populate form fields from activity template
      this.formData.meta.name = activity.meta.name;

      // Calculate end time based on start time and duration
      if (this.internalStartTime) {
        const [hours, minutes] = this.internalStartTime.split(":").map(Number);
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

      // Set default location if specified
      if (activity.spec.defaultLocationId) {
        this.formData.spec.locationId = activity.spec.defaultLocationId;
      }

      // Set default capacity if specified
      if (activity.spec.defaultCapacity) {
        this.formData.spec.capacity = activity.spec.defaultCapacity;
      }

      // Inherit color from the program (use first program)
      if (activity.spec.programIds && activity.spec.programIds.length > 0) {
        const program = this.programsStore.getProgramById(
          activity.spec.programIds[0],
        );
        if (program && program.spec.colorId) {
          this.formData.spec.colorId = program.spec.colorId;
        }
      }

      // Set required certifications if specified
      if (
        activity.spec.requiredCertificationIds &&
        activity.spec.requiredCertificationIds.length > 0
      ) {
        this.formData.spec.requiredCertificationIds = [
          ...activity.spec.requiredCertificationIds,
        ];
      }

      // Set program and activity IDs for reference
      // Use the first program if activity belongs to multiple programs
      this.formData.spec.programId = activity.spec.programIds[0];
      this.formData.spec.activityId = activity.meta.id;
    },
    getCamperLabel(camper: Camper): string {
      return `${camper.meta.name} (Age: ${camper.spec.age})`;
    },
    getCamperInitials(camper: Camper): string {
      const parts = camper.meta.name.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return camper.meta.name.charAt(0).toUpperCase();
    },
    getCamperOption(camper: Camper): AutocompleteOption {
      return {
        label: `${camper.meta.name} (Age: ${camper.spec.age})`,
        value: camper.meta.id,
      };
    },
    getCertificationIdsFromNames(names: string[]): string[] {
      return names
        .map((name) => {
          const cert = this.certificationsStore.certifications.find(
            (c) => c.meta.name === name,
          );
          return cert ? cert.meta.id : "";
        })
        .filter((id) => id !== "");
    },
    getCertificationNamesFromIds(ids: string[]): string[] {
      return ids
        .map((id) => {
          const cert = this.certificationsStore.getCertificationById(id);
          return cert ? cert.meta.name : "";
        })
        .filter((name) => name !== "");
    },
    getCertificationLabel(cert: Certification): string {
      return cert.meta.name;
    },
    getCertificationInitials(cert: Certification): string {
      return cert.meta.name.substring(0, 2).toUpperCase();
    },
    getCertificationOption(cert: Certification): AutocompleteOption {
      return {
        label: cert.meta.name,
        value: cert.meta.id,
      };
    },
    getGroupLabel(group: Group): string {
      // Check if it's a camper group or family group
      const camperCount = this.groupsStore.getCampersInGroup(
        group.meta.id,
      ).length;
      return `${group.meta.name} (${camperCount} campers)`;
    },
    getGroupInitials(group: Group): string {
      // Use first two letters of the group name
      return group.meta.name.substring(0, 2).toUpperCase();
    },
    getGroupOption(group: Group): AutocompleteOption {
      return {
        label: group.meta.name,
        value: group.meta.id,
      };
    },
    isStaffInSelectedProgram(staff: StaffMember): boolean {
      if (!this.formData.spec.programId) return false;
      const program = this.programsStore.getProgramById(
        this.formData.spec.programId,
      );
      return program
        ? program.spec.staffMemberIds?.includes(staff.meta.id) || false
        : false;
    },
    staffHasRequiredCertifications(staff: StaffMember): boolean {
      if (this.selectedCertificationIds.length === 0) return true;
      if (
        !staff.spec.certificationIds ||
        staff.spec.certificationIds.length === 0
      )
        return false;
      return this.selectedCertificationIds.every((certId) =>
        staff.spec.certificationIds!.includes(certId),
      );
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
    getStaffLabel(staff: StaffMember): string {
      const baseLabel = `${staff.meta.name} - ${staff.spec.roleId}`;
      const availability = this.isStaffAvailable(staff);

      let prefix = "";

      // Check program membership
      if (this.isStaffInSelectedProgram(staff)) {
        prefix = "🎯 ";
      }

      // Check certifications
      if (this.selectedCertificationIds.length > 0) {
        const hasCerts = this.staffHasRequiredCertifications(staff);
        if (hasCerts) {
          prefix = prefix ? prefix + "✓ " : "✓ ";
        }
      }

      // Check availability
      if (!availability.available) {
        return `⚠️ ${prefix}${baseLabel} (${availability.reason})`;
      }

      return prefix + baseLabel;
    },
    getStaffInitials(staff: StaffMember): string {
      const parts = staff.meta.name.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return staff.meta.name.charAt(0).toUpperCase();
    },
    getStaffOption(staff: StaffMember): AutocompleteOption {
      const baseLabel = `${staff.meta.name} - ${staff.spec.roleId}`;
      const availability = this.isStaffAvailable(staff);

      let prefix = "";

      // Check program membership
      if (this.isStaffInSelectedProgram(staff)) {
        prefix = "🎯 ";
      }

      // Check certifications
      if (this.selectedCertificationIds.length > 0) {
        const hasCerts = this.staffHasRequiredCertifications(staff);
        if (hasCerts) {
          prefix = prefix ? prefix + "✓ " : "✓ ";
        }
      }

      // Check availability
      if (!availability.available) {
        return {
          label: `⚠️ ${prefix}${baseLabel} (${availability.reason})`,
          value: staff.meta.id,
        };
      }

      return {
        label: prefix + baseLabel,
        value: staff.meta.id,
      };
    },
    onProgramSelected(programId: string) {
      if (!programId) return;

      const program = this.programsStore.getProgramById(programId);
      if (!program) return;

      // Auto-apply program color if event color is not set or is default
      if (
        !this.formData.spec.colorId ||
        this.formData.spec.colorId === "#6366F1"
      ) {
        if (program.spec.colorId) {
          const color = this.colorsStore.getColorById(program.spec.colorId);
          if (color) {
            this.formData.spec.colorId = color.meta.id;
          }
        }
      }
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
              requiredCertificationIds: formData.spec.requiredCertificationIds,
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
    applyDurationPreset(durationMinutes: number) {
      if (!this.startTime) {
        this.toast.warning("Please select a start time first");
        return;
      }

      // Parse the start time
      const [startHours, startMinutes] = this.startTime.split(":").map(Number);

      // Calculate end time
      const totalMinutes = startHours * 60 + startMinutes + durationMinutes;
      const endHours = Math.floor(totalMinutes / 60) % 24;
      const endMinutes = totalMinutes % 60;

      // Format end time as HH:MM
      this.endTime = `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;

      // Track the selected preset for visual feedback
      this.selectedDurationPreset = durationMinutes;
    },
    formatDuration(minutes: number): string {
      if (minutes < 60) {
        return `${minutes} min`;
      }
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}h`;
      }
      return `${hours}h ${remainingMinutes}m`;
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

.duration-presets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.duration-preset-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: white;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.duration-preset-btn:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
  color: var(--primary-color);
}

.duration-preset-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.duration-preset-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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

.help-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}
</style>
