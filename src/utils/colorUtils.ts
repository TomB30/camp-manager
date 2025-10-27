import { useColorsStore } from "@/stores";

/**
 * Resolves a colorId to its hex value from the camp store
 * Falls back to the provided color if colorId is not found or not provided
 */
export function resolveColor(colorId?: string, fallbackColor?: string): string {
  if (!colorId) {
    return fallbackColor || "#6366F1"; // Default indigo
  }

  const store = useColorsStore();
  const campColor = store.getColorById(colorId);

  if (campColor) {
    return campColor.spec.hexValue;
  }

  // Fallback if colorId not found
  return fallbackColor || "#6366F1";
}

/**
 * Gets color value from either colorId or color field
 * Supports backward compatibility with entities that have both
 */
export function getEntityColor(entity: {
  colorId?: string;
  color?: string;
}): string {
  // Prefer colorId over legacy color field
  if (entity.colorId) {
    return resolveColor(entity.colorId, entity.color);
  }

  return entity.color || "#6366F1";
}
