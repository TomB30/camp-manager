import { defineStore } from "pinia";
import type {
  TimeBlock,
  TimeBlockCreationRequest,
  TimeBlockUpdateRequest,
} from "@/generated/api";
import { timeBlocksService } from "@/services";

export const useTimeBlocksStore = defineStore("timeBlocks", {
  state: () => ({
    timeBlocks: [] as TimeBlock[],
    loading: false,
  }),

  getters: {
    getTimeBlockById(state): (id: string) => TimeBlock | undefined {
      return (id: string): TimeBlock | undefined => {
        return state.timeBlocks.find((tb) => tb.meta.id === id);
      };
    },
  },

  actions: {
    async loadTimeBlocks(params?: {
      limit?: number;
      offset?: number;
      search?: string;
      filterBy?: string[];
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }): Promise<
      TimeBlock[] | { items: TimeBlock[]; total: number; limit: number; offset: number; next: number | null }
    > {
      this.loading = true;
      try {
        const response = await timeBlocksService.listTimeBlocks(params);
        this.timeBlocks = Array.isArray(response) ? response : response.items;
        return response;
      } finally {
        this.loading = false;
      }
    },

    async loadTimeBlocksPaginated(params?: {
      limit?: number;
      offset?: number;
      search?: string;
      filterBy?: string[];
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }): Promise<{
      items: TimeBlock[];
      total: number;
      limit: number;
      offset: number;
      next: number | null;
    }> {
      this.loading = true;
      try {
        const response = await timeBlocksService.listTimeBlocks(params);
        if (Array.isArray(response)) {
          return {
            items: response,
            total: response.length,
            limit: params?.limit || response.length,
            offset: params?.offset || 0,
            next: null,
          };
        }
        this.timeBlocks = response.items;
        return response;
      } finally {
        this.loading = false;
      }
    },

    async createTimeBlock(
      timeBlockRequest: TimeBlockCreationRequest,
    ): Promise<TimeBlock> {
      const timeBlock =
        await timeBlocksService.createTimeBlock(timeBlockRequest);
      this.timeBlocks.push(timeBlock);
      return timeBlock;
    },

    async updateTimeBlock(
      id: string,
      timeBlockUpdate: TimeBlockUpdateRequest,
    ): Promise<void> {
      const timeBlock = await timeBlocksService.updateTimeBlock(
        id,
        timeBlockUpdate,
      );
      const index = this.timeBlocks.findIndex((tb) => tb.meta.id === id);
      if (index >= 0) {
        this.timeBlocks[index] = timeBlock;
      }
    },

    async deleteTimeBlock(id: string): Promise<void> {
      await timeBlocksService.deleteTimeBlock(id);
      this.timeBlocks = this.timeBlocks.filter((tb) => tb.meta.id !== id);
    },
  },
});
