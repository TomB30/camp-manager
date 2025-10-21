<template>
  <BaseModal
    :title="isEditing ? 'Edit Event' : 'Create New Event'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <!-- Activity Template Selector (only show when creating new event) -->
        <div v-if="!isEditing" class="form-group">
          <label class="form-label"
            >Create from Activity Template (Optional)</label
          >
          <Autocomplete
            v-model="selectedActivityId"
            :options="activityOptions"
            placeholder="Select an activity template..."
            @update:modelValue="applyActivityTemplate"
          />
          <div v-if="selectedActivityId" class="text-xs text-secondary mt-1">
            Event details will be pre-filled from the activity template. You can
            still modify them.
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Title</label>
          <BaseInput
            v-model="localFormData.title"
            placeholder="Enter event title"
            :rules="[(val: string) => !!val || 'Enter event title']"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Event Date</label>
          <BaseInput
            v-model="localFormData.eventDate"
            type="date"
            :rules="[(val: string) => !!val || 'Enter event date']"
          />
        </div>

        <div class="grid grid-cols-2">
          <div class="form-group">
            <label class="form-label">Start Time</label>
            <BaseInput
              v-model="localFormData.startDate"
              type="time"
              :rules="[(val: string) => !!val || 'Enter start time']"
            />
          </div>

          <div class="form-group">
            <label class="form-label">End Time</label>
            <BaseInput
              v-model="localFormData.endDate"
              type="time"
              :rules="[(val: string) => !!val || 'Enter end time']"
            />
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
          <label class="form-label">Location</label>
          <Autocomplete
            v-model="localFormData.locationId"
            :options="locationOptions"
            placeholder="Select a location"
            :required="true"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Capacity</label>
          <BaseInput
            v-model="capacityModel"
            type="number"
            placeholder="Enter capacity"
            :rules="[
              (val: string) => !!val || 'Enter capacity',
              (val: string) => parseInt(val) > 0 || 'Must be greater than 0'
            ]"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Program (Optional)</label>
          <Autocomplete
            v-model="localFormData.programId"
            :options="programOptions"
            placeholder="Select a program..."
            @update:modelValue="onProgramSelected"
          />
          <p class="form-help-text">
            Selecting a program helps auto-suggest staff members from that
            program
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">Color</label>
          <ColorPicker v-model="localFormData.colorId" />
        </div>

        <div class="form-group">
          <label class="form-label">Required Certifications (Optional)</label>
          <SelectionList
            v-model="selectedCertificationIds"
            :items="certificationsStore.certifications"
            item-type="certification"
            placeholder="Select a certification..."
            empty-text="No certifications required"
            add-button-text="Add"
            mode="multiple"
            :get-label-fn="getCertificationLabel"
            :get-initials-fn="getCertificationInitials"
            :get-options-fn="getCertificationOption"
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
            v-model="localFormData.groupIds"
            :items="allGroups"
            item-type="group"
            placeholder="Select groups..."
            empty-text="No groups assigned"
            add-button-text="Add Group"
            mode="multiple"
            :get-label-fn="getGroupLabel"
            :get-initials-fn="getGroupInitials"
            :get-options-fn="getGroupOption"
          />
        </div>

        <!-- Exclude Individual Campers -->
        <div v-if="localFormData.groupIds.length > 0" class="form-group">
          <label class="form-label"
            >Exclude Individual Campers (Optional)</label
          >
          <div class="help-text">
            Exclude specific campers from the assigned groups.
          </div>
          <SelectionList
            v-model="localFormData.excludeCamperIds"
            :items="campersInAssignedGroups"
            item-type="camper"
            placeholder="Select campers to exclude..."
            empty-text="No campers excluded"
            add-button-text="Exclude"
            mode="multiple"
            :get-label-fn="getCamperLabel"
            :get-initials-fn="getCamperInitials"
            :get-options-fn="getCamperOption"
          />
        </div>

        <!-- Exclude Individual Staff -->
        <div v-if="localFormData.groupIds.length > 0" class="form-group">
          <label class="form-label">Exclude Individual Staff (Optional)</label>
          <div class="help-text">
            Exclude specific staff members from the assigned groups.
          </div>
          <SelectionList
            v-model="localFormData.excludeStaffIds"
            :items="staffInAssignedGroups"
            item-type="staff member"
            placeholder="Select staff to exclude..."
            empty-text="No staff excluded"
            add-button-text="Exclude"
            mode="multiple"
            :get-label-fn="getStaffLabel"
            :get-initials-fn="getStaffInitials"
            :get-options-fn="getStaffOption"
          />
        </div>
      </q-form>
    </template>

    <template #footer>
      <div class="flex q-gutter-x-sm">
        <BaseButton flat @click="$emit('close')" label="Cancel" />
        <BaseButton color="primary" @click="handleSave" :label="isEditing ? 'Save Changes' : 'Create Event'" />
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
} from "@/stores";
import { conflictDetector } from "@/services/conflicts";
import { useToast } from "@/composables/useToast";
import BaseModal from "@/components/BaseModal.vue";
import BaseInput from "@/components/common/BaseInput.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import Autocomplete, {
  type AutocompleteOption,
} from "@/components/Autocomplete.vue";
import ColorPicker from "@/components/ColorPicker.vue";
import SelectionList from "@/components/SelectionList.vue";
import NumberInput from "@/components/NumberInput.vue";
import type { Location, Camper, StaffMember, Group } from "@/types";
import type { Certification } from "@/types";
import {
  type RecurrenceData,
  type DayOfWeek,
  formatRecurrenceRule,
  validateRecurrenceRule,
} from "@/utils/recurrence";
import type { QForm } from "quasar";

interface EventFormData {
  title: string;
  eventDate: string;
  startDate: string;
  endDate: string;
  locationId: string;
  capacity: number;
  colorId: string;
  requiredCertifications: string[];
  groupIds: string[];
  excludeCamperIds: string[];
  excludeStaffIds: string[];
  programId?: string;
  activityId?: string;
}

export default defineComponent({
  name: "EventFormModal",
  components: {
    BaseModal,
    BaseInput,
    BaseButton,
    Autocomplete,
    ColorPicker,
    SelectionList,
    NumberInput,
  },
  props: {
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
      type: Array as PropType<Location[]>,
      required: true,
    },
    staffMembers: {
      type: Array as PropType<StaffMember[]>,
      required: true,
    },
    groups: {
      type: Array as PropType<Group[]>,
      required: true,
    },
    campers: {
      type: Array as PropType<Camper[]>,
      required: true,
    },
  },
  emits: ["close", "save"],
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
    };
  },
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData)),
      selectedActivityId: "",
      selectedCertificationIds: [] as string[],
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
  computed: {
    capacityModel: {
      get(): string {
        return this.localFormData.capacity?.toString() || "";
      },
      set(value: string) {
        const num = parseInt(value);
        this.localFormData.capacity = isNaN(num) ? 0 : num;
      },
    },
    programOptions(): AutocompleteOption[] {
      return [
        { label: "None", value: "" },
        ...this.programsStore.programs.map((program) => ({
          label: program.name,
          value: program.id,
        })),
      ];
    },
    selectedProgramName(): string {
      if (!this.localFormData.programId) return "";
      const program = this.programsStore.getProgramById(
        this.localFormData.programId,
      );
      return program ? program.name : "";
    },
    locationOptions(): AutocompleteOption[] {
      return this.rooms.map((room) => ({
        label: `${room.name} (Capacity: ${room.capacity})`,
        value: room.id,
      }));
    },
    activityOptions(): AutocompleteOption[] {
      // Group activities by program
      const optionsWithGroups: AutocompleteOption[] = [];

      this.programsStore.programs.forEach((program) => {
        const programActivities = this.activitiesStore.getActivitiesInProgram(
          program.id,
        );
        if (programActivities.length > 0) {
          programActivities.forEach((activity) => {
            optionsWithGroups.push({
              label: `(${program.name}) ${activity.name}`,
              value: activity.id,
            });
          });
        }
      });

      return optionsWithGroups;
    },
    allGroups(): Array<Group> {
      return this.groups;
    },
    campersInAssignedGroups(): Camper[] {
      if (
        !this.localFormData.groupIds ||
        this.localFormData.groupIds.length === 0
      ) {
        return [];
      }

      const camperIds = new Set<string>();

      // Get campers from all assigned groups
      this.localFormData.groupIds.forEach((groupId: string) => {
        // Check if it's a camper group
        const group = this.groupsStore.getGroupById(groupId);
        if (group) {
          const campers = this.groupsStore.getCampersInGroup(groupId);
          campers.forEach((camper) => camperIds.add(camper.id));
        }
      });

      // Return full camper objects
      return this.campersStore.campers.filter((c) => camperIds.has(c.id));
    },

    staffInAssignedGroups(): StaffMember[] {
      if (
        !this.localFormData.groupIds ||
        this.localFormData.groupIds.length === 0
      ) {
        return [];
      }

      const staffIds = new Set<string>();

      // Get staff from all assigned family groups
      this.localFormData.groupIds.forEach((groupId: string) => {
        const group = this.groupsStore.getGroupById(groupId);
        if (group && group.staffIds) {
          group.staffIds.forEach((staffId: string) => staffIds.add(staffId));
        } else if (group && group.staffFilters) {
          const staff = this.staffMembersStore.getStaffMembersByFilters(
            group.staffFilters,
          );
          staff.forEach((s: StaffMember) => staffIds.add(s.id));
        }
      });

      // Return full staff member objects
      return this.staffMembersStore.staffMembers.filter((s) =>
        staffIds.has(s.id),
      );
    },

    availableStaffMembers(): StaffMember[] {
      // Return staff members with their original data
      return this.staffMembers;
    },
    eventStartDateTime(): Date | null {
      if (!this.localFormData.startDate || !this.localFormData.eventDate)
        return null;
      const [hours, minutes] = this.localFormData.startDate
        .split(":")
        .map(Number);
      const date = new Date(this.localFormData.eventDate);
      date.setHours(hours, minutes, 0, 0);
      return date;
    },
    eventEndDateTime(): Date | null {
      if (!this.localFormData.endDate || !this.localFormData.eventDate)
        return null;
      const [hours, minutes] = this.localFormData.endDate
        .split(":")
        .map(Number);
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
      },
    },
  },
  watch: {
    formData: {
      handler(newVal) {
        this.localFormData = JSON.parse(JSON.stringify(newVal));
        // Initialize certification IDs from names
        if (
          newVal.requiredCertifications &&
          newVal.requiredCertifications.length > 0
        ) {
          this.selectedCertificationIds = this.getCertificationIdsFromNames(
            newVal.requiredCertifications,
          );
        } else {
          this.selectedCertificationIds = [];
        }
      },
      deep: true,
      immediate: true,
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
            const eventDate = new Date(this.localFormData.eventDate);
            const dayOfWeek = eventDate.getDay() as DayOfWeek;
            this.recurrenceData.daysOfWeek = [dayOfWeek];
          }
        }
      },
    },
  },
  methods: {
    applyActivityTemplate(activityId: string) {
      if (!activityId) return;

      const activity = this.activitiesStore.getActivityById(activityId);
      if (!activity) return;

      // Auto-populate form fields from activity template
      this.localFormData.title = activity.name;

      // Calculate end time based on start time and duration
      if (this.localFormData.startDate) {
        const [hours, minutes] = this.localFormData.startDate
          .split(":")
          .map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);

        const endDate = new Date(
          startDate.getTime() + (activity.duration || 0) * 60000,
        );
        const endHours = endDate.getHours().toString().padStart(2, "0");
        const endMinutes = endDate.getMinutes().toString().padStart(2, "0");
        this.localFormData.endDate = `${endHours}:${endMinutes}`;
      }

      // Set default location if specified
      if (activity.defaultLocationId) {
        this.localFormData.locationId = activity.defaultLocationId;
      }

      // Set default capacity if specified
      if (activity.defaultCapacity) {
        this.localFormData.capacity = activity.defaultCapacity;
      }

      // Set color if specified
      if (activity.colorId) {
        const color = this.colorsStore.getColorById(activity.colorId);
        if (color) {
          this.localFormData.colorId = color.id;
        }
      }

      // Set required certifications if specified
      if (
        activity.requiredCertificationIds &&
        activity.requiredCertificationIds.length > 0
      ) {
        this.localFormData.requiredCertificationIds = [
          ...activity.requiredCertificationIds,
        ];
        this.selectedCertificationIds = this.getCertificationIdsFromNames(
          activity.requiredCertificationIds,
        );
      }

      // Set program and activity IDs for reference
      // Use the first program if activity belongs to multiple programs
      this.localFormData.programId = activity.programIds[0];
      this.localFormData.activityId = activity.id;
    },
    getGroupColor(group: any): string {
      if (group.colorId) {
        const color = this.colorsStore.getColorById(group.colorId);
        return color?.hexValue || "#6366F1";
      }
      return "#6366F1";
    },
    getGroupCamperCount(groupId: string): number {
      return this.groupsStore.getCampersInGroup(groupId).length;
    },
    getTotalCampersFromGroups(): number {
      return this.campersInAssignedGroups.length;
    },
    getCamperLabel(camper: Camper): string {
      return `${camper.firstName} ${camper.lastName} (Age: ${camper.age})`;
    },
    getCamperInitials(camper: Camper): string {
      return `${camper.firstName[0]}${camper.lastName[0]}`.toUpperCase();
    },
    getCamperOption(camper: Camper): AutocompleteOption {
      return {
        label: `${camper.firstName} ${camper.lastName} (Age: ${camper.age})`,
        value: camper.id,
      };
    },
    getCertificationIdsFromNames(names: string[]): string[] {
      return names
        .map((name) => {
          const cert = this.certificationsStore.certifications.find(
            (c) => c.name === name,
          );
          return cert ? cert.id : "";
        })
        .filter((id) => id !== "");
    },
    getCertificationNamesFromIds(ids: string[]): string[] {
      return ids
        .map((id) => {
          const cert = this.certificationsStore.getCertificationById(id);
          return cert ? cert.name : "";
        })
        .filter((name) => name !== "");
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
        value: cert.id,
      };
    },
    getGroupLabel(group: Group): string {
      // Check if it's a camper group or family group
      const camperCount = this.groupsStore.getCampersInGroup(group.id).length;
      return `${group.name} (${camperCount} campers)`;
    },
    getGroupInitials(group: Group): string {
      // Use first two letters of the group name
      return group.name.substring(0, 2).toUpperCase();
    },
    getGroupOption(group: Group): AutocompleteOption {
      return {
        label: group.name,
        value: group.id,
      };
    },
    isStaffInSelectedProgram(staff: StaffMember): boolean {
      if (!this.localFormData.programId) return false;
      const program = this.programsStore.getProgramById(
        this.localFormData.programId,
      );
      return program
        ? program.staffMemberIds?.includes(staff.id) || false
        : false;
    },
    staffHasRequiredCertifications(staff: StaffMember): boolean {
      if (this.selectedCertificationIds.length === 0) return true;
      if (!staff.certificationIds || staff.certificationIds.length === 0)
        return false;
      return this.selectedCertificationIds.every((certId) =>
        staff.certificationIds!.includes(certId),
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
        staff.id,
        this.eventsStore.events,
        this.editingEventId
          ? new Map<string, string[]>([[this.editingEventId, []]])
          : undefined,
      );

      return { available: result.canAssign, reason: result.reason };
    },
    getStaffLabel(staff: StaffMember): string {
      const baseLabel = `${staff.firstName} ${staff.lastName} - ${staff.roleId}`;
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
      return `${staff.firstName[0]}${staff.lastName[0]}`.toUpperCase();
    },
    getStaffOption(staff: StaffMember): AutocompleteOption {
      const baseLabel = `${staff.firstName} ${staff.lastName} - ${staff.roleId}`;
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
          value: staff.id,
        };
      }

      return {
        label: prefix + baseLabel,
        value: staff.id,
      };
    },
    onProgramSelected(programId: string) {
      if (!programId) return;

      const program = this.programsStore.getProgramById(programId);
      if (!program) return;

      // Auto-apply program color if event color is not set or is default
      if (
        !this.localFormData.colorId ||
        this.localFormData.colorId === "#6366F1"
      ) {
        if (program.colorId) {
          const color = this.colorsStore.getColorById(program.colorId);
          if (color) {
            this.localFormData.colorId = color.id;
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

      // Convert certification IDs to names before saving
      this.localFormData.requiredCertifications =
        this.getCertificationNamesFromIds(this.selectedCertificationIds);

      // Validate recurrence if enabled
      if (this.recurrenceData.enabled) {
        const validation = validateRecurrenceRule(this.recurrenceData);
        if (!validation.valid) {
          this.toast.error("Invalid recurrence settings", validation.error);
          return;
        }
      }

      this.$emit("save", {
        formData: this.localFormData,
        recurrence: this.recurrenceData.enabled ? this.recurrenceData : null,
      });
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
