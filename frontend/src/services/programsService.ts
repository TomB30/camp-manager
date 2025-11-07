import type {
  Program,
  ProgramCreationRequest,
  ProgramUpdateRequest,
  Activity,
  Group,
} from "@/generated/api";
import { storageService } from "./storage";
import { getCurrentTenantId, getCurrentCampId } from "@/utils/tenantContext";
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
      tenantId: getCurrentTenantId(),
      campId: getCurrentCampId(),
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
      id: existingProgram.meta.id,
      tenantId: existingProgram.meta.tenantId,
      campId: existingProgram.meta.campId,
      name: program.meta.name,
      description: program.meta.description,
      createdAt: existingProgram.meta.createdAt,
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<Program>(STORAGE_KEYS.PROGRAMS, updatedProgram);
}

async function deleteProgram(id: string): Promise<void> {
  // Delete all activities that belong to this program
  const activities = await storageService.getAll<Activity>(
    STORAGE_KEYS.ACTIVITIES,
  );

  const activitiesToDelete: Activity[] = [];

  // Find all activities that belong to this program
  for (const activity of activities) {
    if (activity.spec.programId === id) {
      activitiesToDelete.push(activity);
    }
  }

  // Parallelize all delete and program deletion operations
  await Promise.all([
    // Delete activities that belong to this program
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
  const groupsOfStaff = await storageService.getAll<Group>(STORAGE_KEYS.GROUPS);
  return programs.filter(
    (p) =>
      p.spec.staffGroupIds?.some((groupId) =>
        groupsOfStaff
          .find((g) => g.meta.id === groupId)
          ?.spec.staffIds?.includes(staffId),
      ) || false,
  );
}

async function getProgramsForLocation(locationId: string): Promise<Program[]> {
  const programs = await listPrograms();
  return programs.filter(
    (p) => p.spec.locationIds?.includes(locationId) || false,
  );
}
