import type {
  Activity,
  ActivityCreationRequest,
  ActivityUpdateRequest,
  Program,
  Event,
} from "@/generated/api";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";
import { getTenantContext } from "@/utils/tenantContext";

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
  const { tenantId, campId } = getTenantContext();
  const newActivity = {
    meta: {
      id: crypto.randomUUID(),
      tenantId,
      campId,
      name: activity.meta.name,
      description: activity.meta.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: activity.spec,
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
    meta: {
      id: existingActivity.meta.id,
      tenantId: existingActivity.meta.tenantId,
      campId: existingActivity.meta.campId,
      name: activity.meta.name,
      description: activity.meta.description || "",
      createdAt: existingActivity.meta.createdAt,
      updatedAt: new Date().toISOString(),
    },
    spec: activity.spec,
  };
  return storageService.save<Activity>(
    STORAGE_KEYS.ACTIVITIES,
    updatedActivity,
  );
}

async function deleteActivity(id: string): Promise<void> {
  const activity = await getActivityById(id);
  if (!activity) return;
  // Remove from all programs' activityIds
  const programs = await storageService.getAll<Program>(STORAGE_KEYS.PROGRAMS);
  const updatedPrograms: Program[] = programs.map((p: Program) => {
    return {
      ...p,
      spec: {
        ...p.spec,
        activityIds: p.spec.activityIds?.filter((aid) => aid !== id) || [],
      },
    };
  });
  const programsPrm = storageService.saveBatch<Program>(
    STORAGE_KEYS.PROGRAMS,
    updatedPrograms,
  );

  //  Remove all the events for this activity
  const events = await storageService.getAll<Event>(STORAGE_KEYS.EVENTS);
  const updatedEvents: Event[] = events.filter(
    (e: Event) => e.spec.activityId !== id,
  );
  const eventsPrm = storageService.seed<Event>(
    STORAGE_KEYS.EVENTS,
    updatedEvents,
  );

  await Promise.all([
    programsPrm,
    eventsPrm,
    storageService.delete(STORAGE_KEYS.ACTIVITIES, id),
  ]);
}

async function getActivityById(id: string): Promise<Activity | null> {
  return storageService.getById<Activity>(STORAGE_KEYS.ACTIVITIES, id);
}

async function getActivitiesInProgram(programId: string): Promise<Activity[]> {
  const activities = await listActivities();
  return activities.filter((a) => a.spec.programIds.includes(programId));
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

  if (activity.spec.programIds.includes(programId)) {
    throw new Error("Activity is already in this program");
  }

  // Update activity
  const updatedActivity = {
    ...activity,
    spec: {
      ...activity.spec,
      programIds: [...activity.spec.programIds, programId],
    },
    updatedAt: new Date().toISOString(),
  };
  await storageService.save(STORAGE_KEYS.ACTIVITIES, updatedActivity);

  // Update program
  if (
    !program.spec.activityIds ||
    !program.spec.activityIds.includes(activityId)
  ) {
    program.spec.activityIds = program.spec.activityIds
      ? [...program.spec.activityIds, activityId]
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
    spec: {
      ...activity.spec,
      programIds:
        activity.spec.programIds?.filter((id) => id !== programId) || [],
      updatedAt: new Date().toISOString(),
    },
  };
  await storageService.save(STORAGE_KEYS.ACTIVITIES, updatedActivity);

  // Update program
  program.spec.activityIds =
    program.spec.activityIds?.filter((id) => id !== activityId) || [];
  await storageService.save(STORAGE_KEYS.PROGRAMS, program);
}
