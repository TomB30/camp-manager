import { defineStore } from "pinia";
import type { Color, ColorCreationRequest, ColorUpdateRequest } from "@/types";
import { colorsService } from "@/services";

export const useColorsStore = defineStore("colors", {
  state: () => ({
    colors: [] as Color[],
    colorsById: {} as Record<string, Color>,
    loading: false,
  }),

  getters: {
    getColorById(state): (id: string) => Color | undefined {
      return (id: string): Color | undefined => state.colors.find((c) => c.id === id);
    },
  },

  actions: {
    async loadColors(): Promise<void> {
      this.loading = true;
      try {
        this.colors = await colorsService.listColors();
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

    async createColor(colorRequest: ColorCreationRequest): Promise<Color> {
      const color = await colorsService.createColor(colorRequest);
      this.colors.push(color);
      this.colorsById[color.id] = color;
      return color;
    },

    async updateColor(id: string, colorUpdate: ColorUpdateRequest): Promise<void> {
      const color = await colorsService.updateColor(id, colorUpdate);
      const index = this.colors.findIndex((c) => c.id === id);
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
