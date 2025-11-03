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
            :options="labelOptions"
            multiple
            label="Select Labels"
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
              :options="sessionOptions"
              label="Select Session"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Housing</label>
            <SelectionList
              class="housing-selection"
              v-model="localFormData.housingRoomId"
              @update:modelValue="handleHousingRoomChange"
              :options="availableHousingRoomsOptions"
              label="Select Housing"
              :disable="!localFormData.sessionId"
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
            <label class="radio-label">
              <div class="radio-option">
                <input type="radio" v-model="groupType" value="manual" />
                <span>Manual Selection (select campers and staff)</span>
              </div>
            </label>

            <label class="radio-label" :class="{ disabled: hasHousingRoom }">
              <div class="radio-option">
                <input
                  type="radio"
                  v-model="groupType"
                  value="nested"
                  :disabled="hasHousingRoom"
                />
                <span>Nested Group (contains other groups)</span>
              </div>
              <q-tooltip v-if="hasHousingRoom">
                Nested groups cannot be assigned a housing room
              </q-tooltip>
            </label>
          </div>
        </div>

        <!-- Nested Groups -->
        <div v-if="groupType === 'nested'" class="form-group">
          <label class="form-label">Child Groups</label>
          <p class="form-help-text">
            Select groups to include in this nested group
          </p>
          <SelectionList
            v-model="localFormData.groupIds"
            :options="availableGroupsOptions"
            multiple
            label="Select Groups"
          />
        </div>

        <!-- Manual Selection -->
        <div v-if="groupType === 'manual'">
          <div class="form-divider">
            <span>Campers & Staff</span>
          </div>

          <div class="form-group">
            <label class="form-label">Campers</label>
            <SelectionList
              v-model="localFormData.camperIds"
              :options="campersOptions"
              multiple
              label="Select Campers"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Staff Members</label>
            <SelectionList
              v-model="localFormData.staffIds"
              :options="staffMembersOptions"
              multiple
              label="Select Staff"
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
import SelectionList, { ISelectOption } from "@/components/SelectionList.vue";
import type { Label } from "@/types";
import type {
  Camper,
  StaffMember,
  Group,
  Session,
  HousingRoom,
} from "@/generated/api";
import {
  useColorsStore,
  useSessionsStore,
  useGroupsStore,
  useHousingRoomsStore,
} from "@/stores";
import type { QForm } from "quasar";
import { dateUtils } from "@/utils/dateUtils";

interface GroupFormData {
  name: string;
  description: string;
  sessionId: string;
  housingRoomId: string;
  groupIds: string[];
  camperIds: string[];
  staffIds: string[];
  labelIds: string[];
}

export default defineComponent({
  name: "GroupFormModal",
  components: {
    BaseModal,
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
    editingGroupId: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  emits: ["close", "save"],
  data() {
    return {
      localFormData: JSON.parse(JSON.stringify(this.formData)),
      groupType: "manual" as "nested" | "manual",
      formRef: null as any,
    };
  },
  computed: {
    staffMembersOptions(): ISelectOption[] {
      return this.staffMembers.map((staffMember: StaffMember) => ({
        label: staffMember.meta.name,
        value: staffMember.meta.id,
      }));
    },
    campersOptions(): ISelectOption[] {
      let campers = [...this.campers];

      if (this.localFormData.sessionId) {
        campers = campers.filter(
          (camper: Camper) =>
            camper.spec.sessionId === this.localFormData.sessionId,
        );
      }

      return campers.map((camper: Camper) => ({
        label:
          camper.meta.name +
          " (" +
          dateUtils.calculateAge(camper.spec.birthday) +
          " years old - " +
          camper.spec.gender +
          ")",
        value: camper.meta.id,
      }));
    },
    sessionOptions(): ISelectOption[] {
      return this.sessions.map((session: Session) => ({
        label: session.meta.name,
        value: session.meta.id,
      }));
    },
    availableHousingRoomsOptions(): ISelectOption[] {
      if (!this.localFormData.sessionId) return [];

      const groupsInSession = this.groups.filter(
        (group: Group) => group.spec.sessionId === this.localFormData.sessionId,
      );

      const housingRoomsInSession = groupsInSession
        .filter((g: Group) => !!g.spec.housingRoomId)
        .reduce((acc: Set<string>, group: Group) => {
          if (
            group.spec.housingRoomId &&
            group.meta.id !== this.editingGroupId
          ) {
            acc.add(group.spec.housingRoomId);
          }
          return acc;
        }, new Set<string>());

      const housingRoomOptions = this.housingRooms.map((room: HousingRoom) => ({
        label: room.meta.name + " (" + room.spec.beds + " beds)",
        value: room.meta.id,
        disable: housingRoomsInSession.has(room.meta.id),
        disabledTooltip: housingRoomsInSession.has(room.meta.id)
          ? "This housing room is already assigned to another group in this session"
          : "",
      }));

      return housingRoomOptions;
    },
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
    labelOptions(): ISelectOption[] {
      return this.labels.map((label) => ({
        label: label.meta.name,
        value: label.meta.id,
      }));
    },
    descriptionModel: {
      get(): string {
        return this.localFormData.description || "";
      },
      set(value: string) {
        this.localFormData.description = value || "";
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
    availableGroupsOptions(): ISelectOption[] {
      return this.availableGroups.map((group: Group) => ({
        label: group.meta.name,
        value: group.meta.id,
      }));
    },
  },
  watch: {
    formData: {
      handler(newVal) {
        this.localFormData = JSON.parse(JSON.stringify(newVal));
        this.detectGroupType();
      },
      deep: true,
    },
    groupType(newType) {
      // Clear conflicting fields when switching types
      if (newType === "nested") {
        this.localFormData.camperIds = [];
        this.localFormData.staffIds = [];
      } else if (newType === "manual") {
        this.localFormData.groupIds = [];
      }
    },
  },
  mounted() {
    this.detectGroupType();
  },
  methods: {
    handleHousingRoomChange(value: string) {
      this.localFormData.housingRoomId = value;
      if (value) {
        this.groupType = "manual";
      }
    },
    detectGroupType() {
      if (this.localFormData.groupIds.length > 0) {
        this.groupType = "nested";
      } else {
        this.groupType = "manual";
      }
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
