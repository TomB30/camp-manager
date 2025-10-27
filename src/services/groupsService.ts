import type { Group, GroupCreationRequest, GroupUpdateRequest } from "@/types";
import { storageService } from "./storage";
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
  group: GroupUpdateRequest
): Promise<Group> {
  const existingGroup = await storageService.getById<Group>(
    STORAGE_KEYS.GROUPS,
    id
  );
  if (!existingGroup) {
    throw new Error(`Group with id ${id} not found`);
  }
  const updatedGroup = {
    ...existingGroup,
    ...group,
    meta: {
      ...existingGroup.meta,
      name: group.meta.name,
      description: group.meta.description,
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
