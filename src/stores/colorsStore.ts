import { defineStore } from "pinia";
import type { Color, ColorCreationRequest, ColorUpdateRequest } from "@/generated/api";
import { colorsService } from "@/services";

export const useColorsStore = defineStore("colors", {
  state: () => ({
    colors: [] as Color[],
    colorsById: {} as Record<string, Color>,
    loading: false,
  }),

  getters: {
    getColorById(state): (id: string) => Color | undefined {
      return (id: string): Color | undefined =>
        state.colors.find((c) => c.meta.id === id);
    },
    getDefaultColor(state): Color | undefined {
      return state.colors.find((c) => c.spec.default === true);
    },
  },

  actions: {
    async loadColors(): Promise<void> {
      this.loading = true;
      try {
        this.colors = await colorsService.listColors();
        this.colorsById = this.colors.reduce(
          (acc, color) => {
            acc[color.meta.id] = color;
            return acc;
          },
          {} as Record<string, Color>,
        );
      } finally {
        this.loading = false;
      }
    },

    async createColor(colorRequest: ColorCreationRequest): Promise<Color> {
      // If this color is being set as default, unset all other defaults
      if (colorRequest.spec.default) {
        const updatePromises = this.colors
          .filter((c) => c.spec.default)
          .map((c) =>
            colorsService.updateColor(c.meta.id, {
              meta: {
                name: c.meta.name,
                description: c.meta.description,
              },
              spec: {
                hexValue: c.spec.hexValue,
                default: false,
              },
            }),
          );

        // Update all other default colors to false in the backend
        await Promise.all(updatePromises);

        // Update local state
        this.colors.forEach((c) => {
          if (c.spec.default) {
            c.spec.default = false;
          }
        });
      }

      const color = await colorsService.createColor(colorRequest);
      this.colors.push(color);
      this.colorsById[color.meta.id] = color;
      return color;
    },

    async updateColor(
      id: string,
      colorUpdate: ColorUpdateRequest,
    ): Promise<void> {
      // If this color is being set as default, unset all other defaults
      if (colorUpdate.spec.default) {
        const updatePromises = this.colors
          .filter((c) => c.meta.id !== id && c.spec.default)
          .map((c) =>
            colorsService.updateColor(c.meta.id, {
              meta: {
                name: c.meta.name,
                description: c.meta.description,
              },
              spec: {
                hexValue: c.spec.hexValue,
                default: false,
              },
            }),
          );

        // Update all other default colors to false in the backend
        await Promise.all(updatePromises);

        // Update local state
        this.colors.forEach((c) => {
          if (c.meta.id !== id && c.spec.default) {
            c.spec.default = false;
          }
        });
      }

      const color = await colorsService.updateColor(id, colorUpdate);
      const index = this.colors.findIndex((c) => c.meta.id === id);
      if (index >= 0) {
        this.colors[index] = color;
      }
      this.colorsById[color.meta.id] = color;
    },

    async deleteColor(id: string): Promise<void> {
      await colorsService.deleteColor(id);
      this.colors = this.colors.filter((c) => c.meta.id !== id);
    },
  },
});
