import { defineStore } from 'pinia';
import type { Label } from '@/types';
import { labelsService } from '@/services';

export const useLabelsStore = defineStore('labels', {
  state: () => ({
    labels: [] as Label[],
    loading: false,
  }),

  getters: {
    getLabelById(state): (id: string) => Label | undefined {
      return (id: string): Label | undefined => {
        return state.labels.find(l => l.id === id);
      };
    },

    getLabelByName(state): (name: string) => Label | undefined {
      return (name: string): Label | undefined => {
        return state.labels.find(l => l.name.toLowerCase() === name.toLowerCase());
      };
    },
  },

  actions: {
    async loadLabels(): Promise<void> {
      this.loading = true;
      try {
        this.labels = await labelsService.getLabels();
      } finally {
        this.loading = false;
      }
    },

    async addLabel(label: Label): Promise<void> {
      await labelsService.saveLabel(label);
      this.labels.push(label);
    },

    async updateLabel(label: Label): Promise<void> {
      await labelsService.saveLabel(label);
      const index = this.labels.findIndex(l => l.id === label.id);
      if (index >= 0) {
        this.labels[index] = label;
      }
    },

    async deleteLabel(id: string): Promise<void> {
      await labelsService.deleteLabel(id);
      this.labels = this.labels.filter(l => l.id !== id);
    },
  }
});

