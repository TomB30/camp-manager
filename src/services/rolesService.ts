import type { Role, RoleCreationRequest, RoleUpdateRequest } from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export const rolesService = {
  listRoles,
  createRole,
  updateRole,
  deleteRole,
  getRoleById,
};

async function listRoles(): Promise<Role[]> {
  return storageService.getAll<Role>(STORAGE_KEYS.ROLES);
}

async function createRole(role: RoleCreationRequest): Promise<Role> {
  const newRole = {
    ...role,
    meta: {
      id: crypto.randomUUID(),
      name: role.meta.name,
      description: role.meta.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<Role>(STORAGE_KEYS.ROLES, newRole);
}

async function updateRole(id: string, role: RoleUpdateRequest): Promise<Role> {
  const existingRole = await storageService.getById<Role>(
    STORAGE_KEYS.ROLES,
    id,
  );
  if (!existingRole) {
    throw new Error(`Role with id ${id} not found`);
  }
  const updatedRole = {
    ...existingRole,
    ...role,
    meta: {
      ...existingRole.meta,
      name: role.meta.name,
      description: role.meta.description,
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<Role>(STORAGE_KEYS.ROLES, updatedRole);
}

async function deleteRole(id: string): Promise<void> {
  return storageService.delete(STORAGE_KEYS.ROLES, id);
}

async function getRoleById(id: string): Promise<Role | null> {
  return storageService.getById<Role>(STORAGE_KEYS.ROLES, id);
}
