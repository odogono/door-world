// Add this helper function to get computed CSS values
export const getComputedColor = (varName: string) => {
  // Remove var() wrapper if it exists
  const cleanVarName = varName.replace(/^var\((.*)\)$/, '$1').trim();

  const style = getComputedStyle(document.documentElement);
  return style.getPropertyValue(cleanVarName).trim();
};

// Convert hex to RGB
export const hexToRGB = (hex: string): { b: number; g: number; r: number } => {
  // Remove # if present
  const cleanHex = hex.charAt(0) === '#' ? hex.slice(1) : hex;

  // Parse hex values
  const r = Number.parseInt(cleanHex.slice(0, 2), 16);
  const g = Number.parseInt(cleanHex.slice(2, 4), 16);
  const b = Number.parseInt(cleanHex.slice(4, 6), 16);

  return { b, g, r };
};

const getRGB = (c: number): number =>
  c <= 0.039_28 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

// Calculate relative luminance
export const getLuminance = (r: number, g: number, b: number): number => {
  // Convert RGB values to sRGB
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;

  // Convert to linear RGB

  const rLinear = getRGB(sR);
  const gLinear = getRGB(sG);
  const bLinear = getRGB(sB);

  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

// Get contrasting color (black or white)
export const getContrastColor = (backgroundColor: string): string => {
  const { b, g, r } = hexToRGB(backgroundColor);
  const luminance = getLuminance(r, g, b);

  // Using WCAG contrast ratio threshold
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.179 ? '#000000' : '#FFFFFF';
};

// Convert back to hex
const toHex = (c: number): string => {
  const hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

// Darken each component
const darkenComponent = (c: number, factor: number): number =>
  Math.round(Math.max(0, c * (1 - factor)));

// Darken a hex color by a factor (0-1)
export const darkenColor = (hex: string, factor: number = 0.15): string => {
  // Ensure factor is between 0 and 1
  factor = Math.min(1, Math.max(0, factor));

  // Convert hex to RGB
  const { b, g, r } = hexToRGB(hex);

  const newR = darkenComponent(r, factor);
  const newG = darkenComponent(g, factor);
  const newB = darkenComponent(b, factor);

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};
