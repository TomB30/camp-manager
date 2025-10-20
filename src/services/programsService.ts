/**
 * Programs Service
 * Handles all program-related operations
 */

import type { Program, Activity } from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

class ProgramsService {
  /**
   * Get all programs
   */
  async getPrograms(): Promise<Program[]> {
    return storageService.getAll<Program>(STORAGE_KEYS.PROGRAMS);
  }

  /**
   * Get a program by ID
   */
  async getProgram(id: string): Promise<Program | null> {
    return storageService.getById<Program>(STORAGE_KEYS.PROGRAMS, id);
  }

  /**
   * Save a program (create or update)
   */
  async saveProgram(program: Program): Promise<Program> {
    const updatedProgram = { ...program, updatedAt: new Date().toISOString() };
    return storageService.save<Program>(STORAGE_KEYS.PROGRAMS, updatedProgram);
  }

  /**
   * Delete a program and clean up references
   */
  async deleteProgram(id: string): Promise<void> {
    // Remove program ID from all activities' programIds arrays
    const activities = await storageService.getAll<Activity>(
      STORAGE_KEYS.ACTIVITIES,
    );
    const updatedActivities = activities
      .map((activity) => {
        if (activity.programIds.includes(id)) {
          return {
            ...activity,
            programIds: activity.programIds.filter((pid) => pid !== id),
          };
        }
        return activity;
      })
      .filter((activity) => activity.programIds.length > 0); // Remove activities with no programs

    // Save updated activities
    for (const activity of updatedActivities) {
      await storageService.save(STORAGE_KEYS.ACTIVITIES, activity);
    }

    // Delete activities that have no remaining programs
    const activitiesToDelete = activities.filter(
      (activity) =>
        activity.programIds.includes(id) && activity.programIds.length === 1,
    );

    for (const activity of activitiesToDelete) {
      await storageService.delete(STORAGE_KEYS.ACTIVITIES, activity.id);
    }

    // Delete the program
    await storageService.delete(STORAGE_KEYS.PROGRAMS, id);
  }

  /**
   * Get programs for a staff member
   */
  async getProgramsForStaffMember(staffId: string): Promise<Program[]> {
    const programs = await this.getPrograms();
    return programs.filter((p) => p.staffMemberIds?.includes(staffId) || false);
  }

  /**
   * Get programs for a location
   */
  async getProgramsForLocation(locationId: string): Promise<Program[]> {
    const programs = await this.getPrograms();
    return programs.filter((p) => p.locationIds?.includes(locationId) || false);
  }
}

export const programsService = new ProgramsService();
