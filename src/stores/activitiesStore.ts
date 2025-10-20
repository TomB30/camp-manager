import { defineStore } from "pinia";
import type { Activity } from "@/types";
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
        return state.activities.find((a) => a.id === id);
      };
    },

    getActivitiesInProgram(state): (programId: string) => Activity[] {
      return (programId: string): Activity[] => {
        return state.activities.filter((a) => a.programIds.includes(programId));
      };
    },
  },

  actions: {
    async loadActivities(): Promise<void> {
      this.loading = true;
      try {
        this.activities = await activitiesService.getActivities();
      } finally {
        this.loading = false;
      }
    },

    async addActivity(activity: Activity): Promise<void> {
      await activitiesService.saveActivity(activity);
      this.activities.push(activity);

      // Add activity ID to all parent programs
      const programsStore = useProgramsStore();
      for (const programId of activity.programIds) {
        const program = programsStore.programs.find((p) => p.id === programId);
        if (program && !program.activityIds?.includes(activity.id)) {
          program.activityIds = program.activityIds
            ? [...program.activityIds, activity.id]
            : [activity.id];
          await programsStore.updateProgram(program);
        }
      }
    },

    async updateActivity(activity: Activity): Promise<void> {
      const oldActivity = this.activities.find((a) => a.id === activity.id);

      await activitiesService.saveActivity(activity);
      const index = this.activities.findIndex((a) => a.id === activity.id);
      if (index >= 0) {
        this.activities[index] = activity;
      }

      // Update program associations if they changed
      if (oldActivity) {
        const oldProgramIds = new Set(oldActivity.programIds);
        const newProgramIds = new Set(activity.programIds);

        const programsStore = useProgramsStore();

        // Remove from programs that are no longer associated
        for (const programId of oldProgramIds) {
          if (!newProgramIds.has(programId)) {
            const program = programsStore.programs.find(
              (p) => p.id === programId,
            );
            if (program) {
              program.activityIds = program.activityIds?.filter(
                (aid) => aid !== activity.id,
              );
              await programsStore.updateProgram(program);
            }
          }
        }

        // Add to new programs
        for (const programId of newProgramIds) {
          if (!oldProgramIds.has(programId)) {
            const program = programsStore.programs.find(
              (p) => p.id === programId,
            );
            if (program && !program.activityIds?.includes(activity.id)) {
              program.activityIds = program.activityIds
                ? [...program.activityIds, activity.id]
                : [activity.id];
              await programsStore.updateProgram(program);
            }
          }
        }
      }
    },

    async deleteActivity(id: string): Promise<void> {
      const activity = this.activities.find((a) => a.id === id);
      if (activity) {
        // Remove from all programs' activityIds
        const programsStore = useProgramsStore();
        for (const programId of activity.programIds) {
          const program = programsStore.programs.find(
            (p) => p.id === programId,
          );
          if (program) {
            program.activityIds = program.activityIds?.filter(
              (aid) => aid !== id,
            );
            await programsStore.updateProgram(program);
          }
        }
      }

      await activitiesService.deleteActivity(id);
      this.activities = this.activities.filter((a) => a.id !== id);
    },

    async addActivityToProgram(
      activityId: string,
      programId: string,
    ): Promise<void> {
      await activitiesService.addActivityToProgram(activityId, programId);

      // Update state
      const activity = this.activities.find((a) => a.id === activityId);
      const programsStore = useProgramsStore();
      const program = programsStore.programs.find((p) => p.id === programId);

      if (activity && !activity.programIds.includes(programId)) {
        activity.programIds = activity.programIds
          ? [...activity.programIds, programId]
          : [programId];
      }

      if (program && !program.activityIds?.includes(activityId)) {
        program.activityIds = program.activityIds
          ? [...program.activityIds, activityId]
          : [activityId];
      }
    },

    async removeActivityFromProgram(
      activityId: string,
      programId: string,
    ): Promise<void> {
      await activitiesService.removeActivityFromProgram(activityId, programId);

      // Update state
      const activity = this.activities.find((a) => a.id === activityId);
      const programsStore = useProgramsStore();
      const program = programsStore.programs.find((p) => p.id === programId);

      if (activity) {
        activity.programIds = activity.programIds?.filter(
          (id) => id !== programId,
        );
      }

      if (program) {
        program.activityIds = program.activityIds?.filter(
          (id) => id !== activityId,
        );
      }
    },
  },
});
