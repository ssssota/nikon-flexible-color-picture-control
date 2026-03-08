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
  OFFSET_COMMENT_FLAG_A,
  OFFSET_COMMENT_FLAG_B,
  OFFSET_CONTRAST,
  OFFSET_HIGHLIGHTS,
  OFFSET_MID_RANGE_SHARPENING,
  OFFSET_NAME,
  OFFSET_SATURATION,
  OFFSET_SHADOWS,
  OFFSET_SHARPENING,
  OFFSET_TONE_CURVE_FLAG,
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

type U8Arr = Uint8Array<ArrayBuffer>;

const textEncoder = new TextEncoder();
const BASE_LENGTH = base.length;
const TONE_CURVE_EXTENSION = baseWithToneCurve.slice(BASE_LENGTH);
const MAX_COMMENT_CODE_UNITS = 256;
const TONE_CURVE_SENTINEL_OFFSETS = [
  OFFSET_CONTRAST,
  OFFSET_HIGHLIGHTS,
  OFFSET_SHADOWS,
  OFFSET_WHITE_LEVEL,
  OFFSET_BLACK_LEVEL,
] as const;

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
  comment,
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
}: FlexibleColorPictureControlOptions): U8Arr {
  let ret = new Uint8Array(base);
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
  ret = writeComment(ret, comment, toneCurve ? 0x02 : 0x00);
  if (!toneCurve) return ret;
  ret = appendToneCurveExtension(ret);
  applyToneCurveHeader(ret, comment === undefined || comment.length === 0);
  return writeToneCurve(ret, toneCurve);
}

/** Set the name of the picture control */
function writeName(buf: Uint8Array, name: string) {
  if (name.length > 19) {
    throw new Error("name must be less than 19 characters");
  }
  for (let i = 0; i < name.length; i++) {
    buf[OFFSET_NAME + i] = name.charCodeAt(i);
  }
}
/** Set the sharpning of the picture control */
function writeSharpning(buf: Uint8Array, sharpning = 2) {
  buf[OFFSET_SHARPENING] = 0x80 + clamp(sharpning, -3, 9) * 4;
}
/** Set the mid-range sharpning of the picture control */
function writeMidRangeSharpning(buf: Uint8Array, midRangeSharpning = 1) {
  buf[OFFSET_MID_RANGE_SHARPENING] = 0x80 + clamp(midRangeSharpning, -5, 5) * 4;
}
/** Set the clarity of the picture control */
function writeClarity(buf: Uint8Array, clarity = 0.5) {
  buf[OFFSET_CLARITY] = 0x80 + clamp(clarity, -5, 5) * 4;
}
/** Set the contrast of the picture control */
function writeContrast(buf: Uint8Array, contrast = 0) {
  buf[OFFSET_CONTRAST] = 0x80 + clamp(contrast, -100, 100);
}
/** Set the highlights of the picture control */
function writeHighlights(buf: Uint8Array, highlights = 0) {
  buf[OFFSET_HIGHLIGHTS] = 0x80 + clamp(highlights, -100, 100);
}
/** Set the shadows of the picture control */
function writeShadows(buf: Uint8Array, shadows = 0) {
  buf[OFFSET_SHADOWS] = 0x80 + clamp(shadows, -100, 100);
}
/** Set the white level of the picture control */
function writeWhiteLevel(buf: Uint8Array, whiteLevel = 0) {
  buf[OFFSET_WHITE_LEVEL] = 0x80 + clamp(whiteLevel, -100, 100);
}
/** Set the black level of the picture control */
function writeBlackLevel(buf: Uint8Array, blackLevel = 0) {
  buf[OFFSET_BLACK_LEVEL] = 0x80 + clamp(blackLevel, -100, 100);
}
/** Set the saturation of the picture control */
function writeSaturation(buf: Uint8Array, saturation = 0) {
  buf[OFFSET_SATURATION] = 0x80 + clamp(saturation, -100, 100);
}
/** Set the color blender of the picture control */
function writeColorBlender(buf: Uint8Array, colorBlender: ColorBlender = {}) {
  writeColorBlenderValues(buf, OFFSET_COLOR_BLENDER_RED, colorBlender.red);
  writeColorBlenderValues(buf, OFFSET_COLOR_BLENDER_ORANGE, colorBlender.orange);
  writeColorBlenderValues(buf, OFFSET_COLOR_BLENDER_YELLOW, colorBlender.yellow);
  writeColorBlenderValues(buf, OFFSET_COLOR_BLENDER_GREEN, colorBlender.green);
  writeColorBlenderValues(buf, OFFSET_COLOR_BLENDER_CYAN, colorBlender.cyan);
  writeColorBlenderValues(buf, OFFSET_COLOR_BLENDER_BLUE, colorBlender.blue);
  writeColorBlenderValues(buf, OFFSET_COLOR_BLENDER_PURPLE, colorBlender.purple);
  writeColorBlenderValues(buf, OFFSET_COLOR_BLENDER_MAGENTA, colorBlender.magenta);
}
function writeColorBlenderValues(buf: Uint8Array, offset: number, color: ColorBlenderValues = {}) {
  const { hue = 0, chroma = 0, brightness = 0 } = color;
  buf[offset] = 0x80 + clamp(hue, -100, 100);
  buf[offset + 1] = 0x80 + clamp(chroma, -100, 100);
  buf[offset + 2] = 0x80 + clamp(brightness, -100, 100);
}
/** Set the color grading of the picture control */
function writeColorGrading(buf: Uint8Array, colorGrading: ColorGrading = {}) {
  writeColorGradingValues(buf, OFFSET_COLOR_GRADING_HIGHLIGHTS, colorGrading.highlights);
  writeColorGradingValues(buf, OFFSET_COLOR_GRADING_MIDTONE, colorGrading.midTone);
  writeColorGradingValues(buf, OFFSET_COLOR_GRADING_SHADOWS, colorGrading.shadows);
  const { blending = 50, balance = 0 } = colorGrading;
  buf[OFFSET_COLOR_GRADING_BLENDING] = 0x80 + clamp(blending, -100, 100);
  buf[OFFSET_COLOR_GRADING_BALANCE] = 0x80 + clamp(balance, -100, 100);
}
function writeColorGradingValues(buf: Uint8Array, offset: number, color: ColorGradingValues = {}) {
  const { hue = 0, chroma = 0, brightness = 0 } = color;
  const normHue = roundDegree(hue);
  buf[offset] = 0x80 + (normHue >> 8);
  buf[offset + 1] = normHue & 0xff;
  buf[offset + 2] = 0x80 + clamp(chroma, -100, 100);
  buf[offset + 3] = 0x80 + clamp(brightness, -100, 100);
}
/** Set the comment of the picture control */
function writeComment(buf: U8Arr, comment = "", nextChunkType = 0x00): U8Arr {
  if (comment.length === 0) return buf;
  const payload = encodeComment(comment);
  const ret = new Uint8Array(buf.byteLength + 4 + payload.byteLength + 4);
  ret.set(buf);
  ret[OFFSET_COMMENT_FLAG_A] = 1;
  ret[OFFSET_COMMENT_FLAG_B] = 1;
  new DataView(ret.buffer).setUint32(buf.byteLength, payload.byteLength, false);
  ret.set(payload, buf.byteLength + 4);
  new DataView(ret.buffer).setUint32(buf.byteLength + 4 + payload.byteLength, nextChunkType, false);
  return ret;
}

function writeToneCurve(buf: U8Arr, toneCurve: ToneCurve = { raw: [], points: [] }): U8Arr {
  const toneCurveStart = getToneCurveStart(buf);
  writeToneCurveRaw(buf, toneCurve.raw, toneCurveStart);
  writeToneCurvePoints(buf, toneCurve.points, toneCurveStart);
  return buf;
}
function writeToneCurveRaw(buf: Uint8Array, raw: readonly number[], toneCurveStart: number) {
  const view = new DataView(buf.buffer);
  const offsetDelta = toneCurveStart - BASE_LENGTH;
  for (let i = 0; i < raw.length; i++) {
    const value = clamp(raw[i] ?? 0, 0, 32767);
    view.setUint16(OFFSET_TONE_CURVE_RAW + offsetDelta + i * 2, value, false);
  }
}
function writeToneCurvePoints(
  buf: Uint8Array,
  points: readonly { x: number; y: number }[],
  toneCurveStart: number,
) {
  const maxPoints = 20; // Maximum number of points
  const pointCount = Math.min(points.length, maxPoints);
  const offsetDelta = toneCurveStart - BASE_LENGTH;
  buf[OFFSET_TONE_CURVE_POINTS + offsetDelta] = pointCount;
  for (let i = 0; i < pointCount; i++) {
    const point = points[i];
    const offset = OFFSET_TONE_CURVE_POINTS + offsetDelta + 1 + i * 2;
    buf[offset] = clamp(point.x, 0, 255);
    buf[offset + 1] = clamp(point.y, 0, 255);
  }
}
function appendToneCurveExtension(buf: Uint8Array): U8Arr {
  const ret = new Uint8Array(buf.byteLength + TONE_CURVE_EXTENSION.length);
  ret.set(buf);
  ret.set(TONE_CURVE_EXTENSION, buf.byteLength);
  return ret;
}
function applyToneCurveHeader(buf: Uint8Array, hasNoComment: boolean) {
  for (const offset of TONE_CURVE_SENTINEL_OFFSETS) {
    buf[offset] = 0x01;
  }
  if (hasNoComment) {
    buf[OFFSET_TONE_CURVE_FLAG] = 0x02;
  }
}
function getToneCurveStart(buf: Uint8Array): number {
  const commentPayloadLength = readCommentPayloadLength(buf);
  return commentPayloadLength === undefined
    ? BASE_LENGTH
    : BASE_LENGTH + 4 + commentPayloadLength + 4;
}
function readCommentPayloadLength(buf: Uint8Array): number | undefined {
  if (buf[OFFSET_COMMENT_FLAG_A] !== 1 || buf[OFFSET_COMMENT_FLAG_B] !== 1) {
    return undefined;
  }
  if (buf.byteLength < BASE_LENGTH + 8) return undefined;
  const payloadLength = new DataView(buf.buffer, buf.byteOffset, buf.byteLength).getUint32(
    BASE_LENGTH,
    false,
  );
  if (payloadLength === 0 || payloadLength % 2 !== 0) return undefined;
  return payloadLength;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
function roundDegree(value: number) {
  return ((value % 360) + 360) % 360;
}
function encodeComment(comment: string): U8Arr {
  if (comment.includes("\0")) {
    throw new Error("comment must not contain NUL characters");
  }
  const encoded = textEncoder.encode(trimComment(comment));
  const ret = new Uint8Array(alignToEven(encoded.byteLength + 1));
  ret.set(encoded);
  return ret;
}
function trimComment(comment: string): string {
  if (comment.length <= MAX_COMMENT_CODE_UNITS) return comment;
  let trimmed = comment.slice(0, MAX_COMMENT_CODE_UNITS);
  const lastCodeUnit = trimmed.charCodeAt(trimmed.length - 1);
  // Avoid emitting a dangling high surrogate when trimming by UTF-16 code units.
  if (lastCodeUnit >= 0xd800 && lastCodeUnit <= 0xdbff) {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed;
}
function alignToEven(value: number) {
  return value % 2 === 0 ? value : value + 1;
}
