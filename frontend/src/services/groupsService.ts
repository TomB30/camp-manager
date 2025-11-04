import type {
  Group,
  GroupCreationRequest,
  GroupUpdateRequest,
} from "@/generated/api";
import { storageService } from "./storage";
import { getCurrentCampId, getCurrentTenantId } from "@/utils/tenantContext";
import { STORAGE_KEYS } from "./storageKeys";

export const groupsService = {
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupById,
};

async function listGroups(): Promise<Group[]> {
  return storageService.getAll<Group>(STORAGE_KEYS.GROUPS);
}

async function createGroup(group: GroupCreationRequest): Promise<Group> {
  const newGroup = {
    ...group,
    meta: {
      id: crypto.randomUUID(),
      tenantId: getCurrentTenantId(),
      campId: getCurrentCampId(),
      name: group.meta.name,
      description: group.meta.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<Group>(STORAGE_KEYS.GROUPS, newGroup);
}

async function updateGroup(
  id: string,
  group: GroupUpdateRequest,
): Promise<Group> {
  const existingGroup = await storageService.getById<Group>(
    STORAGE_KEYS.GROUPS,
    id,
  );
  if (!existingGroup) {
    throw new Error(`Group with id ${id} not found`);
  }
  const updatedGroup = {
    ...existingGroup,
    ...group,
    meta: {
      id: existingGroup.meta.id,
      tenantId: existingGroup.meta.tenantId,
      campId: existingGroup.meta.campId,
      name: group.meta.name,
      description: group.meta.description,
      createdAt: existingGroup.meta.createdAt,
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<Group>(STORAGE_KEYS.GROUPS, updatedGroup);
}

async function deleteGroup(id: string): Promise<void> {
  return storageService.delete(STORAGE_KEYS.GROUPS, id);
}

async function getGroupById(id: string): Promise<Group | null> {
  return storageService.getById<Group>(STORAGE_KEYS.GROUPS, id);
}
