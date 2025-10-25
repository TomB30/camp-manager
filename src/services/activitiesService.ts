import type {
  Activity,
  ActivityCreationRequest,
  ActivityUpdateRequest,
  Program,
} from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export const activitiesService = {
  listActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityById,
  getActivitiesInProgram,
  addActivityToProgram,
  removeActivityFromProgram,
};

async function listActivities(): Promise<Activity[]> {
  return storageService.getAll<Activity>(STORAGE_KEYS.ACTIVITIES);
}

async function createActivity(
  activity: ActivityCreationRequest,
): Promise<Activity> {
  const newActivity = {
    ...activity,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return storageService.save<Activity>(STORAGE_KEYS.ACTIVITIES, newActivity);
}

async function updateActivity(
  id: string,
  activity: ActivityUpdateRequest,
): Promise<Activity> {
  const existingActivity = await storageService.getById<Activity>(
    STORAGE_KEYS.ACTIVITIES,
    id,
  );
  if (!existingActivity) {
    throw new Error(`Activity with id ${id} not found`);
  }
  const updatedActivity = {
    ...existingActivity,
    ...activity,
    updatedAt: new Date().toISOString(),
  };
  return storageService.save<Activity>(
    STORAGE_KEYS.ACTIVITIES,
    updatedActivity,
  );
}

async function deleteActivity(id: string): Promise<void> {
  const activity = await getActivityById(id);

  if (activity) {
    // Remove from all programs' activityIds
    const programs = await storageService.getAll<Program>(
      STORAGE_KEYS.PROGRAMS,
    );

    for (const program of programs) {
      if (program.activityIds && program.activityIds.includes(id)) {
        const updatedProgram = {
          ...program,
          activityIds: program.activityIds?.filter((aid) => aid !== id) || [],
        };
        await storageService.save(STORAGE_KEYS.PROGRAMS, updatedProgram);
      }
    }
  }

  return storageService.delete(STORAGE_KEYS.ACTIVITIES, id);
}

async function getActivityById(id: string): Promise<Activity | null> {
  return storageService.getById<Activity>(STORAGE_KEYS.ACTIVITIES, id);
}

async function getActivitiesInProgram(programId: string): Promise<Activity[]> {
  const activities = await listActivities();
  return activities.filter((a) => a.programIds.includes(programId));
}

async function addActivityToProgram(
  activityId: string,
  programId: string,
): Promise<void> {
  const activity = await getActivityById(activityId);
  const program = await storageService.getById<Program>(
    STORAGE_KEYS.PROGRAMS,
    programId,
  );

  if (!activity || !program) {
    throw new Error("Activity or Program not found");
  }

  if (activity.programIds.includes(programId)) {
    throw new Error("Activity is already in this program");
  }

  // Update activity
  const updatedActivity = {
    ...activity,
    programIds: [...activity.programIds, programId],
    updatedAt: new Date().toISOString(),
  };
  await storageService.save(STORAGE_KEYS.ACTIVITIES, updatedActivity);

  // Update program
  if (!program.activityIds || !program.activityIds.includes(activityId)) {
    program.activityIds = program.activityIds
      ? [...program.activityIds, activityId]
      : [activityId];
    await storageService.save(STORAGE_KEYS.PROGRAMS, program);
  }
}

async function removeActivityFromProgram(
  activityId: string,
  programId: string,
): Promise<void> {
  const activity = await getActivityById(activityId);
  const program = await storageService.getById<Program>(
    STORAGE_KEYS.PROGRAMS,
    programId,
  );

  if (!activity || !program) {
    throw new Error("Activity or Program not found");
  }

  // Update activity
  const updatedActivity = {
    ...activity,
    programIds: activity.programIds?.filter((id) => id !== programId) || [],
    updatedAt: new Date().toISOString(),
  };
  await storageService.save(STORAGE_KEYS.ACTIVITIES, updatedActivity);

  // Update program
  program.activityIds =
    program.activityIds?.filter((id) => id !== activityId) || [];
  await storageService.save(STORAGE_KEYS.PROGRAMS, program);
}
