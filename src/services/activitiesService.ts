/**
 * Activities Service
 * Handles all activity-related operations
 */

import type { Activity, Program } from '@/types';
import { storageService } from './storage';
import { STORAGE_KEYS } from './storageKeys';

class ActivitiesService {
  /**
   * Get all activities
   */
  async getActivities(): Promise<Activity[]> {
    return storageService.getAll<Activity>(STORAGE_KEYS.ACTIVITIES);
  }

  /**
   * Get an activity by ID
   */
  async getActivity(id: string): Promise<Activity | null> {
    return storageService.getById<Activity>(STORAGE_KEYS.ACTIVITIES, id);
  }

  /**
   * Save an activity (create or update)
   */
  async saveActivity(activity: Activity): Promise<Activity> {
    const updatedActivity = { ...activity, updatedAt: new Date().toISOString() };
    return storageService.save<Activity>(STORAGE_KEYS.ACTIVITIES, updatedActivity);
  }

  /**
   * Delete an activity and clean up references
   */
  async deleteActivity(id: string): Promise<void> {
    const activity = await this.getActivity(id);
    
    if (activity) {
      // Remove from all programs' activityIds
      const programs = await storageService.getAll<Program>(STORAGE_KEYS.PROGRAMS);
      
      for (const program of programs) {
        if (program.activityIds.includes(id)) {
          const updatedProgram = {
            ...program,
            activityIds: program.activityIds.filter(aid => aid !== id)
          };
          await storageService.save(STORAGE_KEYS.PROGRAMS, updatedProgram);
        }
      }
    }
    
    // Delete the activity
    await storageService.delete(STORAGE_KEYS.ACTIVITIES, id);
  }

  /**
   * Get activities in a specific program
   */
  async getActivitiesInProgram(programId: string): Promise<Activity[]> {
    const activities = await this.getActivities();
    return activities.filter(a => a.programIds.includes(programId));
  }

  /**
   * Add an activity to a program
   */
  async addActivityToProgram(activityId: string, programId: string): Promise<void> {
    const activity = await this.getActivity(activityId);
    const program = await storageService.getById<Program>(STORAGE_KEYS.PROGRAMS, programId);
    
    if (!activity || !program) {
      throw new Error('Activity or Program not found');
    }

    if (activity.programIds.includes(programId)) {
      throw new Error('Activity is already in this program');
    }

    // Update activity
    activity.programIds.push(programId);
    await this.saveActivity(activity);

    // Update program
    if (!program.activityIds.includes(activityId)) {
      program.activityIds.push(activityId);
      await storageService.save(STORAGE_KEYS.PROGRAMS, program);
    }
  }

  /**
   * Remove an activity from a program
   */
  async removeActivityFromProgram(activityId: string, programId: string): Promise<void> {
    const activity = await this.getActivity(activityId);
    const program = await storageService.getById<Program>(STORAGE_KEYS.PROGRAMS, programId);
    
    if (!activity || !program) {
      throw new Error('Activity or Program not found');
    }

    // Update activity
    activity.programIds = activity.programIds.filter(id => id !== programId);
    await this.saveActivity(activity);

    // Update program
    program.activityIds = program.activityIds.filter(id => id !== activityId);
    await storageService.save(STORAGE_KEYS.PROGRAMS, program);
  }
}

export const activitiesService = new ActivitiesService();

