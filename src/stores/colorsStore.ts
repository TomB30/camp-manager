import { defineStore } from "pinia";
import type { Color } from "@/types";
import { colorsService } from "@/services";

export const useColorsStore = defineStore("colors", {
  state: () => ({
    colors: [] as Color[],
    colorsById: {} as Record<string, Color>,
    loading: false,
  }),

  getters: {
    getColorById(state): (id: string) => Color | undefined {
      return (id: string): Color | undefined => state.colorsById[id];
    },
  },

  actions: {
    async loadColors(): Promise<void> {
      this.loading = true;
      try {
        this.colors = await colorsService.getColors();
        this.colorsById = this.colors.reduce(
          (acc, color) => {
            acc[color.id] = color;
            return acc;
          },
          {} as Record<string, Color>,
        );
      } finally {
        this.loading = false;
      }
    },

    async addColor(color: Color): Promise<void> {
      await colorsService.saveColor(color);
      this.colors.push(color);
      this.colorsById[color.id] = color;
    },

    async updateColor(color: Color): Promise<void> {
      await colorsService.saveColor(color);
      const index = this.colors.findIndex((c) => c.id === color.id);
      if (index >= 0) {
        this.colors[index] = color;
      }
      this.colorsById[color.id] = color;
    },

    async deleteColor(id: string): Promise<void> {
      await colorsService.deleteColor(id);
      this.colors = this.colors.filter((c) => c.id !== id);
    },
  },
});
