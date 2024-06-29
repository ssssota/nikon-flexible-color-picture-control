import type {
  ColorBlender,
  ColorBlenderValues,
  ColorGrading,
  ColorGradingValues,
  FlexibleColorPictureControlOptions,
} from "./types.ts";

type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export function deserialize(
  buf: Uint8Array,
): DeepRequired<FlexibleColorPictureControlOptions> {
  return {
    name: readName(buf),
    sharpning: readSharpning(buf),
    midRangeSharpning: readMidRangeSharpning(buf),
    clarity: readClarity(buf),
    contrast: readContrast(buf),
    highlights: readHighlights(buf),
    shadows: readShadows(buf),
    whiteLevel: readWhiteLevel(buf),
    blackLevel: readBlackLevel(buf),
    saturation: readSaturation(buf),
    colorBlender: readColorBlender(buf),
    colorGrading: readColorGrading(buf),
  };
}

export function readName(buf: Uint8Array): string {
  return String.fromCharCode(...buf.slice(0x18, 0x18 + 19)).split("\0", 1)[0];
}
export function readSharpning(buf: Uint8Array): number {
  return (buf[0x52] - 0x80) / 4;
}
export function readMidRangeSharpning(buf: Uint8Array): number {
  return (buf[0xf2] - 0x80) / 4;
}
export function readClarity(buf: Uint8Array): number {
  return (buf[0x5c] - 0x80) / 4;
}
export function readContrast(buf: Uint8Array): number {
  return buf[0x110] - 0x80;
}
export function readHighlights(buf: Uint8Array): number {
  return buf[0x11a] - 0x80;
}
export function readShadows(buf: Uint8Array): number {
  return buf[0x124] - 0x80;
}
export function readWhiteLevel(buf: Uint8Array): number {
  return buf[0x12e] - 0x80;
}
export function readBlackLevel(buf: Uint8Array): number {
  return buf[0x138] - 0x80;
}
export function readSaturation(buf: Uint8Array): number {
  return buf[0x142] - 0x80;
}
export function readColorBlender(buf: Uint8Array): ColorBlender {
  return {
    red: readColorBlenderValues(buf, 0x14c),
    orange: readColorBlenderValues(buf, 0x14f),
    yellow: readColorBlenderValues(buf, 0x152),
    green: readColorBlenderValues(buf, 0x155),
    cyan: readColorBlenderValues(buf, 0x158),
    blue: readColorBlenderValues(buf, 0x15b),
    purple: readColorBlenderValues(buf, 0x15e),
    magenta: readColorBlenderValues(buf, 0x161),
  };
}
export function readColorBlenderValues(
  buf: Uint8Array,
  offset: number,
): ColorBlenderValues {
  return {
    hue: buf[offset] - 0x80,
    chroma: buf[offset + 1] - 0x80,
    brightness: buf[offset + 2] - 0x80,
  };
}
export function readColorGrading(buf: Uint8Array): ColorGrading {
  return {
    highlights: readColorGradingValues(buf, 0x170),
    midTone: readColorGradingValues(buf, 0x174),
    shadows: readColorGradingValues(buf, 0x178),
    blending: buf[0x180] - 0x80,
    balance: buf[0x182] - 0x80,
  };
}
export function readColorGradingValues(
  buf: Uint8Array,
  offset: number,
): ColorGradingValues {
  return {
    hue: ((buf[offset] & 0x0f) << 8) + buf[offset + 1],
    chroma: buf[offset + 2] - 0x80,
    brightness: buf[offset + 3] - 0x80,
  };
}
