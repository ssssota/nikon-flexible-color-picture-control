import { base, baseWithToneCurve } from "./base.ts";
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

/**
 * Create "flexible color picture control" binary
 * @param options
 * @returns NP3 binary
 * @example
 * ```ts
 * const buf = serialize({ name: "test", sharpning: 2 });
 * // Deno
 * Deno.writeFileSync("test.NP3", buf);
 * // Node.js/Bun
 * fs.writeFileSync("test.NP3", buf);
 * // Browser
 * URL.createObjectURL(new Blob([buf], { type: "application/octet-stream" }));
 * ```
 */
export function serialize({
  name,
  sharpning,
  midRangeSharpning,
  clarity,
  contrast,
  highlights,
  shadows,
  whiteLevel,
  blackLevel,
  saturation,
  colorBlender,
  colorGrading,
  toneCurve,
}: FlexibleColorPictureControlOptions): Uint8Array {
  const ret = new Uint8Array(toneCurve ? baseWithToneCurve : base);
  writeName(ret, name);
  writeSharpning(ret, sharpning);
  writeMidRangeSharpning(ret, midRangeSharpning);
  writeClarity(ret, clarity);
  writeContrast(ret, contrast);
  writeHighlights(ret, highlights);
  writeShadows(ret, shadows);
  writeWhiteLevel(ret, whiteLevel);
  writeBlackLevel(ret, blackLevel);
  writeSaturation(ret, saturation);
  writeColorBlender(ret, colorBlender);
  writeColorGrading(ret, colorGrading);
  if (toneCurve) writeToneCurve(ret, toneCurve);
  return ret;
}

/** Set the name of the picture control */
export function writeName(buf: Uint8Array, name: string) {
  if (name.length > 19) {
    throw new Error("name must be less than 19 characters");
  }
  for (let i = 0; i < name.length; i++) {
    buf[OFFSET_NAME + i] = name.charCodeAt(i);
  }
}
/** Set the sharpning of the picture control */
export function writeSharpning(buf: Uint8Array, sharpning = 2) {
  buf[OFFSET_SHARPENING] = 0x80 + clamp(sharpning, -3, 9) * 4;
}
/** Set the mid-range sharpning of the picture control */
export function writeMidRangeSharpning(buf: Uint8Array, midRangeSharpning = 1) {
  buf[OFFSET_MID_RANGE_SHARPENING] = 0x80 + clamp(midRangeSharpning, -5, 5) * 4;
}
/** Set the clarity of the picture control */
export function writeClarity(buf: Uint8Array, clarity = 0.5) {
  buf[OFFSET_CLARITY] = 0x80 + clamp(clarity, -5, 5) * 4;
}
/** Set the contrast of the picture control */
export function writeContrast(buf: Uint8Array, contrast = 0) {
  buf[OFFSET_CONTRAST] = 0x80 + clamp(contrast, -100, 100);
}
/** Set the highlights of the picture control */
export function writeHighlights(buf: Uint8Array, highlights = 0) {
  buf[OFFSET_HIGHLIGHTS] = 0x80 + clamp(highlights, -100, 100);
}
/** Set the shadows of the picture control */
export function writeShadows(buf: Uint8Array, shadows = 0) {
  buf[OFFSET_SHADOWS] = 0x80 + clamp(shadows, -100, 100);
}
/** Set the white level of the picture control */
export function writeWhiteLevel(buf: Uint8Array, whiteLevel = 0) {
  buf[OFFSET_WHITE_LEVEL] = 0x80 + clamp(whiteLevel, -100, 100);
}
/** Set the black level of the picture control */
export function writeBlackLevel(buf: Uint8Array, blackLevel = 0) {
  buf[OFFSET_BLACK_LEVEL] = 0x80 + clamp(blackLevel, -100, 100);
}
/** Set the saturation of the picture control */
export function writeSaturation(buf: Uint8Array, saturation = 0) {
  buf[OFFSET_SATURATION] = 0x80 + clamp(saturation, -100, 100);
}
/** Set the color blender of the picture control */
export function writeColorBlender(
  buf: Uint8Array,
  colorBlender: ColorBlender = {},
) {
  writeColorBlenderValues(buf, OFFSET_COLOR_BLENDER_RED, colorBlender.red);
  writeColorBlenderValues(
    buf,
    OFFSET_COLOR_BLENDER_ORANGE,
    colorBlender.orange,
  );
  writeColorBlenderValues(
    buf,
    OFFSET_COLOR_BLENDER_YELLOW,
    colorBlender.yellow,
  );
  writeColorBlenderValues(buf, OFFSET_COLOR_BLENDER_GREEN, colorBlender.green);
  writeColorBlenderValues(buf, OFFSET_COLOR_BLENDER_CYAN, colorBlender.cyan);
  writeColorBlenderValues(buf, OFFSET_COLOR_BLENDER_BLUE, colorBlender.blue);
  writeColorBlenderValues(
    buf,
    OFFSET_COLOR_BLENDER_PURPLE,
    colorBlender.purple,
  );
  writeColorBlenderValues(
    buf,
    OFFSET_COLOR_BLENDER_MAGENTA,
    colorBlender.magenta,
  );
}
function writeColorBlenderValues(
  buf: Uint8Array,
  offset: number,
  color: ColorBlenderValues = {},
) {
  const { hue = 0, chroma = 0, brightness = 0 } = color;
  buf[offset] = 0x80 + clamp(hue, -100, 100);
  buf[offset + 1] = 0x80 + clamp(chroma, -100, 100);
  buf[offset + 2] = 0x80 + clamp(brightness, -100, 100);
}
/** Set the color grading of the picture control */
export function writeColorGrading(
  buf: Uint8Array,
  colorGrading: ColorGrading = {},
) {
  writeColorGradingValues(
    buf,
    OFFSET_COLOR_GRADING_HIGHLIGHTS,
    colorGrading.highlights,
  );
  writeColorGradingValues(
    buf,
    OFFSET_COLOR_GRADING_MIDTONE,
    colorGrading.midTone,
  );
  writeColorGradingValues(
    buf,
    OFFSET_COLOR_GRADING_SHADOWS,
    colorGrading.shadows,
  );
  const { blending = 50, balance = 0 } = colorGrading;
  buf[OFFSET_COLOR_GRADING_BLENDING] = 0x80 + clamp(blending, -100, 100);
  buf[OFFSET_COLOR_GRADING_BALANCE] = 0x80 + clamp(balance, -100, 100);
}
function writeColorGradingValues(
  buf: Uint8Array,
  offset: number,
  color: ColorGradingValues = {},
) {
  const { hue = 0, chroma = 0, brightness = 0 } = color;
  const normHue = roundDegree(hue);
  buf[offset] = 0x80 + (normHue >> 8);
  buf[offset + 1] = normHue & 0xff;
  buf[offset + 2] = 0x80 + clamp(chroma, -100, 100);
  buf[offset + 3] = 0x80 + clamp(brightness, -100, 100);
}

export function writeToneCurve(
  buf: Uint8Array,
  toneCurve: ToneCurve = { raw: [], points: [] },
) {
  writeToneCurveRaw(buf, toneCurve.raw);
  writeToneCurvePoints(buf, toneCurve.points);
}
function writeToneCurveRaw(buf: Uint8Array, raw: number[]) {
  const view = new DataView(buf.buffer);
  for (let i = 0; i < raw.length; i++) {
    const value = clamp(raw[i] ?? 0, 0, 32767);
    view.setUint16(OFFSET_TONE_CURVE_RAW + i * 2, value, false);
  }
}
function writeToneCurvePoints(
  buf: Uint8Array,
  points: { x: number; y: number }[],
) {
  const maxPoints = 20; // Maximum number of points
  const pointCount = Math.min(points.length, maxPoints);
  buf[OFFSET_TONE_CURVE_POINTS] = pointCount;
  for (let i = 0; i < pointCount; i++) {
    const point = points[i];
    const offset = OFFSET_TONE_CURVE_POINTS + 1 + i * 2;
    buf[offset] = clamp(point.x, 0, 255);
    buf[offset + 1] = clamp(point.y, 0, 255);
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
function roundDegree(value: number) {
  return ((value % 360) + 360) % 360;
}
