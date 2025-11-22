/**
 * Backend API implementation for Time Blocks
 */
import * as sdk from '@/generated/api/sdk.gen';
import type {
  TimeBlock,
  TimeBlockCreationRequest,
  TimeBlockUpdateRequest,
} from '@/generated/api';
import { apiClient } from '@/config/api';

export const timeBlocksApi = {
  listTimeBlocks,
  createTimeBlock,
  updateTimeBlock,
  deleteTimeBlock,
  getTimeBlockById,
};

async function listTimeBlocks(): Promise<TimeBlock[]> {
  const response = await sdk.listTimeBlocks({ client: apiClient });
  
  if (response.error) {
    throw new Error('Failed to fetch time blocks');
  }
  
  return response.data?.items || [];
}

async function createTimeBlock(
  timeBlock: TimeBlockCreationRequest,
): Promise<TimeBlock> {
  const response = await sdk.createTimeBlock({
    client: apiClient,
    body: timeBlock,
  });
  
  if (response.error || !response.data) {
    throw new Error('Failed to create time block');
  }
  
  return response.data;
}

async function updateTimeBlock(
  id: string,
  timeBlock: TimeBlockUpdateRequest,
): Promise<TimeBlock> {
  const response = await sdk.updateTimeBlockById({
    client: apiClient,
    path: { id },
    body: timeBlock,
  });
  
  if (response.error || !response.data) {
    throw new Error('Failed to update time block');
  }
  
  return response.data;
}

async function deleteTimeBlock(id: string): Promise<void> {
  const response = await sdk.deleteTimeBlockById({
    client: apiClient,
    path: { id },
  });
  
  if (response.error) {
    throw new Error('Failed to delete time block');
  }
}

async function getTimeBlockById(id: string): Promise<TimeBlock | null> {
  const response = await sdk.getTimeBlockById({
    client: apiClient,
    path: { id },
  });
  
  if (response.error) {
    return null;
  }
  
  return response.data || null;
}

