import type { Role } from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export const rolesService = {
  getRoles,
};

async function getRoles(): Promise<Role[]> {
  return storageService.getAll<Role>(STORAGE_KEYS.ROLES);
}
