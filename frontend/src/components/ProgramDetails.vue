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
            <h2>{{ program.meta.name }}</h2>
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
      <q-splitter v-model="splitterValue" style="height: 100%">
        <template v-slot:before>
          <q-tabs v-model="activeTab" class="detail-tabs" vertical no-caps>
            <q-tab name="activities">
              <template #default>
                <div
                  class="row justify-start items-center q-gutter-x-md q-pa-sm"
                >
                  <Icon name="ListChecks" :size="20" />
                  <span>Activities</span>
                </div>
              </template>
            </q-tab>
            <q-tab name="staff-groups">
              <template #default>
                <div
                  class="row justify-start items-center q-gutter-x-md q-pa-sm"
                >
                  <Icon name="UsersRound" :size="20" />
                  <span>Staff Groups</span>
                </div>
              </template>
            </q-tab>
            <q-tab name="locations">
              <template #default>
                <div
                  class="row justify-start items-center q-gutter-x-md q-pa-sm"
                >
                  <Icon name="Home" :size="20" />
                  <span>Locations</span>
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
              <div class="section-header">
                <h3>
                  <Icon name="ListChecks" :size="20" />
                  Activities
                </h3>
                <BaseButton
                  color="grey-8"
                  outline
                  icon="add"
                  label="Activity"
                  @click="$emit('add-activity', program)"
                />
              </div>

              <div v-if="programActivities.length > 0" class="activities-list">
                <ProgramActivityCard
                  v-for="activity in programActivities"
                  :key="activity.meta.id"
                  :activity="activity"
                  @remove="confirmRemoveActivity(activity.meta.id)"
                  @click="viewActivity(activity)"
                />
              </div>

              <div v-else class="empty-section">
                <p>
                  No activities yet. Add activities to create event templates.
                </p>
              </div>
            </q-tab-panel>
            <q-tab-panel name="staff-groups">
              <div class="section-header">
                <h3>
                  <Icon name="UsersRound" :size="20" />
                  Staff Groups
                </h3>
                <BaseButton
                  color="grey-8"
                  outline
                  icon="add"
                  label="Staff Group"
                  @click="$emit('add-staff-group', program)"
                />
              </div>

              <div v-if="programStaffGroups.length > 0" class="staff-list">
                <ProgramStaffGroupCard
                  v-for="group in programStaffGroups"
                  :key="group.meta.id"
                  :staff-group="group"
                  @remove="confirmRemoveStaffGroup(group.meta.id)"
                />
              </div>

              <div v-else class="empty-section">
                <p>
                  No staff groups assigned. Add staff groups to this program.
                </p>
              </div>
            </q-tab-panel>
            <q-tab-panel name="locations">
              <div class="section-header">
                <h3>
                  <Icon name="Home" :size="20" />
                  Locations
                </h3>
                <BaseButton
                  color="grey-8"
                  outline
                  icon="add"
                  label="Location"
                  @click="$emit('add-location', program)"
                />
              </div>

              <div v-if="programLocations.length > 0" class="locations-list">
                <ProgramLocationCard
                  v-for="location in programLocations"
                  :key="location.meta.id"
                  :location="location"
                  @remove="confirmRemoveLocation(location.meta.id)"
                />
              </div>

              <div v-else class="empty-section">
                <p>No locations assigned. Add locations to this program.</p>
              </div>
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
import ProgramActivityCard from "./cards/ProgramActivityCard.vue";
import ProgramStaffGroupCard from "./cards/ProgramStaffGroupCard.vue";
import ProgramLocationCard from "./cards/ProgramLocationCard.vue";
import ConfirmModal from "./ConfirmModal.vue";
import ActivityFormModal from "./modals/ActivityFormModal.vue";
import ActivityDetailModal from "./modals/ActivityDetailModal.vue";
import Icon from "./Icon.vue";
// Composables
import { useToast } from "@/composables/useToast";

export default defineComponent({
  name: "ProgramDetails",
  components: {
    ProgramActivityCard,
    ProgramStaffGroupCard,
    ProgramLocationCard,
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
  padding: 1.5rem;
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
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-light);
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

/* Activities List */
.activities-list {
  display: grid;
  gap: 1rem;
}

/* Staff List */
.staff-list {
  display: grid;
  gap: 1rem;
}

.staff-certifications {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.certification-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: white;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

/* Locations List */
.locations-list {
  display: grid;
  gap: 1rem;
}

.location-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--surface-secondary);
  color: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.location-meta {
  font-size: 0.875rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Empty States */
.empty-section {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-section p {
  margin: 0;
}

@media (max-width: 768px) {
  .programs-grid {
    grid-template-columns: 1fr;
  }

  .detail-header {
    padding: 1.5rem;
  }

  .detail-header-content {
    flex-direction: column;
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
