import type {
  StaffMember,
  StaffMemberCreationRequest,
  StaffMemberUpdateRequest,
} from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export const staffMembersService = {
  listStaffMembers,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  getStaffMemberById,
  getStaffMembersByCertification,
  getStaffMembersByManager,
};

async function listStaffMembers(): Promise<StaffMember[]> {
  return storageService.getAll<StaffMember>(STORAGE_KEYS.STAFF_MEMBERS);
}

async function createStaffMember(
  member: StaffMemberCreationRequest,
): Promise<StaffMember> {
  const newStaffMember = {
    ...member,
    meta: {
      id: crypto.randomUUID(),
      name: member.meta.name,
      description: member.meta.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<StaffMember>(
    STORAGE_KEYS.STAFF_MEMBERS,
    newStaffMember,
  );
}

async function updateStaffMember(
  id: string,
  member: StaffMemberUpdateRequest,
): Promise<StaffMember> {
  const existingStaffMember = await storageService.getById<StaffMember>(
    STORAGE_KEYS.STAFF_MEMBERS,
    id,
  );
  if (!existingStaffMember) {
    throw new Error(`Staff member with id ${id} not found`);
  }
  const updatedStaffMember = {
    ...existingStaffMember,
    ...member,
    meta: {
      ...existingStaffMember.meta,
      name: member.meta.name,
      description: member.meta.description,
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<StaffMember>(
    STORAGE_KEYS.STAFF_MEMBERS,
    updatedStaffMember,
  );
}

async function deleteStaffMember(id: string): Promise<void> {
  // Delete the staff member
  await storageService.delete(STORAGE_KEYS.STAFF_MEMBERS, id);

  // Clean up: Remove from all events
  const events = await storageService.getAll(STORAGE_KEYS.EVENTS);
  const updatedEvents = events.map((event) => ({
    ...event,
    assignedStaffIds:
      event.spec.assignedStaffIds?.filter((staffId: string) => staffId !== id) || [],
  }));

  // Save all updated events
  for (const event of updatedEvents) {
    await storageService.save(STORAGE_KEYS.EVENTS, event);
  }
}

async function getStaffMemberById(id: string): Promise<StaffMember | null> {
  return storageService.getById<StaffMember>(STORAGE_KEYS.STAFF_MEMBERS, id);
}

async function getStaffMembersByCertification(
  certificationId: string,
): Promise<StaffMember[]> {
  const staffMembers = await listStaffMembers();
  return staffMembers.filter((s) =>
    s.spec.certificationIds?.includes(certificationId),
  );
}

async function getStaffMembersByManager(
  managerId: string,
): Promise<StaffMember[]> {
  const staffMembers = await listStaffMembers();
  return staffMembers.filter((s) => s.spec.managerId === managerId);
}
