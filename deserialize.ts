import type {
  ColorBlender,
  ColorBlenderValues,
  ColorGrading,
  ColorGradingValues,
  FlexibleColorPictureControlOptions,
  ToneCurve,
} from "./types.ts";

type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};
type OmitDeepRequired<T, K extends keyof T> =
  & DeepRequired<Omit<T, K>>
  & Pick<T, K>;

/**
 * Parse "flexible color picture control" binary
 * @param buf NP3 binary
 * @returns flexible color picture control options
 * @example
 * ```ts
 * const buf = Deno.readFileSync("test.NP3");
 * const options = deserialize(buf);
 * console.log(options); // { name: "test", sharpning: 2, ... }
 * ```
 */
export function deserialize(
  buf: Uint8Array,
): OmitDeepRequired<FlexibleColorPictureControlOptions, "toneCurve"> {
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

/** Get the name of the picture control */
export function readName(buf: Uint8Array): string {
  return String.fromCharCode(...buf.slice(0x18, 0x18 + 19)).split("\0", 1)[0];
}
/** Get the sharpning of the picture control */
export function readSharpning(buf: Uint8Array): number {
  return (buf[0x52] - 0x80) / 4;
}
/** Get the mid-range sharpning of the picture control */
export function readMidRangeSharpning(buf: Uint8Array): number {
  return (buf[0xf2] - 0x80) / 4;
}
/** Get the clarity of the picture control */
export function readClarity(buf: Uint8Array): number {
  return (buf[0x5c] - 0x80) / 4;
}
/** Get the contrast of the picture control */
export function readContrast(buf: Uint8Array): number {
  return buf[0x110] - 0x80;
}
/** Get the highlights of the picture control */
export function readHighlights(buf: Uint8Array): number {
  return buf[0x11a] - 0x80;
}
/** Get the shadows of the picture control */
export function readShadows(buf: Uint8Array): number {
  return buf[0x124] - 0x80;
}
/** Get the white level of the picture control */
export function readWhiteLevel(buf: Uint8Array): number {
  return buf[0x12e] - 0x80;
}
/** Get the black level of the picture control */
export function readBlackLevel(buf: Uint8Array): number {
  return buf[0x138] - 0x80;
}
/** Get the saturation of the picture control */
export function readSaturation(buf: Uint8Array): number {
  return buf[0x142] - 0x80;
}
/** Get the color blender of the picture control */
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
function readColorBlenderValues(
  buf: Uint8Array,
  offset: number,
): ColorBlenderValues {
  return {
    hue: buf[offset] - 0x80,
    chroma: buf[offset + 1] - 0x80,
    brightness: buf[offset + 2] - 0x80,
  };
}
/** Get the color grading of the picture control */
export function readColorGrading(buf: Uint8Array): ColorGrading {
  return {
    highlights: readColorGradingValues(buf, 0x170),
    midTone: readColorGradingValues(buf, 0x174),
    shadows: readColorGradingValues(buf, 0x178),
    blending: buf[0x180] - 0x80,
    balance: buf[0x182] - 0x80,
  };
}
function readColorGradingValues(
  buf: Uint8Array,
  offset: number,
): ColorGradingValues {
  return {
    hue: ((buf[offset] & 0x0f) << 8) + buf[offset + 1],
    chroma: buf[offset + 2] - 0x80,
    brightness: buf[offset + 3] - 0x80,
  };
}
/** Get the tone curve of the picture control */
export function readToneCurve(buf: Uint8Array): ToneCurve | undefined {
  if (buf.byteLength < 0x3cd) return undefined;
  return {
    raw: readToneCurveRaw(buf),
    points: readToneCurvePoints(buf),
  };
}
function readToneCurveRaw(buf: Uint8Array): number[] {
  if (buf.byteLength < 0x3cd) return [];
  return Array.from(readAsBigEndianU16(buf.slice(0x1cc, 0x3ce)));
}
function readToneCurvePoints(buf: Uint8Array): ToneCurve["points"] {
  if (buf.byteLength < 0x3cd) return [];
  const pointsOffset = 0x194;
  const pointCount = buf[pointsOffset];
  if (pointCount === 0) return [];
  const points: ToneCurve["points"] = [];
  for (let i = 0; i < pointCount; i++) {
    const offset = pointsOffset + 1 + i * 2;
    points.push({ x: buf[offset], y: buf[offset + 1] });
  }
  return points;
}
function readAsBigEndianU16(
  buf: Uint8Array,
): Uint16Array {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const u16arr = new Uint16Array(buf.byteLength / 2);
  for (let i = 0; i < u16arr.length; i++) {
    u16arr[i] = view.getUint16(i * 2, false); // false for big-endian
  }
  return u16arr;
}
