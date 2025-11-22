import type {
  TimeBlock,
  TimeBlockCreationRequest,
  TimeBlockUpdateRequest,
} from "@/generated/api";
import { storageService } from "./storage";
import { getTenantContext } from "@/utils/tenantContext";
import { STORAGE_KEYS } from "./storageKeys";

export const timeBlocksStorage = {
  listTimeBlocks,
  createTimeBlock,
  updateTimeBlock,
  deleteTimeBlock,
  getTimeBlockById,
};

async function listTimeBlocks(): Promise<TimeBlock[]> {
  return storageService.getAll<TimeBlock>(STORAGE_KEYS.TIME_BLOCKS);
}

async function createTimeBlock(
  timeBlock: TimeBlockCreationRequest,
): Promise<TimeBlock> {
  const { tenantId, campId } = getTenantContext();
  const newTimeBlock = {
    ...timeBlock,
    meta: {
      id: crypto.randomUUID(),
      tenantId,
      campId,
      name: timeBlock.meta.name,
      description: timeBlock.meta.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<TimeBlock>(STORAGE_KEYS.TIME_BLOCKS, newTimeBlock);
}

async function updateTimeBlock(
  id: string,
  timeBlock: TimeBlockUpdateRequest,
): Promise<TimeBlock> {
  const existingTimeBlock = await storageService.getById<TimeBlock>(
    STORAGE_KEYS.TIME_BLOCKS,
    id,
  );
  if (!existingTimeBlock) {
    throw new Error(`Time block with id ${id} not found`);
  }
  const updatedTimeBlock = {
    ...existingTimeBlock,
    ...timeBlock,
    meta: {
      id: existingTimeBlock.meta.id,
      tenantId: existingTimeBlock.meta.tenantId,
      campId: existingTimeBlock.meta.campId,
      name: timeBlock.meta.name,
      description: timeBlock.meta.description,
      createdAt: existingTimeBlock.meta.createdAt,
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<TimeBlock>(
    STORAGE_KEYS.TIME_BLOCKS,
    updatedTimeBlock,
  );
}

async function deleteTimeBlock(id: string): Promise<void> {
  return storageService.delete(STORAGE_KEYS.TIME_BLOCKS, id);
}

async function getTimeBlockById(id: string): Promise<TimeBlock | null> {
  return storageService.getById<TimeBlock>(STORAGE_KEYS.TIME_BLOCKS, id);
}
