import { CMYK, RGB, ColorGroup, ColorSubgroup, ColorData } from "../types";

/**
 * CMYK to RGB conversion
 * Formula:
 * R = 255 * (1 - C/100) * (1 - K/100)
 * G = 255 * (1 - M/100) * (1 - K/100)
 * B = 255 * (1 - Y/100) * (1 - K/100)
 */
export function cmykToRgb(cmyk: CMYK): RGB {
  const r = Math.round(255 * (1 - cmyk.c / 100) * (1 - cmyk.k / 100));
  const g = Math.round(255 * (1 - cmyk.m / 100) * (1 - cmyk.k / 100));
  const b = Math.round(255 * (1 - cmyk.y / 100) * (1 - cmyk.k / 100));
  return { r, g, b };
}

export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Classify color based on Hue (from HSL)
 */
export function getColorGroup(rgb: RGB, cmyk: CMYK): ColorGroup {
  const { r, g, b } = rgb;
  const rf = r / 255, gf = g / 255, bf = b / 255;
  const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf);
  let h = 0;
  const d = max - min;

  if (d === 0) h = 0;
  else if (max === rf) h = ((gf - bf) / d) % 6;
  else if (max === gf) h = (bf - rf) / d + 2;
  else if (max === bf) h = (rf - gf) / d + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  // Saturation check for neutrals
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * ((max + min) / 2) - 1));

  // Determine group based on Hue ranges (simplified)
  // Gialli e Aranci: 30 - 65
  // Rossi e Rosa: 330 - 30
  // Viola, Blu, Azzurri: 180 - 330
  // Verdi, Neutri, Marroni: 65 - 180 (plus low saturation)

  if (s < 0.1) return ColorGroup.Colori4; // Neutrals

  if (h >= 30 && h < 65) return ColorGroup.Colori1;
  if (h >= 330 || h < 30) return ColorGroup.Colori2;
  if (h >= 180 && h < 330) return ColorGroup.Colori3;
  
  return ColorGroup.Colori4; // Greens and browns
}

/**
 * Classify by K value
 */
export function getColorSubgroup(cmyk: CMYK): ColorSubgroup {
  if (cmyk.k < 10) return ColorSubgroup.Chiaro;
  if (cmyk.k < 50) return ColorSubgroup.Medio;
  return ColorSubgroup.Scuro;
}

/**
 * Sort function for colors
 */
export function sortColors(colors: ColorData[]): ColorData[] {
  const groupOrder = [
    ColorGroup.Colori1,
    ColorGroup.Colori2,
    ColorGroup.Colori3,
    ColorGroup.Colori4,
  ];
  const subgroupOrder = [
    ColorSubgroup.Chiaro,
    ColorSubgroup.Medio,
    ColorSubgroup.Scuro,
  ];

  return [...colors].sort((a, b) => {
    // 1. Group
    const gIndexA = groupOrder.indexOf(a.group);
    const gIndexB = groupOrder.indexOf(b.group);
    if (gIndexA !== gIndexB) return gIndexA - gIndexB;

    // 2. Subgroup
    const sIndexA = subgroupOrder.indexOf(a.subgroup);
    const sIndexB = subgroupOrder.indexOf(b.subgroup);
    if (sIndexA !== sIndexB) return sIndexA - sIndexB;

    // 3. Brightness (K value then C+M+Y)
    if (a.cmyk.k !== b.cmyk.k) return a.cmyk.k - b.cmyk.k;
    
    const sumA = a.cmyk.c + a.cmyk.m + a.cmyk.y;
    const sumB = b.cmyk.c + b.cmyk.m + b.cmyk.y;
    return sumA - sumB;
  });
}
