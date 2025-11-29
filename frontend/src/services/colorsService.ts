/**
 * Unified Colors Service
 * Routes to either backend API or local storage based on configuration
 */
import { isBackendEnabled } from "@/config/dataSource";
import { colorsStorage } from "./colorsStorage";
import { colorsApi } from "./api/colorsApi";
import type {
  Color,
  ColorCreationRequest,
  ColorUpdateRequest,
} from "@/generated/api";

const impl = () => (isBackendEnabled() ? colorsApi : colorsStorage);

export const colorsService = {
  listColors: (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    filterBy?: string[];
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<
    | {
        items: Color[];
        total: number;
        limit: number;
        offset: number;
        next: number | null;
      }
    | Color[]
  > => impl().listColors(params),
  createColor: (data: ColorCreationRequest): Promise<Color> =>
    impl().createColor(data),
  updateColor: (id: string, data: ColorUpdateRequest): Promise<Color> =>
    impl().updateColor(id, data),
  deleteColor: (id: string): Promise<void> => impl().deleteColor(id),
  getColorById: (id: string): Promise<Color | null> => impl().getColorById(id),
};
