import type {
  Color,
  ColorCreationRequest,
  ColorUpdateRequest,
} from "@/generated/api";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export const colorsService = {
  listColors,
  createColor,
  updateColor,
  deleteColor,
  getColorById,
  getColorByName,
  getColorByHex,
};

async function listColors(): Promise<Color[]> {
  return storageService.getAll<Color>(STORAGE_KEYS.COLORS);
}

async function createColor(color: ColorCreationRequest): Promise<Color> {
  const newColor = {
    ...color,
    meta: {
      id: crypto.randomUUID(),
      name: color.meta.name,
      description: color.meta.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<Color>(STORAGE_KEYS.COLORS, newColor);
}

async function updateColor(
  id: string,
  color: ColorUpdateRequest,
): Promise<Color> {
  const existingColor = await storageService.getById<Color>(
    STORAGE_KEYS.COLORS,
    id,
  );
  if (!existingColor) {
    throw new Error(`Color with id ${id} not found`);
  }
  const updatedColor = {
    ...existingColor,
    ...color,
    meta: {
      id: existingColor.meta.id,
      name: color.meta.name,
      description: color.meta.description,
      createdAt: existingColor.meta.createdAt,
      updatedAt: new Date().toISOString(),
    },
  };
  return storageService.save<Color>(STORAGE_KEYS.COLORS, updatedColor);
}

async function deleteColor(id: string): Promise<void> {
  return storageService.delete(STORAGE_KEYS.COLORS, id);
}

async function getColorById(id: string): Promise<Color | null> {
  return storageService.getById<Color>(STORAGE_KEYS.COLORS, id);
}

async function getColorByName(name: string): Promise<Color | null> {
  const colors = await listColors();
  return (
    colors.find((c) => c.meta.name.toLowerCase() === name.toLowerCase()) || null
  );
}

async function getColorByHex(hexValue: string): Promise<Color | null> {
  const colors = await listColors();
  return (
    colors.find(
      (c) => c.spec.hexValue.toLowerCase() === hexValue.toLowerCase(),
    ) || null
  );
}
