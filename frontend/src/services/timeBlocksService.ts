/**
 * Unified Time Blocks Service
 * Routes to either backend API or local storage based on configuration
 */
import { isBackendEnabled } from "@/config/dataSource";
import { timeBlocksStorage } from "./timeBlocksStorage";
import { timeBlocksApi } from "./api/timeBlocksApi";
import type {
  TimeBlock,
  TimeBlockCreationRequest,
  TimeBlockUpdateRequest,
} from "@/generated/api";

const impl = () => (isBackendEnabled() ? timeBlocksApi : timeBlocksStorage);

export const timeBlocksService = {
  listTimeBlocks: (): Promise<TimeBlock[]> => impl().listTimeBlocks(),
  createTimeBlock: (data: TimeBlockCreationRequest): Promise<TimeBlock> =>
    impl().createTimeBlock(data),
  updateTimeBlock: (
    id: string,
    data: TimeBlockUpdateRequest,
  ): Promise<TimeBlock> => impl().updateTimeBlock(id, data),
  deleteTimeBlock: (id: string): Promise<void> => impl().deleteTimeBlock(id),
  getTimeBlockById: (id: string): Promise<TimeBlock | null> =>
    impl().getTimeBlockById(id),
};
