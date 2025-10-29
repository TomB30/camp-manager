import { defineStore } from "pinia";
import type {
  Activity,
  ActivityCreationRequest,
  ActivityUpdateRequest,
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
          a.spec.programIds.includes(programId),
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

      // Add activity ID to all parent programs
      const programsStore = useProgramsStore();
      for (const programId of activity.spec.programIds) {
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
        const oldProgramIds = new Set(oldActivity.spec.programIds);
        const newProgramIds = new Set(activity.spec.programIds);

        const programsStore = useProgramsStore();

        // Remove from programs that are no longer associated
        for (const programId of oldProgramIds) {
          if (!newProgramIds.has(programId)) {
            const program = programsStore.programs.find(
              (p) => p.meta.id === programId,
            );
            if (program) {
              const updatedActivityIds = program.spec.activityIds?.filter(
                (aid) => aid !== activity.meta.id,
              );
              await programsStore.updateProgram(program.meta.id, {
                meta: program.meta,
                spec: {
                  ...program.spec,
                  activityIds: updatedActivityIds,
                },
              });
            }
          }
        }

        // Add to new programs
        for (const programId of newProgramIds) {
          if (!oldProgramIds.has(programId)) {
            const program = programsStore.programs.find(
              (p) => p.meta.id === programId,
            );
            if (
              program &&
              !program.spec.activityIds?.includes(activity.meta.id)
            ) {
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
          }
        }
      }
    },

    async deleteActivity(id: string): Promise<void> {
      const activity = this.activities.find((a) => a.meta.id === id);
      if (activity) {
        // Remove from all programs' activityIds
        const programsStore = useProgramsStore();
        for (const programId of activity.spec.programIds) {
          const program = programsStore.programs.find(
            (p) => p.meta.id === programId,
          );
          if (program) {
            const updatedActivityIds = program.spec.activityIds?.filter(
              (aid) => aid !== id,
            );
            await programsStore.updateProgram(program.meta.id, {
              meta: program.meta,
              spec: {
                ...program.spec,
                activityIds: updatedActivityIds,
              },
            });
          }
        }
      }

      await activitiesService.deleteActivity(id);
      this.activities = this.activities.filter((a) => a.meta.id !== id);
    },

    async addActivityToProgram(
      activityId: string,
      programId: string,
    ): Promise<void> {
      await activitiesService.addActivityToProgram(activityId, programId);

      // Update state
      const activity = this.activities.find((a) => a.meta.id === activityId);
      const programsStore = useProgramsStore();
      const program = programsStore.programs.find(
        (p) => p.meta.id === programId,
      );

      if (activity && !activity.spec.programIds.includes(programId)) {
        activity.spec.programIds = activity.spec.programIds
          ? [...activity.spec.programIds, programId]
          : [programId];
      }

      if (program && !program.spec.activityIds?.includes(activityId)) {
        program.spec.activityIds = program.spec.activityIds
          ? [...program.spec.activityIds, activityId]
          : [activityId];
      }
    },

    async removeActivityFromProgram(
      activityId: string,
      programId: string,
    ): Promise<void> {
      await activitiesService.removeActivityFromProgram(activityId, programId);

      // Update state
      const activity = this.activities.find((a) => a.meta.id === activityId);
      const programsStore = useProgramsStore();
      const program = programsStore.programs.find(
        (p) => p.meta.id === programId,
      );

      if (activity) {
        activity.spec.programIds = activity.spec.programIds?.filter(
          (id) => id !== programId,
        );
      }

      if (program) {
        program.spec.activityIds = program.spec.activityIds?.filter(
          (id) => id !== activityId,
        );
      }
    },
  },
});
