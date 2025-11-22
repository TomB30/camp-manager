/**
 * Unified Labels Service
 * Routes to either backend API or local storage based on configuration
 *
 * Note: Labels service currently only has localStorage implementation
 * as labels are not yet part of the backend API
 */
import {
  labelsStorage,
  type LabelCreationRequest,
  type LabelUpdateRequest,
} from "./labelsStorage";
import type { Label } from "@/types";

// For now, labels only work with localStorage
// When backend API is ready, we'll add the API implementation and routing logic
export const labelsService = {
  listLabels: (): Promise<Label[]> => labelsStorage.listLabels(),
  createLabel: (data: LabelCreationRequest): Promise<Label> =>
    labelsStorage.createLabel(data),
  updateLabel: (id: string, data: LabelUpdateRequest): Promise<Label> =>
    labelsStorage.updateLabel(id, data),
  deleteLabel: (id: string): Promise<void> => labelsStorage.deleteLabel(id),
  getLabelById: (id: string): Promise<Label | null> =>
    labelsStorage.getLabelById(id),
  getLabelByName: (name: string): Promise<Label | null> =>
    labelsStorage.getLabelByName(name),
};
