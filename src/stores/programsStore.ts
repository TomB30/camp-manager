import { defineStore } from "pinia";
import type { Program, StaffMember } from "@/types";
import { programsService } from "@/services";
import { useActivitiesStore } from "./activitiesStore";
import { useStaffMembersStore } from "./staffMembersStore";

export const useProgramsStore = defineStore("programs", {
  state: () => ({
    programs: [] as Program[],
    loading: false,
  }),

  getters: {
    getProgramById(state): (id: string) => Program | undefined {
      return (id: string): Program | undefined => {
        return state.programs.find((p) => p.id === id);
      };
    },

    getProgramsForStaffMember(state): (staffId: string) => Program[] {
      return (staffId: string): Program[] => {
        return state.programs.filter(
          (p) => p.staffMemberIds?.includes(staffId) || false,
        );
      };
    },

    getStaffMembersInProgram(): (programId: string) => StaffMember[] {
      return (programId: string): StaffMember[] => {
        const program = this.programs.find((p) => p.id === programId);
        if (!program) return [];

        const staffStore = useStaffMembersStore();
        return staffStore.staffMembers.filter(
          (s) => program.staffMemberIds?.includes(s.id) || false,
        );
      };
    },

    getProgramsForLocation(state): (locationId: string) => Program[] {
      return (locationId: string): Program[] => {
        return state.programs.filter(
          (p) => p.locationIds?.includes(locationId) || false,
        );
      };
    },
  },

  actions: {
    async loadPrograms(): Promise<void> {
      this.loading = true;
      try {
        this.programs = await programsService.getPrograms();
      } finally {
        this.loading = false;
      }
    },

    async addProgram(program: Program): Promise<void> {
      await programsService.saveProgram(program);
      this.programs = this.programs ? [...this.programs, program] : [program];
    },

    async updateProgram(program: Program): Promise<void> {
      await programsService.saveProgram(program);
      const index = this.programs.findIndex(
        (p: Program) => p.id === program.id,
      );
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

      this.programs = this.programs?.filter((p: Program) => p.id !== id) || [];
    },
  },
});
