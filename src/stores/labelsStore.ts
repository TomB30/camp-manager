import { defineStore } from "pinia";
import type { Label } from "@/generated/api";
import { labelsService } from "@/services";
import type { LabelCreationRequest, LabelUpdateRequest } from "@/services";

export const useLabelsStore = defineStore("labels", {
  state: () => ({
    labels: [] as Label[],
    loading: false,
  }),

  getters: {
    getLabelById(state): (id: string) => Label | undefined {
      return (id: string): Label | undefined => {
        return state.labels.find((l: Label) => l.meta.id === id);
      };
    },

    getLabelByName(state): (name: string) => Label | undefined {
      return (name: string): Label | undefined => {
        return state.labels.find(
          (l: Label) => l.meta.name.toLowerCase() === name.toLowerCase(),
        );
      };
    },
  },

  actions: {
    async loadLabels(): Promise<void> {
      this.loading = true;
      try {
        this.labels = await labelsService.listLabels();
      } finally {
        this.loading = false;
      }
    },

    async addLabel(labelRequest: LabelCreationRequest): Promise<Label> {
      const label = await labelsService.createLabel(labelRequest);
      this.labels = this.labels ? [...this.labels, label] : [label];
      return label;
    },

    async updateLabel(
      id: string,
      labelUpdate: LabelUpdateRequest,
    ): Promise<void> {
      const label = await labelsService.updateLabel(id, labelUpdate);
      const index = this.labels.findIndex((l: Label) => l.meta.id === id);
      if (index >= 0) {
        this.labels[index] = label;
      }
    },

    async deleteLabel(id: string): Promise<void> {
      await labelsService.deleteLabel(id);
      this.labels = this.labels?.filter((l: Label) => l.meta.id !== id) || [];
    },
  },
});
