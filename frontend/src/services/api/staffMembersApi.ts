/**
 * Backend API implementation for Staff Members
 */
import * as sdk from '@/generated/api/sdk.gen';
import type {
  StaffMember,
  StaffMemberCreationRequest,
  StaffMemberUpdateRequest,
} from '@/generated/api';
import { apiClient } from '@/config/api';

export const staffMembersApi = {
  listStaffMembers,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  getStaffMemberById,
  getStaffMembersByCertification,
};

async function listStaffMembers(): Promise<StaffMember[]> {
  const response = await sdk.listStaffMembers({ client: apiClient });
  
  if (response.error) {
    throw new Error('Failed to fetch staff members');
  }
  
  return response.data?.items || [];
}

async function createStaffMember(
  member: StaffMemberCreationRequest,
): Promise<StaffMember> {
  const response = await sdk.createStaffMember({
    client: apiClient,
    body: member,
  });
  
  if (response.error || !response.data) {
    throw new Error('Failed to create staff member');
  }
  
  return response.data;
}

async function updateStaffMember(
  id: string,
  member: StaffMemberUpdateRequest,
): Promise<StaffMember> {
  const response = await sdk.updateStaffMemberById({
    client: apiClient,
    path: { id },
    body: member,
  });
  
  if (response.error || !response.data) {
    throw new Error('Failed to update staff member');
  }
  
  return response.data;
}

async function deleteStaffMember(id: string): Promise<void> {
  const response = await sdk.deleteStaffMemberById({
    client: apiClient,
    path: { id },
  });
  
  if (response.error) {
    throw new Error('Failed to delete staff member');
  }
}

async function getStaffMemberById(id: string): Promise<StaffMember | null> {
  const response = await sdk.getStaffMemberById({
    client: apiClient,
    path: { id },
  });
  
  if (response.error) {
    return null;
  }
  
  return response.data || null;
}

async function getStaffMembersByCertification(
  certificationId: string,
): Promise<StaffMember[]> {
  // Backend doesn't have this specific filter, so fetch all and filter client-side
  const staffMembers = await listStaffMembers();
  return staffMembers.filter((s) =>
    s.spec.certificationIds?.includes(certificationId),
  );
}

