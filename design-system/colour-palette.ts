// Basic gray
export const RAISIN_BLACK = "rgba(36, 36, 36, 1)";

// Primary
export const KEPPEL = "rgba(10, 117, 87, 1)";

// Secondary
export const DEEP_SPACE = "rgba(69, 97, 95, 1)";

// Vectors
export const BLUEBERRY = "rgba(83, 128, 229, 1)";
export const EMERALD = "rgba(95, 197 ,127, 1)";
export const PARADISE_PINK = "rgba(232, 57, 98, 1)";

// Keywords/links
export const SEA_GREEN = "#12d39d";

// Warn
export const RIPE_MANGO = "rgba(251,200,43, 1)";

// Danger
export const DEEP_CARMINE = "rgba(231,50,50, 1)";

// Lines/boxes
export const OPAL = "rgba(169,189,182, 1)";

// Title
export const CHINESE_WHITE = "rgba(219,228,226, 1)";

// Text
export const WHITE = "rgb(255, 255, 255)";

// Category
export const BLUE_GRAY = "#688acc";
export const MOSS_GREEN = "#c0dea9";
export const AMETHYST = "#9e5fcb";
export const CEIL = "#92a8d4";
export const BURNT_SIENNA = "#f16d53";
export const SUNRAY = "#e2b657";

// Grays
export const LAVENDER_GRAY = "#c0c7ce";
export const SPANISH_GRAY = "#909896";
export const DAVYS_GRAY = "#505554";
export const ONYX = "#37383a";
export const RICH_BLACK = "#00120f";

/**
 * Changes the opacity of an RGBA color string.
 * @param color The original RGBA color string.
 * @param newOpacity The new opacity level (between 0 and 1).
 * @returns The RGBA color string with the updated opacity.
 */
export function changeOpacity(color: string, newOpacity: number): string {
  // Validate the new opacity is within the range
  if (newOpacity < 0 || newOpacity > 1) {
    throw new Error("Opacity must be between 0 and 1.");
  }

  // Extract the RGB values and current opacity using a regular expression
  const rgbaRegex = /rgba\((\d{1,3}), (\d{1,3}), (\d{1,3}), (\d(\.\d+)?)\)/;
  const match = color.match(rgbaRegex);

  if (!match) {
    throw new Error("Invalid RGBA color format.");
  }

  // Replace the current opacity with the new opacity
  const updatedColor = `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${newOpacity})`;

  return updatedColor;
}
