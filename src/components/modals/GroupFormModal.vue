<template>
  <BaseModal
    :title="isEditing ? 'Edit Group' : 'Create New Group'"
    @close="$emit('close')"
  >
    <template #body>
      <q-form @submit.prevent="handleSave" ref="formRef">
        <!-- Basic Info -->
        <div class="form-group">
          <label class="form-label">Group Name</label>
          <BaseInput
            v-model="localFormData.name"
            placeholder="e.g., Junior Campers"
            :rules="[(val: string) => !!val || 'Enter group name']"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <BaseInput
            v-model="descriptionModel"
            type="textarea"
            :rows="2"
            placeholder="Optional description of this group"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Labels (Optional)</label>
          <p class="form-help-text">
            Tag this group with labels for easy filtering and organization
          </p>
          <SelectionList
            v-model="localFormData.labelIds"
            :items="labels"
            item-type="label"
            placeholder="Add a label..."
            empty-text="No labels assigned yet"
            add-button-text="Add"
            mode="multiple"
            :get-label-fn="getLabelLabel"
            :get-initials-fn="getLabelInitials"
            :get-options-fn="getLabelOption"
          />
        </div>

        <!-- Optional Session and Housing -->
        <div class="form-divider">
          <span>Session & Housing (Optional)</span>
        </div>

        <div>
          <div class="form-group">
            <label class="form-label">Camp Session</label>
            <SelectionList
              v-model="localFormData.sessionId"
              :items="sessions"
              item-type="session"
              placeholder="Select a session..."
              empty-text="No session selected"
              add-button-text="Select"
              mode="single"
              :get-label-fn="getSessionLabel"
              :get-initials-fn="getSessionInitials"
              :get-options-fn="getSessionOption"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Housing</label>
            <SelectionList
              class="housing-selection"
              v-model="localFormData.housingRoomId"
              @update:modelValue="handleHousingRoomChange"
              :items="availableHousingRooms"
              item-type="housing"
              placeholder="Select a housing..."
              empty-text="No housing"
              add-button-text="Select"
              mode="single"
              :get-label-fn="getRoomLabel"
              :get-initials-fn="getRoomInitials"
              :get-options-fn="getRoomOption"
              :disabled="!localFormData.sessionId"
            />
            <q-tooltip
              v-if="!localFormData.sessionId"
              target=".housing-selection"
            >
              Select a session to view available housing
            </q-tooltip>
          </div>
        </div>

        <!-- Group Type Selection -->
        <div class="form-divider">
          <span>Group Configuration</span>
        </div>

        <div class="form-group">
          <label class="form-label">Group Type</label>
          <div class="radio-group">
            <label
              class="radio-label"
              :class="{ disabled: hasHousingRoom }"
              :title="
                hasHousingRoom
                  ? 'Disabled when housing room is selected - housing rooms require precise capacity management'
                  : ''
              "
            >
              <div class="radio-option">
                <input
                  type="radio"
                  v-model="groupType"
                  value="nested"
                  :disabled="hasHousingRoom"
                />
                <span>Nested Group (contains other groups)</span>
              </div>
            </label>
            <label
              class="radio-label"
              :class="{ disabled: hasHousingRoom }"
              :title="
                hasHousingRoom
                  ? 'Disabled when housing room is selected - housing rooms require precise capacity management'
                  : ''
              "
            >
              <div class="radio-option">
                <input
                  type="radio"
                  v-model="groupType"
                  value="filter"
                  :disabled="hasHousingRoom"
                />
                <span>Auto-assign Campers (using filters)</span>
              </div>
            </label>
            <label class="radio-label">
              <div class="radio-option">
                <input type="radio" v-model="groupType" value="manual" />
                <span>Manual Camper Selection</span>
              </div>
            </label>
            <label
              class="radio-label"
              :class="{ disabled: hasHousingRoom }"
              :title="
                hasHousingRoom
                  ? 'Disabled when housing room is selected - housing rooms require precise capacity management'
                  : ''
              "
            >
              <div class="radio-option">
                <input
                  type="radio"
                  v-model="groupType"
                  value="none"
                  :disabled="hasHousingRoom"
                />
                <span>Empty Group (no campers)</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Nested Groups -->
        <div v-if="groupType === 'nested'" class="form-group">
          <label class="form-label">Child Groups</label>
          <p class="form-help-text">
            Select groups to include in this nested group
          </p>
          <div class="checkbox-group">
            <label
              v-for="group in availableGroups"
              :key="group.meta.id"
              class="checkbox-label"
            >
              <input
                type="checkbox"
                :value="group.meta.id"
                v-model="localFormData.groupIds"
                class="checkbox-input"
              />
              <span>{{ group.meta.name }}</span>
            </label>
            <div
              v-if="availableGroups.length === 0"
              class="text-sm text-secondary"
            >
              No groups available
            </div>
          </div>
        </div>

        <!-- Camper Filters -->
        <div v-if="groupType === 'filter'" class="form-section">
          <h4 class="form-section-title">Camper Filter Criteria</h4>

          <div class="grid grid-cols-2">
            <div class="form-group">
              <label class="form-label">Minimum Age</label>
              <BaseInput
                v-model="ageMinModel"
                type="number"
                placeholder="No minimum"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Maximum Age</label>
              <BaseInput
                v-model="ageMaxModel"
                type="number"
                placeholder="No maximum"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Gender</label>
            <Autocomplete
              v-model="localFormData.camperFilters.gender"
              :options="genderFilterOptions"
              placeholder="Any gender"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Family Groups (Optional)</label>
            <p class="form-help-text">
              Filter campers from specific family groups
            </p>
            <div class="checkbox-group">
              <label
                v-for="group in groups"
                :key="group.meta.id"
                class="checkbox-label"
              >
                <input
                  type="checkbox"
                  :value="group.meta.id"
                  v-model="localFormData.camperFilters.groupIds"
                  class="checkbox-input"
                />
                <span>{{ group.meta.name }}</span>
              </label>
              <div v-if="groups.length === 0" class="text-sm text-secondary">
                No family groups available
              </div>
            </div>
          </div>

          <div class="form-info">
            <strong>Preview:</strong> {{ previewCamperCount }} campers match
            these criteria
          </div>
        </div>

        <!-- Manual Camper Selection -->
        <div v-if="groupType === 'manual'" class="form-section">
          <h4 class="form-section-title">Select Campers</h4>

          <div class="form-group">
            <label class="form-label">Campers in this Group</label>
            <SelectionList
              v-model="localFormData.camperIds"
              :items="campers"
              item-type="camper"
              placeholder="Add a camper..."
              empty-text="No campers selected"
              add-button-text="Add"
              mode="multiple"
              :get-label-fn="getCamperLabel"
              :get-initials-fn="getCamperInitials"
              :get-options-fn="getCamperOption"
            />
          </div>
        </div>

        <!-- Staff Configuration -->
        <div v-if="groupType !== 'nested'" class="form-divider">
          <span>Staff Assignment (Optional)</span>
        </div>

        <div v-if="groupType !== 'nested'" class="form-group">
          <label class="form-label">Staff Assignment Type</label>
          <div class="radio-group">
            <label
              class="radio-label"
              :class="{ disabled: hasHousingRoom }"
              :title="
                hasHousingRoom
                  ? 'Disabled when housing room is selected - housing rooms require precise capacity management'
                  : ''
              "
            >
              <div class="radio-option">
                <input
                  type="radio"
                  v-model="staffType"
                  value="none"
                  :disabled="hasHousingRoom"
                />
                <span>No Staff</span>
              </div>
            </label>
            <label
              class="radio-label"
              :class="{ disabled: hasHousingRoom }"
              :title="
                hasHousingRoom
                  ? 'Disabled when housing room is selected - housing rooms require precise capacity management'
                  : ''
              "
            >
              <div class="radio-option">
                <input
                  type="radio"
                  v-model="staffType"
                  value="filter"
                  :disabled="hasHousingRoom"
                />
                <span>Auto-assign Staff (using filters)</span>
              </div>
            </label>
            <label class="radio-label">
              <div class="radio-option">
                <input type="radio" v-model="staffType" value="manual" />
                <span>Manual Staff Selection</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Staff Filters -->
        <div v-if="staffType === 'filter'" class="form-section">
          <h4 class="form-section-title">Staff Filter Criteria</h4>

          <div class="form-group">
            <label class="form-label">Staff Roles</label>
            <p class="form-help-text">Select roles to include</p>
            <div class="checkbox-group">
              <label
                v-for="role in staffRoles"
                :key="role.value"
                class="checkbox-label"
              >
                <input
                  type="checkbox"
                  :value="role.value"
                  v-model="localFormData.staffFilters.roles"
                  class="checkbox-input"
                />
                <span>{{ role.label }}</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Required Certifications</label>
            <SelectionList
              v-model="localFormData.staffFilters.certificationIds"
              :items="certifications"
              item-type="certification"
              placeholder="Add a certification..."
              empty-text="No certifications required"
              add-button-text="Add"
              mode="multiple"
              :get-label-fn="getCertificationLabel"
              :get-initials-fn="getCertificationInitials"
              :get-options-fn="getCertificationOption"
            />
          </div>

          <div class="form-info">
            <strong>Preview:</strong> {{ previewStaffCount }} staff match these
            criteria
          </div>
        </div>

        <!-- Manual Staff Selection -->
        <div v-if="staffType === 'manual'" class="form-section">
          <h4 class="form-section-title">Select Staff</h4>

          <div class="form-group">
            <label class="form-label">Staff Members</label>
            <SelectionList
              v-model="localFormData.staffIds"
              :items="staffMembers"
              item-type="staff member"
              placeholder="Add a staff member..."
              empty-text="No staff selected"
              add-button-text="Add"
              mode="multiple"
              :get-label-fn="getStaffLabel"
              :get-initials-fn="getStaffInitials"
              :get-options-fn="getStaffOption"
            />
          </div>
        </div>
      </q-form>
    </template>

    <template #footer>
      <div class="flex q-gutter-x-sm">
        <BaseButton flat @click="$emit('close')" label="Cancel" />
        <BaseButton
          color="primary"
          @click="handleSave"
          :label="isEditing ? 'Update Group' : 'Create Group'"
        />
      </div>
    </template>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import Autocomplete, {
  type AutocompleteOption,
} from "@/components/Autocomplete.vue";
import SelectionList from "@/components/SelectionList.vue";
import type {
  Camper,
  StaffMember,
  Label,
  Group,
  Session,
  HousingRoom,
  Certification,
} from "@/types";
import {
  useColorsStore,
  useSessionsStore,
  useGroupsStore,
  useHousingRoomsStore,
} from "@/stores";
import type { QForm } from "quasar";

interface GroupFormData {
  name: string;
  description: string;
  sessionId: string;
  housingRoomId: string;
  groupIds: string[];
  camperFilters: {
    ageMin?: number;
    ageMax?: number;
    gender?: "" | "male" | "female";
    hasAllergies?: boolean;
    groupIds?: string[];
  };
  camperIds: string[];
  staffFilters: {
    roles: string[];
    certificationIds: string[];
  };
  staffIds: string[];
  labelIds: string[];
}

export default defineComponent({
  name: "GroupFormModal",
  components: {
    BaseModal,
    Autocomplete,
    SelectionList,
  },
  props: {
    isEditing: {
      type: Boolean,
      default: false,
    },
    formData: {
      type: Object as PropType<GroupFormData>,
      required: true,
    },
    campers: {
      type: Array as PropType<Camper[]>,
      required: true,
    },
    staffMembers: {
      type: Array as PropType<StaffMember[]>,
      required: true,
    },
    labels: {
      type: Array as PropType<Label[]>,
      default: () => [],
    },
    certifications: {
      type: Array as PropType<Certification[]>,
      default: () => [],
    },
    editingGroupId: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  emits: ["close", "save"],
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData)),
      groupType: "filter" as "nested" | "filter" | "manual" | "none",
      staffType: "none" as "none" | "filter" | "manual",
      formRef: null as any,
      genderFilterOptions: [
        { label: "Any Gender", value: "" },
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
      ] as AutocompleteOption[],
      staffRoles: [
        { label: "Counselor", value: "counselor" },
        { label: "Supervisor", value: "supervisor" },
        { label: "Director", value: "director" },
        { label: "Nurse", value: "nurse" },
        { label: "Instructor", value: "instructor" },
      ],
    };
  },
  computed: {
    sessionsStore() {
      return useSessionsStore();
    },
    sessions(): Session[] {
      return this.sessionsStore.sessions;
    },
    groupsStore() {
      return useGroupsStore();
    },
    groups(): Group[] {
      return this.groupsStore.groups;
    },
    housingRoomsStore() {
      return useHousingRoomsStore();
    },
    housingRooms(): HousingRoom[] {
      return this.housingRoomsStore.housingRooms;
    },
    colorsStore() {
      return useColorsStore();
    },
    descriptionModel: {
      get(): string {
        return this.localFormData.description || "";
      },
      set(value: string) {
        this.localFormData.description = value || "";
      },
    },
    ageMinModel: {
      get(): string {
        return this.localFormData.camperFilters.ageMin?.toString() || "";
      },
      set(value: string) {
        const num = parseInt(value);
        this.localFormData.camperFilters.ageMin = isNaN(num) ? undefined : num;
      },
    },
    ageMaxModel: {
      get(): string {
        return this.localFormData.camperFilters.ageMax?.toString() || "";
      },
      set(value: string) {
        const num = parseInt(value);
        this.localFormData.camperFilters.ageMax = isNaN(num) ? undefined : num;
      },
    },
    hasHousingRoom(): boolean {
      return !!(
        this.localFormData.housingRoomId &&
        this.localFormData.housingRoomId.trim() !== ""
      );
    },
    availableGroups(): Group[] {
      // Exclude the current group being edited and any that would cause circular references
      return this.groups.filter((g) => g.meta.id !== this.editingGroupId);
    },
    availableHousingRooms(): HousingRoom[] {
      // If no session is selected, return empty array
      if (!this.localFormData.sessionId) {
        return [];
      }

      // Return all housing rooms - availability will be handled in getRoomOption
      return this.housingRooms;
    },
    previewCamperCount(): number {
      if (this.groupType !== "filter") return 0;

      let baseCampers = this.campers;

      // Filter by family groups if selected
      if (
        this.localFormData.camperFilters.groupIds &&
        this.localFormData.camperFilters.groupIds.length > 0
      ) {
        baseCampers = baseCampers.filter(
          (c) =>
            c.spec.familyGroupId &&
            this.localFormData.camperFilters.groupIds!.includes(
              c.spec.familyGroupId,
            ),
        );
      }

      // Apply age, gender, and allergy filters
      return baseCampers.filter((camper) => {
        if (
          this.localFormData.camperFilters.ageMin !== undefined &&
          camper.spec.age < this.localFormData.camperFilters.ageMin
        )
          return false;
        if (
          this.localFormData.camperFilters.ageMax !== undefined &&
          camper.spec.age > this.localFormData.camperFilters.ageMax
        )
          return false;
        if (
          this.localFormData.camperFilters.gender &&
          camper.spec.gender !== this.localFormData.camperFilters.gender
        )
          return false;
        return true;
      }).length;
    },
    previewStaffCount(): number {
      if (this.staffType !== "filter") return 0;

      return this.staffMembers.filter((staff) => {
        // Role filter
        if (this.localFormData.staffFilters.roles.length > 0) {
          if (
            !this.localFormData.staffFilters.roles.includes(staff.spec.roleId)
          )
            return false;
        }

        // Certification filter
        if (this.localFormData.staffFilters.certificationIds.length > 0) {
          if (
            !staff.spec.certificationIds ||
            staff.spec.certificationIds.length === 0
          )
            return false;
          const hasAllCerts =
            this.localFormData.staffFilters.certificationIds.every(
              (certId: string) => staff.spec.certificationIds!.includes(certId),
            );
          if (!hasAllCerts) return false;
        }

        return true;
      }).length;
    },
  },
  watch: {
    formData: {
      handler(newVal) {
        this.localFormData = JSON.parse(JSON.stringify(newVal));
        this.detectGroupType();
        this.detectStaffType();
      },
      deep: true,
    },
    "localFormData.sessionId"() {
      // Clear housing room if it's no longer available for the selected session
      if (this.localFormData.housingRoomId) {
        const isRoomAvailable = this.availableHousingRooms.some(
          (room) => room.meta.id === this.localFormData.housingRoomId,
        );
        if (!isRoomAvailable) {
          this.localFormData.housingRoomId = "";
        }
      }
    },
    groupType(newType) {
      // Clear conflicting fields when switching types
      if (newType === "nested") {
        this.localFormData.camperIds = [];
        this.localFormData.camperFilters = {
          ageMin: undefined,
          ageMax: undefined,
          gender: "",
          hasAllergies: undefined,
          familyGroupIds: [],
        };
        this.localFormData.staffIds = [];
        this.localFormData.staffFilters = { roles: [], certificationIds: [] };
        this.staffType = "none";
      } else if (newType === "filter") {
        this.localFormData.camperIds = [];
        this.localFormData.groupIds = [];
      } else if (newType === "manual") {
        this.localFormData.camperFilters = {
          ageMin: undefined,
          ageMax: undefined,
          gender: "",
          hasAllergies: undefined,
          familyGroupIds: [],
        };
        this.localFormData.groupIds = [];
      } else if (newType === "none") {
        this.localFormData.camperIds = [];
        this.localFormData.camperFilters = {
          ageMin: undefined,
          ageMax: undefined,
          gender: "",
          hasAllergies: undefined,
          familyGroupIds: [],
        };
        this.localFormData.groupIds = [];
      }
    },
    staffType(newType) {
      if (newType === "none") {
        this.localFormData.staffIds = [];
        this.localFormData.staffFilters = { roles: [], certificationIds: [] };
      } else if (newType === "filter") {
        this.localFormData.staffIds = [];
      } else if (newType === "manual") {
        this.localFormData.staffFilters = { roles: [], certificationIds: [] };
      }
    },
  },
  mounted() {
    this.detectGroupType();
    this.detectStaffType();
  },
  methods: {
    handleHousingRoomChange(value: string) {
      this.localFormData.housingRoomId = value;
      if (value) {
        this.groupType = "manual";
        this.staffType = "manual";
      }
    },
    detectGroupType() {
      if (this.localFormData.groupIds.length > 0) {
        this.groupType = "nested";
      } else if (this.localFormData.camperIds.length > 0) {
        this.groupType = "manual";
      } else if (this.hasAnyCamperFilters()) {
        this.groupType = "filter";
      } else {
        this.groupType = "none";
      }
    },
    detectStaffType() {
      if (this.localFormData.staffIds.length > 0) {
        this.staffType = "manual";
      } else if (this.hasAnyStaffFilters()) {
        this.staffType = "filter";
      } else {
        this.staffType = "none";
      }
    },
    hasAnyCamperFilters(): boolean {
      const f = this.localFormData.camperFilters;
      return !!(
        f.ageMin !== undefined ||
        f.ageMax !== undefined ||
        f.gender ||
        f.hasAllergies !== undefined ||
        (f.familyGroupIds && f.familyGroupIds.length > 0)
      );
    },
    hasAnyStaffFilters(): boolean {
      const f = this.localFormData.staffFilters;
      return !!(f.roles.length > 0 || f.certificationIds.length > 0);
    },

    // Label methods
    getLabelLabel(label: Label): string {
      return label.meta.name;
    },
    getLabelInitials(label: Label): string {
      return label.meta.name.substring(0, 2).toUpperCase();
    },
    getLabelOption(label: Label): AutocompleteOption {
      return {
        label: label.meta.name,
        value: label.meta.id,
        description: label.meta.description,
      };
    },

    // Session methods
    getSessionLabel(session: Session): string {
      return session.meta.name;
    },
    getSessionInitials(session: Session): string {
      const words = session.meta.name.split(" ");
      if (words.length >= 2) {
        return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
      }
      return session.meta.name.substring(0, 2).toUpperCase();
    },
    getSessionOption(session: Session): AutocompleteOption {
      const startDate = new Date(session.spec.startDate).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" },
      );
      const endDate = new Date(session.spec.endDate).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        },
      );
      return {
        label: `${session.meta.name} (${startDate} - ${endDate})`,
        value: session.meta.id,
      };
    },

    // Room methods
    getRoomLabel(room: HousingRoom): string {
      return `${room.meta.name} (${room.spec.beds} beds)`;
    },
    getRoomInitials(room: HousingRoom): string {
      const words = room.meta.name.split(" ");
      if (words.length >= 2) {
        return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
      }
      return room.meta.name.substring(0, 2).toUpperCase();
    },
    getRoomOption(room: HousingRoom): AutocompleteOption {
      // Check if room is available for the selected session
      const selectedSession = this.sessions.find(
        (s) => s.meta.id === this.localFormData.sessionId,
      );

      if (!selectedSession) {
        return {
          label: `${room.meta.name} (${room.spec.beds} beds)`,
          value: room.meta.id,
          disabled: false,
        };
      }

      // Find if any other group is using this room during overlapping dates
      const occupyingGroup = this.groups.find((group) => {
        // Skip the current group being edited
        if (group.meta.id === this.editingGroupId) {
          return false;
        }

        // Check if this group is using the room
        if (group.spec.housingRoomId !== room.meta.id) {
          return false;
        }

        // Check if this group's session overlaps with the selected session
        if (!group.spec.sessionId) {
          return false;
        }

        const groupSession = this.sessions.find(
          (s) => s.meta.id === group.spec.sessionId,
        );
        if (!groupSession) {
          return false;
        }

        // Check for date overlap
        const selectedStart = new Date(selectedSession.spec.startDate);
        const selectedEnd = new Date(selectedSession.spec.endDate);
        const groupStart = new Date(groupSession.spec.startDate);
        const groupEnd = new Date(groupSession.spec.endDate);

        // Rooms overlap if: start1 <= end2 && start2 <= end1
        return selectedStart <= groupEnd && groupStart <= selectedEnd;
      });

      if (occupyingGroup) {
        return {
          label: `${room.meta.name} (${room.spec.beds} beds) - (Occupied by ${occupyingGroup.meta.name})`,
          value: room.meta.id,
          disabled: true,
        };
      }

      return {
        label: `${room.meta.name} (${room.spec.beds} beds)`,
        value: room.meta.id,
        disabled: false,
      };
    },

    // Camper methods
    getCamperLabel(camper: Camper): string {
      return `${camper.spec.firstName} ${camper.spec.lastName}`;
    },
    getCamperInitials(camper: Camper): string {
      return `${camper.spec.firstName.charAt(0)}${camper.spec.lastName.charAt(0)}`;
    },
    getCamperOption(camper: Camper): AutocompleteOption {
      // If this group has a housing room, check if the camper is already in another group with a housing room
      if (this.hasHousingRoom) {
        const occupyingGroup = this.groups.find((group) => {
          // Skip the current group being edited
          if (group.meta.id === this.editingGroupId) {
            return false;
          }

          // Check if this group has a housing room
          if (!group.spec.housingRoomId) {
            return false;
          }

          // Check if this camper is in this group
          if (
            group.spec.camperIds &&
            group.spec.camperIds.includes(camper.meta.id)
          ) {
            return true;
          }

          return false;
        });

        if (occupyingGroup) {
          return {
            label: `${camper.spec.firstName} ${camper.spec.lastName} (Age ${camper.spec.age}) - Assigned to ${occupyingGroup.meta.name}`,
            value: camper.meta.id,
            disabled: true,
          };
        }
      }

      return {
        label: `${camper.spec.firstName} ${camper.spec.lastName} (Age ${camper.spec.age})`,
        value: camper.meta.id,
      };
    },

    // Staff methods
    getStaffLabel(staff: StaffMember): string {
      return `${staff.spec.firstName} ${staff.spec.lastName} (${staff.spec.roleId})`;
    },
    getStaffInitials(staff: StaffMember): string {
      return `${staff.spec.firstName.charAt(0)}${staff.spec.lastName.charAt(0)}`;
    },
    getStaffOption(staff: StaffMember): AutocompleteOption {
      return {
        label: `${staff.spec.firstName} ${staff.spec.lastName} (${staff.spec.roleId})`,
        value: staff.meta.id,
      };
    },

    // Certification methods
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
        description: cert.meta.description,
      };
    },

    async handleSave() {
      const isValid = await (this.$refs.formRef as QForm).validate();
      if (!isValid) return;

      this.$emit("save", this.localFormData);
    },
  },
});
</script>

<style scoped>
.form-divider {
  margin: 1.5rem 0;
  text-align: center;
  position: relative;
}

.form-divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border-color);
}

.form-divider span {
  position: relative;
  background: var(--background);
  padding: 0 1rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
}

.form-section {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--background-secondary);
  border-radius: var(--radius);
}

.form-section-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-info {
  padding: 1rem;
  background: var(--info-bg, #eff6ff);
  border: 1px solid var(--info-border, #bfdbfe);
  border-radius: var(--radius);
  color: var(--info-text, #1e40af);
  font-size: 0.875rem;
  margin-top: 1rem;
}

.form-help-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  margin-top: -0.25rem;
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

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  cursor: pointer;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  transition: all 0.15s ease;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.radio-label:hover {
  background: var(--background-secondary);
  border-color: var(--primary-color);
}

.radio-label.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--background-secondary);
}

.radio-label.disabled:hover {
  border-color: var(--border-color);
}

.radio-label input[type="radio"] {
  cursor: pointer;
}

.radio-label.disabled input[type="radio"] {
  cursor: not-allowed;
}

.radio-option input[type="radio"]:checked + span {
  font-weight: 600;
  color: var(--primary-color);
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
</style>
