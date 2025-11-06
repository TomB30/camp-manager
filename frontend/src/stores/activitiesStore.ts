import { defineStore } from "pinia";
import type {
  Activity,
  ActivityCreationRequest,
  ActivityUpdateRequest,
  Program,
} from "@/generated/api";
import { activitiesService } from "@/services";
import { useProgramsStore } from "./programsStore";

export const useActivitiesStore = defineStore("activities", {
  state: () => ({
    activities: [] as Activity[],
    loading: false,
  }),

  getters: {
    getActivityById(state): (id: string) => Activity | undefined {
      return (id: string): Activity | undefined => {
        return state.activities.find((a) => a.meta.id === id);
      };
    },

    getActivitiesInProgram(state): (programId: string) => Activity[] {
      return (programId: string): Activity[] => {
        return state.activities.filter((a) =>
          a.spec.programId === programId,
        );
      };
    },
  },

  actions: {
    async loadActivities(): Promise<void> {
      this.loading = true;
      try {
        this.activities = await activitiesService.listActivities();
      } finally {
        this.loading = false;
      }
    },

    async addActivity(
      activityRequest: ActivityCreationRequest,
    ): Promise<Activity> {
      const activity = await activitiesService.createActivity(activityRequest);
      this.activities.push(activity);

      // Add activity ID to the parent program
      const programsStore = useProgramsStore();
      const programId = activity.spec.programId;
      const program = programsStore.programs.find(
        (p) => p.meta.id === programId,
      );
      if (program && !program.spec.activityIds?.includes(activity.meta.id)) {
        const updatedActivityIds = program.spec.activityIds
          ? [...program.spec.activityIds, activity.meta.id]
          : [activity.meta.id];
        await programsStore.updateProgram(program.meta.id, {
          meta: program.meta,
          spec: {
            ...program.spec,
            activityIds: updatedActivityIds,
          },
        });
      }

      return activity;
    },

    async updateActivity(
      id: string,
      activityUpdate: ActivityUpdateRequest,
    ): Promise<void> {
      const oldActivity = this.activities.find((a) => a.meta.id === id);

      const activity = await activitiesService.updateActivity(
        id,
        activityUpdate,
      );
      const index = this.activities.findIndex((a) => a.meta.id === id);
      if (index >= 0) {
        this.activities[index] = activity;
      }

      // Update program associations if they changed
      if (oldActivity) {
        const oldProgramId = oldActivity.spec.programId;
        const newProgramId = activity.spec.programId;

        const programsStore = useProgramsStore();

        // Remove from old program if changed
        if (oldProgramId !== newProgramId) {
          const oldProgram = programsStore.programs.find(
            (p) => p.meta.id === oldProgramId,
          );
          if (oldProgram) {
            const updatedActivityIds = oldProgram.spec.activityIds?.filter(
              (aid) => aid !== activity.meta.id,
            );
            await programsStore.updateProgram(oldProgram.meta.id, {
              meta: oldProgram.meta,
              spec: {
                ...oldProgram.spec,
                activityIds: updatedActivityIds,
              },
            });
          }

          // Add to new program
          const newProgram = programsStore.programs.find(
            (p) => p.meta.id === newProgramId,
          );
          if (
            newProgram &&
            !newProgram.spec.activityIds?.includes(activity.meta.id)
          ) {
            const updatedActivityIds = newProgram.spec.activityIds
              ? [...newProgram.spec.activityIds, activity.meta.id]
              : [activity.meta.id];
            await programsStore.updateProgram(newProgram.meta.id, {
              meta: newProgram.meta,
              spec: {
                ...newProgram.spec,
                activityIds: updatedActivityIds,
              },
            });
          }
        }
      }
    },

    async deleteActivity(id: string): Promise<void> {
      const activity = this.activities.find((a) => a.meta.id === id);
      if (!activity) return;
      // Remove from the program's activityIds
      const programsStore = useProgramsStore();
      const programId = activity.spec.programId;
      const program = programsStore.programs.find(
        (p) => p.meta.id === programId,
      );
      if (program) {
        await programsStore.updateProgram(program.meta.id, {
          meta: program.meta,
          spec: {
            ...program.spec,
            activityIds: program.spec.activityIds?.filter(
              (aid) => aid !== id,
            ),
          },
        });
      }
      await activitiesService.deleteActivity(id);
      this.activities = this.activities.filter((a) => a.meta.id !== id);
    },

  },
});
