import type {
  Program,
  ProgramCreationRequest,
  ProgramUpdateRequest,
  Activity,
} from "@/generated/api";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export const programsService = {
  listPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramById,
  getProgramsForStaffMember,
  getProgramsForLocation,
};

async function listPrograms(): Promise<Program[]> {
  return storageService.getAll<Program>(STORAGE_KEYS.PROGRAMS);
}

async function createProgram(
  program: ProgramCreationRequest,
): Promise<Program> {
  const newProgram = {
    ...program,
    meta: {
      id: crypto.randomUUID(),
      name: program.meta.name,
      description: program.meta.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<Program>(STORAGE_KEYS.PROGRAMS, newProgram);
}

async function updateProgram(
  id: string,
  program: ProgramUpdateRequest,
): Promise<Program> {
  const existingProgram = await storageService.getById<Program>(
    STORAGE_KEYS.PROGRAMS,
    id,
  );
  if (!existingProgram) {
    throw new Error(`Program with id ${id} not found`);
  }
  const updatedProgram = {
    ...existingProgram,
    ...program,
    meta: {
      ...existingProgram.meta,
      name: program.meta.name,
      description: program.meta.description,
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<Program>(STORAGE_KEYS.PROGRAMS, updatedProgram);
}

async function deleteProgram(id: string): Promise<void> {
  // Remove program ID from all activities' programIds arrays
  const activities = await storageService.getAll<Activity>(
    STORAGE_KEYS.ACTIVITIES,
  );

  const updatedActivities: Activity[] = [];
  const activitiesToDelete: Activity[] = [];

  // Categorize activities in a single pass
  for (const activity of activities) {
    if (activity.spec.programIds.includes(id)) {
      if (activity.spec.programIds.length === 1) {
        // Activity only belongs to this program - delete it
        activitiesToDelete.push(activity);
      } else {
        // Activity belongs to other programs - update it
        updatedActivities.push({
          ...activity,
          spec: {
            ...activity.spec,
            programIds: activity.spec.programIds.filter((pid) => pid !== id),
          },
        });
      }
    }
  }

  // Parallelize all save, delete, and program deletion operations
  await Promise.all([
    // Save updated activities in parallel
    ...updatedActivities.map((activity) =>
      storageService.save(STORAGE_KEYS.ACTIVITIES, activity),
    ),
    // Delete activities with no remaining programs in parallel
    ...activitiesToDelete.map((activity) =>
      storageService.delete(STORAGE_KEYS.ACTIVITIES, activity.meta.id),
    ),
    // Delete the program
    storageService.delete(STORAGE_KEYS.PROGRAMS, id),
  ]);
}

async function getProgramById(id: string): Promise<Program | null> {
  return storageService.getById<Program>(STORAGE_KEYS.PROGRAMS, id);
}

async function getProgramsForStaffMember(staffId: string): Promise<Program[]> {
  const programs = await listPrograms();
  return programs.filter(
    (p) => p.spec.staffMemberIds?.includes(staffId) || false,
  );
}

async function getProgramsForLocation(locationId: string): Promise<Program[]> {
  const programs = await listPrograms();
  return programs.filter(
    (p) => p.spec.locationIds?.includes(locationId) || false,
  );
}
