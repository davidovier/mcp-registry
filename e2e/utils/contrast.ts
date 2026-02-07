/**
 * Utility functions for computing WCAG contrast ratios
 */

/**
 * Parse CSS color string to RGB values
 */
export function parseColor(
  color: string
): { r: number; g: number; b: number } | null {
  // Handle rgb(r, g, b) or rgba(r, g, b, a) format
  const rgbMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  // Handle hex format
  const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16),
    };
  }

  return null;
}

/**
 * Convert sRGB component to linear RGB
 */
function sRGBtoLinear(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Calculate relative luminance per WCAG 2.1
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getRelativeLuminance(color: {
  r: number;
  g: number;
  b: number;
}): number {
  const r = sRGBtoLinear(color.r);
  const g = sRGBtoLinear(color.g);
  const b = sRGBtoLinear(color.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate WCAG contrast ratio between two colors
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function getContrastRatio(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number }
): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA standard
 */
export function meetsWCAG_AA(
  ratio: number,
  isLargeText: boolean = false
): boolean {
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast meets WCAG AAA standard
 */
export function meetsWCAG_AAA(
  ratio: number,
  isLargeText: boolean = false
): boolean {
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Format contrast result for reporting
 */
export function formatContrastResult(
  ratio: number,
  isLargeText: boolean = false
): {
  ratio: string;
  aa: "PASS" | "FAIL";
  aaa: "PASS" | "FAIL";
} {
  return {
    ratio: ratio.toFixed(2),
    aa: meetsWCAG_AA(ratio, isLargeText) ? "PASS" : "FAIL",
    aaa: meetsWCAG_AAA(ratio, isLargeText) ? "PASS" : "FAIL",
  };
}

export interface ContrastCheck {
  element: string;
  foreground: string;
  background: string;
  ratio: number;
  aa: "PASS" | "FAIL";
  aaa: "PASS" | "FAIL";
  isLargeText: boolean;
}

export function createContrastCheck(
  element: string,
  fgColor: string,
  bgColor: string,
  isLargeText: boolean = false
): ContrastCheck | null {
  const fg = parseColor(fgColor);
  const bg = parseColor(bgColor);

  if (!fg || !bg) {
    return null;
  }

  const ratio = getContrastRatio(fg, bg);
  const result = formatContrastResult(ratio, isLargeText);

  return {
    element,
    foreground: fgColor,
    background: bgColor,
    ratio,
    aa: result.aa,
    aaa: result.aaa,
    isLargeText,
  };
}
