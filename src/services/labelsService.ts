import type { Label } from "@/generated/api";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

// Label request types (not auto-generated)
export type LabelCreationRequest = {
  meta: {
    name: string;
    description?: string;
  };
};

export type LabelUpdateRequest = {
  meta: {
    name: string;
    description?: string;
  };
};

export const labelsService = {
  listLabels,
  createLabel,
  updateLabel,
  deleteLabel,
  getLabelById,
  getLabelByName,
};

async function listLabels(): Promise<Label[]> {
  return storageService.getAll<Label>(STORAGE_KEYS.LABELS);
}

async function createLabel(label: LabelCreationRequest): Promise<Label> {
  const newLabel = {
    ...label,
    meta: {
      id: crypto.randomUUID(),
      name: label.meta.name,
      description: label.meta.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: {},
  };
  return storageService.save<Label>(STORAGE_KEYS.LABELS, newLabel);
}

async function updateLabel(
  id: string,
  label: LabelUpdateRequest,
): Promise<Label> {
  const existingLabel = await storageService.getById<Label>(
    STORAGE_KEYS.LABELS,
    id,
  );
  if (!existingLabel) {
    throw new Error(`Label with id ${id} not found`);
  }
  const updatedLabel = {
    ...existingLabel,
    ...label,
    meta: {
      ...existingLabel.meta,
      name: label.meta.name,
      description: label.meta.description,
      updatedAt: new Date().toISOString(),
    },
    spec: {},
  };
  return storageService.save<Label>(STORAGE_KEYS.LABELS, updatedLabel);
}

async function deleteLabel(id: string): Promise<void> {
  return storageService.delete(STORAGE_KEYS.LABELS, id);
}

async function getLabelById(id: string): Promise<Label | null> {
  return storageService.getById<Label>(STORAGE_KEYS.LABELS, id);
}

async function getLabelByName(name: string): Promise<Label | null> {
  const labels = await listLabels();
  return (
    labels.find((l) => l.meta.name.toLowerCase() === name.toLowerCase()) || null
  );
}
