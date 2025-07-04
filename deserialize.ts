import {
  OFFSET_BLACK_LEVEL,
  OFFSET_CLARITY,
  OFFSET_COLOR_BLENDER_BLUE,
  OFFSET_COLOR_BLENDER_CYAN,
  OFFSET_COLOR_BLENDER_GREEN,
  OFFSET_COLOR_BLENDER_MAGENTA,
  OFFSET_COLOR_BLENDER_ORANGE,
  OFFSET_COLOR_BLENDER_PURPLE,
  OFFSET_COLOR_BLENDER_RED,
  OFFSET_COLOR_BLENDER_YELLOW,
  OFFSET_COLOR_GRADING_BALANCE,
  OFFSET_COLOR_GRADING_BLENDING,
  OFFSET_COLOR_GRADING_HIGHLIGHTS,
  OFFSET_COLOR_GRADING_MIDTONE,
  OFFSET_COLOR_GRADING_SHADOWS,
  OFFSET_CONTRAST,
  OFFSET_HIGHLIGHTS,
  OFFSET_MID_RANGE_SHARPENING,
  OFFSET_NAME,
  OFFSET_SATURATION,
  OFFSET_SHADOWS,
  OFFSET_SHARPENING,
  OFFSET_TONE_CURVE_POINTS,
  OFFSET_TONE_CURVE_RAW,
  OFFSET_WHITE_LEVEL,
} from "./offset.ts";
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
  const str = String.fromCharCode(...buf.slice(OFFSET_NAME, OFFSET_NAME + 19));
  return str.split("\0", 1)[0];
}
/** Get the sharpning of the picture control */
export function readSharpning(buf: Uint8Array): number {
  return (buf[OFFSET_SHARPENING] - 0x80) / 4;
}
/** Get the mid-range sharpning of the picture control */
export function readMidRangeSharpning(buf: Uint8Array): number {
  return (buf[OFFSET_MID_RANGE_SHARPENING] - 0x80) / 4;
}
/** Get the clarity of the picture control */
export function readClarity(buf: Uint8Array): number {
  return (buf[OFFSET_CLARITY] - 0x80) / 4;
}
/** Get the contrast of the picture control */
export function readContrast(buf: Uint8Array): number {
  return buf[OFFSET_CONTRAST] - 0x80;
}
/** Get the highlights of the picture control */
export function readHighlights(buf: Uint8Array): number {
  return buf[OFFSET_HIGHLIGHTS] - 0x80;
}
/** Get the shadows of the picture control */
export function readShadows(buf: Uint8Array): number {
  return buf[OFFSET_SHADOWS] - 0x80;
}
/** Get the white level of the picture control */
export function readWhiteLevel(buf: Uint8Array): number {
  return buf[OFFSET_WHITE_LEVEL] - 0x80;
}
/** Get the black level of the picture control */
export function readBlackLevel(buf: Uint8Array): number {
  return buf[OFFSET_BLACK_LEVEL] - 0x80;
}
/** Get the saturation of the picture control */
export function readSaturation(buf: Uint8Array): number {
  return buf[OFFSET_SATURATION] - 0x80;
}
/** Get the color blender of the picture control */
export function readColorBlender(buf: Uint8Array): ColorBlender {
  return {
    red: readColorBlenderValues(buf, OFFSET_COLOR_BLENDER_RED),
    orange: readColorBlenderValues(buf, OFFSET_COLOR_BLENDER_ORANGE),
    yellow: readColorBlenderValues(buf, OFFSET_COLOR_BLENDER_YELLOW),
    green: readColorBlenderValues(buf, OFFSET_COLOR_BLENDER_GREEN),
    cyan: readColorBlenderValues(buf, OFFSET_COLOR_BLENDER_CYAN),
    blue: readColorBlenderValues(buf, OFFSET_COLOR_BLENDER_BLUE),
    purple: readColorBlenderValues(buf, OFFSET_COLOR_BLENDER_PURPLE),
    magenta: readColorBlenderValues(buf, OFFSET_COLOR_BLENDER_MAGENTA),
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
    highlights: readColorGradingValues(buf, OFFSET_COLOR_GRADING_HIGHLIGHTS),
    midTone: readColorGradingValues(buf, OFFSET_COLOR_GRADING_MIDTONE),
    shadows: readColorGradingValues(buf, OFFSET_COLOR_GRADING_SHADOWS),
    blending: buf[OFFSET_COLOR_GRADING_BLENDING] - 0x80,
    balance: buf[OFFSET_COLOR_GRADING_BALANCE] - 0x80,
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
  const u16arr = readAsBigEndianU16(buf.slice(OFFSET_TONE_CURVE_RAW, 0x3ce));
  return Array.from(u16arr);
}
function readToneCurvePoints(buf: Uint8Array): ToneCurve["points"] {
  const pointCount = buf[OFFSET_TONE_CURVE_POINTS];
  if (pointCount === 0) return [];
  const points: ToneCurve["points"] = [];
  for (let i = 0; i < pointCount; i++) {
    const offset = OFFSET_TONE_CURVE_POINTS + 1 + i * 2;
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
