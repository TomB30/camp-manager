import { defineStore } from "pinia";
import type {
  Program,
  ProgramCreationRequest,
  ProgramUpdateRequest,
  Group,
} from "@/generated/api";
import { programsService, STORAGE_KEYS, storageService } from "@/services";
import { useActivitiesStore } from "./activitiesStore";

export const useProgramsStore = defineStore("programs", {
  state: () => ({
    programs: [] as Program[],
    loading: false,
  }),

  getters: {
    getProgramById(state): (id: string) => Program | undefined {
      return (id: string): Program | undefined => {
        return state.programs.find((p) => p.meta.id === id);
      };
    },

    async getProgramsForStaffMember(
      state,
    ): Promise<(staffId: string) => Program[]> {
      const groups = await storageService.getAll<Group>(STORAGE_KEYS.GROUPS);
      return (staffId: string): Program[] => {
        return state.programs.filter(
          (p) =>
            p.spec.staffGroupIds?.some((groupId) =>
              groups
                .find((g) => g.meta.id === groupId)
                ?.spec.staffIds?.includes(staffId),
            ) || false,
        );
      };
    },

    getProgramsForLocation(state): (locationId: string) => Program[] {
      return (locationId: string): Program[] => {
        return state.programs.filter(
          (p) => p.spec.locationIds?.includes(locationId) || false,
        );
      };
    },
  },

  actions: {
    async loadPrograms(): Promise<void> {
      this.loading = true;
      try {
        this.programs = await programsService.listPrograms();
      } finally {
        this.loading = false;
      }
    },

    async createProgram(
      programRequest: ProgramCreationRequest,
    ): Promise<Program> {
      const program = await programsService.createProgram(programRequest);
      this.programs = this.programs ? [...this.programs, program] : [program];
      return program;
    },

    async updateProgram(
      id: string,
      programUpdate: ProgramUpdateRequest,
    ): Promise<void> {
      const program = await programsService.updateProgram(id, programUpdate);
      const index = this.programs.findIndex((p: Program) => p.meta.id === id);
      if (index >= 0) {
        this.programs[index] = program;
      }
    },

    async deleteProgram(id: string): Promise<void> {
      // The programsService handles all cleanup logic
      await programsService.deleteProgram(id);

      // Update state - activities may have been deleted
      const activitiesStore = useActivitiesStore();
      await activitiesStore.loadActivities();

      this.programs =
        this.programs?.filter((p: Program) => p.meta.id !== id) || [];
    },
  },
});
