import { defineStore } from "pinia";
import type { Color } from "@/types";
import { colorsService } from "@/services";

export const useColorsStore = defineStore("colors", {
  state: () => ({
    colors: [] as Color[],
    loading: false,
  }),

  getters: {
    getColorById(state): (id: string) => Color | undefined {
      return (id: string): Color | undefined => {
        return state.colors.find((c) => c.id === id);
      };
    },

    getColorByName(state): (name: string) => Color | undefined {
      return (name: string): Color | undefined => {
        return state.colors.find(
          (c) => c.name.toLowerCase() === name.toLowerCase(),
        );
      };
    },

    getColorByHex(state): (hexValue: string) => Color | undefined {
      return (hexValue: string): Color | undefined => {
        return state.colors.find(
          (c) => c.hexValue.toLowerCase() === hexValue.toLowerCase(),
        );
      };
    },
  },

  actions: {
    async loadColors(): Promise<void> {
      this.loading = true;
      try {
        this.colors = await colorsService.getColors();
      } finally {
        this.loading = false;
      }
    },

    async addColor(color: Color): Promise<void> {
      await colorsService.saveColor(color);
      this.colors.push(color);
    },

    async updateColor(color: Color): Promise<void> {
      await colorsService.saveColor(color);
      const index = this.colors.findIndex((c) => c.id === color.id);
      if (index >= 0) {
        this.colors[index] = color;
      }
    },

    async deleteColor(id: string): Promise<void> {
      await colorsService.deleteColor(id);
      this.colors = this.colors.filter((c) => c.id !== id);
    },
  },
});
