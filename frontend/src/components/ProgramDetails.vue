<template>
  <section class="program-detail">
    <div class="detail-header">
      <div class="detail-header-content">
        <div class="flex">
          <div
            class="detail-color-bar"
            :style="{ background: programColor }"
          ></div>
          <div class="detail-header-info">
            <h3>{{ program.meta.name }}</h3>
            <p v-if="program.meta.description" class="detail-description">
              {{ program.meta.description }}
            </p>
          </div>
        </div>
        <div class="detail-header-actions">
          <BaseButton
            color="grey-8"
            outline
            icon="edit"
            label="Edit"
            @click="$emit('edit', program)"
          />
          <BaseButton
            color="negative"
            outline
            icon="delete"
            label="Delete"
            @click="$emit('delete', program)"
          />
        </div>
      </div>
    </div>

    <div class="detail-section">
      <q-splitter v-model="splitterValue">
        <template v-slot:before>
          <q-tabs v-model="activeTab" class="detail-tabs" vertical no-caps>
            <q-tab name="activities">
              <template #default>
                <div
                  class="row justify-start items-center q-gutter-x-md q-pa-sm"
                >
                  <Icon name="ListChecks" :size="20" />
                  <span class="tab-title">Activities</span>
                </div>
              </template>
            </q-tab>
            <q-tab name="staff-groups">
              <template #default>
                <div
                  class="row justify-start items-center q-gutter-x-md q-pa-sm"
                >
                  <Icon name="UsersRound" :size="20" />
                  <span class="tab-title">Staff Groups</span>
                </div>
              </template>
            </q-tab>
            <q-tab name="locations">
              <template #default>
                <div
                  class="row justify-start items-center q-gutter-x-md q-pa-sm"
                >
                  <Icon name="Home" :size="20" />
                  <span class="tab-title">Locations</span>
                </div>
              </template>
            </q-tab>
          </q-tabs>
        </template>

        <template v-slot:after>
          <q-tab-panels
            v-model="activeTab"
            animated
            vertical
            :style="{ borderRadius: '8px' }"
          >
            <q-tab-panel name="activities">
              <ProgramActivitiesSection
                :activities="programActivities"
                @add-activity="$emit('add-activity', program)"
                @remove-activity="confirmRemoveActivity"
                @view-activity="viewActivity"
              />
            </q-tab-panel>
            <q-tab-panel name="staff-groups">
              <ProgramStaffGroupsSection
                :staff-groups="programStaffGroups"
                @add-staff-group="$emit('add-staff-group', program)"
                @remove-staff-group="confirmRemoveStaffGroup"
              />
            </q-tab-panel>
            <q-tab-panel name="locations">
              <ProgramLocationsSection
                :locations="programLocations"
                @add-location="$emit('add-location', program)"
                @remove-location="confirmRemoveLocation"
              />
            </q-tab-panel>
          </q-tab-panels>
        </template>
      </q-splitter>
    </div>
    <ActivityFormModal
      v-if="showActivityModal"
      :activity-id="editingActivity?.meta.id || undefined"
      :program-id="program.meta.id || ''"
      @close="closeActivityModal"
    />

    <ActivityDetailModal
      v-if="!!selectedActivity?.meta.id"
      :activity="selectedActivity"
      @close="selectedActivity = null"
      @edit="editActivity"
    />

    <ConfirmModal
      v-if="showDeleteConfirm"
      :title="deleteConfirmTitle"
      :message="deleteConfirmMessage"
      confirm-text="Delete"
      danger-mode
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
// Types
import type {
  Activity,
  Group,
  Location,
  Program,
  ProgramUpdateRequest,
} from "@/generated/api";
// Stores
import {
  useActivitiesStore,
  useColorsStore,
  useGroupsStore,
  useLocationsStore,
  useProgramsStore,
} from "@/stores";
// Components
import ProgramActivitiesSection from "./sections/ProgramActivitiesSection.vue";
import ProgramStaffGroupsSection from "./sections/ProgramStaffGroupsSection.vue";
import ProgramLocationsSection from "./sections/ProgramLocationsSection.vue";
import ConfirmModal from "./ConfirmModal.vue";
import ActivityFormModal from "./modals/ActivityFormModal.vue";
import ActivityDetailModal from "./modals/ActivityDetailModal.vue";
import Icon from "./Icon.vue";
// Composables
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "ProgramDetails",
  components: {
    ProgramActivitiesSection,
    ProgramStaffGroupsSection,
    ProgramLocationsSection,
    ConfirmModal,
    ActivityFormModal,
    ActivityDetailModal,
    Icon,
  },
  props: {
    program: {
      type: Object as PropType<Program>,
      required: true,
    },
  },
  emits: [
    "close",
    "edit",
    "delete",
    "add-activity",
    "add-staff-group",
    "add-location",
  ],
  setup() {
    const colorsStore = useColorsStore();
    const activitiesStore = useActivitiesStore();
    const groupsStore = useGroupsStore();
    const locationsStore = useLocationsStore();
    const programsStore = useProgramsStore();
    const toast = useToast();
    return {
      colorsStore,
      activitiesStore,
      groupsStore,
      locationsStore,
      programsStore,
      toast,
    };
  },
  data() {
    return {
      deleteTarget: null as {
        type: "program" | "activity" | "staffGroup" | "location";
        id: string;
      } | null,
      showDeleteConfirm: false,
      showActivityModal: false,
      editingActivity: null as Activity | null,
      selectedActivity: null as Activity | null,
      activeTab: "activities" as "activities" | "staff-groups" | "locations",
      splitterValue: 20,
    };
  },
  computed: {
    programColor(): string {
      if (this.program.spec.colorId) {
        const color = this.colorsStore.getColorById(this.program.spec.colorId);
        return color?.spec.hexValue || "#6366F1";
      }
      return "#6366F1";
    },
    programActivities(): Activity[] {
      return (
        this.program.spec.activityIds
          ?.map((id: string) => this.activitiesStore.getActivityById(id))
          .filter((activity: Activity | undefined) => activity !== undefined) ||
        []
      );
    },
    programStaffGroups(): Group[] {
      return (
        this.program.spec.staffGroupIds
          ?.map((id: string) => this.groupsStore.getGroupById(id))
          .filter((group: Group | undefined) => group !== undefined) || []
      );
    },
    programLocations(): Location[] {
      return (
        this.program.spec.locationIds
          ?.map((id: string) => this.locationsStore.getLocationById(id))
          .filter((location: Location | undefined) => location !== undefined) ||
        []
      );
    },
    deleteConfirmTitle() {
      if (!this.deleteTarget) return "";
      switch (this.deleteTarget.type) {
        case "program":
          return "Delete Program?";
        case "activity":
          return "Delete Activity?";
        case "staffGroup":
          return "Remove Staff Group?";
        case "location":
          return "Remove Location?";
        default:
          return "";
      }
    },
    deleteConfirmMessage() {
      if (!this.deleteTarget) return "";
      if (this.deleteTarget.type === "activity") {
        const activity = this.activitiesStore.getActivityById(
          this.deleteTarget.id,
        );
        return `Are you sure you want to delete the activity "${activity?.meta.name}"?</br>
         Deleting an activity will delete all the events that were created from it.</br>
         This action cannot be undone.`;
      } else if (this.deleteTarget.type === "staffGroup") {
        const group = this.groupsStore.getGroupById(this.deleteTarget.id);
        return `Are you sure you want to remove "${group?.meta.name}" from this program?`;
      } else if (this.deleteTarget.type === "location") {
        const location = this.locationsStore.getLocationById(
          this.deleteTarget.id,
        );
        return `Are you sure you want to remove "${location?.meta.name}" from this program?`;
      }
      return "";
    },
  },
  methods: {
    viewActivity(activity: Activity): void {
      this.selectedActivity = activity;
    },
    closeActivityModal(): void {
      this.showActivityModal = false;
      this.editingActivity = null;
    },
    editActivity(activity: Activity): void {
      this.editingActivity = activity;
      this.showActivityModal = true;
      this.selectedActivity = activity;
    },
    confirmRemoveStaffGroup(groupId: string): void {
      this.deleteTarget = { type: "staffGroup", id: groupId };
      this.showDeleteConfirm = true;
    },
    confirmRemoveLocation(locationId: string): void {
      this.deleteTarget = { type: "location", id: locationId };
      this.showDeleteConfirm = true;
    },
    confirmRemoveActivity(activityId: string): void {
      this.deleteTarget = { type: "activity", id: activityId };
      this.showDeleteConfirm = true;
    },
    async confirmDelete(): Promise<void> {
      if (!this.deleteTarget) return;

      try {
        if (this.deleteTarget.type === "activity") {
          await this.activitiesStore.deleteActivity(this.deleteTarget.id);
          this.toast.success("Activity deleted successfully");
        } else if (this.deleteTarget.type === "staffGroup") {
          await this.removeStaffGroupFromProgram(this.deleteTarget.id);
          this.toast.success("Staff group removed from program");
        } else if (this.deleteTarget.type === "location") {
          await this.removeLocationFromProgram(this.deleteTarget.id);
        }
      } catch (error: any) {
        this.toast.error(error.message || "Failed to delete");
      } finally {
        this.cancelDelete();
      }
    },
    cancelDelete(): void {
      this.showDeleteConfirm = false;
      this.deleteTarget = null;
    },
    async removeStaffGroupFromProgram(groupId: string): Promise<void> {
      if (!this.program) return;

      const updatedProgram: ProgramUpdateRequest = {
        meta: this.program.meta,
        spec: {
          ...this.program.spec,
          staffGroupIds: this.program.spec.staffGroupIds?.filter(
            (id: string) => id !== groupId,
          ),
        },
      };

      try {
        await this.programsStore.updateProgram(
          this.program.meta.id,
          updatedProgram,
        );
        this.toast.success("Staff group removed from program");
      } catch (error: any) {
        this.toast.error(error.message || "Failed to remove staff group");
      }
    },
    async removeLocationFromProgram(locationId: string): Promise<void> {
      if (!this.program) return;

      const updatedProgram: ProgramUpdateRequest = {
        meta: this.program.meta,
        spec: {
          ...this.program.spec,
          locationIds: this.program.spec.locationIds?.filter(
            (id: string) => id !== locationId,
          ),
        },
      };

      try {
        await this.programsStore.updateProgram(
          this.program.meta.id,
          updatedProgram,
        );
        this.toast.success("Location removed from program");
      } catch (error: any) {
        this.toast.error(error.message || "Failed to remove location");
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.program-detail {
  animation: fadeIn 0.3s ease;
}

.q-tabs--vertical .q-tab {
  justify-content: flex-start;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-header {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: var(--shadow);
}

.detail-header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
}

.detail-color-bar {
  width: 6px;
  border-radius: 3px;
  align-self: stretch;
  margin-right: 1.5rem;
}

.detail-header-info h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
}

.detail-description {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.detail-header-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* Detail Sections */
.detail-section {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding-top: 0;
  box-shadow: var(--shadow);
}

@media (max-width: 768px) {
  .programs-grid {
    grid-template-columns: 1fr;
  }

  .detail-header {
    padding: 1.5rem;
  }

  .detail-header-content {
    gap: 1rem;
  }

  .detail-header-actions {
    flex-direction: column;
  }

  .detail-header-actions .btn {
    width: 100%;
  }
}
</style>
