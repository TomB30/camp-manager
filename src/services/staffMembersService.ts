/**
 * Staff Members Service
 * Handles all staff member-related operations
 */

import type { StaffMember } from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

class StaffMembersService {
  /**
   * Get all staff members
   */
  async getStaffMembers(): Promise<StaffMember[]> {
    return storageService.getAll<StaffMember>(STORAGE_KEYS.STAFF_MEMBERS);
  }

  /**
   * Get a staff member by ID
   */
  async getStaffMember(id: string): Promise<StaffMember | null> {
    return storageService.getById<StaffMember>(STORAGE_KEYS.STAFF_MEMBERS, id);
  }

  /**
   * Save a staff member (create or update)
   */
  async saveStaffMember(member: StaffMember): Promise<StaffMember> {
    return storageService.save<StaffMember>(STORAGE_KEYS.STAFF_MEMBERS, member);
  }

  /**
   * Delete a staff member and clean up references
   */
  async deleteStaffMember(id: string): Promise<void> {
    // Delete the staff member
    await storageService.delete(STORAGE_KEYS.STAFF_MEMBERS, id);

    // Clean up: Remove from all events
    const events = await storageService.getAll(STORAGE_KEYS.EVENTS);
    const updatedEvents = events.map((event) => ({
      ...event,
      assignedStaffIds:
        event.assignedStaffIds?.filter((staffId: string) => staffId !== id) ||
        [],
    }));

    // Save all updated events
    for (const event of updatedEvents) {
      await storageService.save(STORAGE_KEYS.EVENTS, event);
    }
  }

  /**
   * Get staff members by certification
   */
  async getStaffMembersByCertification(
    certificationId: string,
  ): Promise<StaffMember[]> {
    const staffMembers = await this.getStaffMembers();
    return staffMembers.filter((s) =>
      s.certificationIds?.includes(certificationId),
    );
  }

  /**
   * Get staff members by manager
   */
  async getStaffMembersByManager(managerId: string): Promise<StaffMember[]> {
    const staffMembers = await this.getStaffMembers();
    return staffMembers.filter((s) => s.managerId === managerId);
  }
}

export const staffMembersService = new StaffMembersService();
