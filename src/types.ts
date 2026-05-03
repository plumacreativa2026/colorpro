export interface CMYK {
  c: number;
  m: number;
  y: number;
  k: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export enum ColorGroup {
  Colori1 = "Colori1 (Gialli e Aranci)",
  Colori2 = "Colori2 (Rossi e Rosa)",
  Colori3 = "Colori3 (Viola, Blu e Azzurri)",
  Colori4 = "Colori4 (Verdi, Neutri e Marroni)",
}

export enum ColorSubgroup {
  Chiaro = "Chiaro",
  Medio = "Medio",
  Scuro = "Scuro",
}

export interface ColorData {
  id: string; // Original Pantone ID or index
  cmyk: CMYK;
  rgb: RGB;
  hex: string;
  group: ColorGroup;
  subgroup: ColorSubgroup;
}
