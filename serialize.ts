import { base } from "./base.ts";
import type {
  ColorBlender,
  ColorBlenderValues,
  ColorGrading,
  ColorGradingValues,
  FlexibleColorPictureControlOptions,
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
}: FlexibleColorPictureControlOptions): Uint8Array {
  const ret = new Uint8Array(base);
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
  return ret;
}

/** Set the name of the picture control */
export function writeName(buf: Uint8Array, name: string) {
  if (name.length > 19) {
    throw new Error("name must be less than 19 characters");
  }
  for (let i = 0; i < name.length; i++) {
    buf[0x18 + i] = name.charCodeAt(i);
  }
}
/** Set the sharpning of the picture control */
export function writeSharpning(buf: Uint8Array, sharpning = 2) {
  buf[0x52] = 0x80 + clamp(sharpning, -3, 9) * 4;
}
/** Set the mid-range sharpning of the picture control */
export function writeMidRangeSharpning(buf: Uint8Array, midRangeSharpning = 1) {
  buf[0xf2] = 0x80 + clamp(midRangeSharpning, -5, 5) * 4;
}
/** Set the clarity of the picture control */
export function writeClarity(buf: Uint8Array, clarity = 0.5) {
  buf[0x5c] = 0x80 + clamp(clarity, -5, 5) * 4;
}
/** Set the contrast of the picture control */
export function writeContrast(buf: Uint8Array, contrast = 0) {
  buf[0x110] = 0x80 + clamp(contrast, -100, 100);
}
/** Set the highlights of the picture control */
export function writeHighlights(buf: Uint8Array, highlights = 0) {
  buf[0x11a] = 0x80 + clamp(highlights, -100, 100);
}
/** Set the shadows of the picture control */
export function writeShadows(buf: Uint8Array, shadows = 0) {
  buf[0x124] = 0x80 + clamp(shadows, -100, 100);
}
/** Set the white level of the picture control */
export function writeWhiteLevel(buf: Uint8Array, whiteLevel = 0) {
  buf[0x12e] = 0x80 + clamp(whiteLevel, -100, 100);
}
/** Set the black level of the picture control */
export function writeBlackLevel(buf: Uint8Array, blackLevel = 0) {
  buf[0x138] = 0x80 + clamp(blackLevel, -100, 100);
}
/** Set the saturation of the picture control */
export function writeSaturation(buf: Uint8Array, saturation = 0) {
  buf[0x142] = 0x80 + clamp(saturation, -100, 100);
}
/** Set the color blender of the picture control */
export function writeColorBlender(
  buf: Uint8Array,
  colorBlender: ColorBlender = {},
) {
  writeColorBlenderValues(buf, 0x14c, colorBlender.red);
  writeColorBlenderValues(buf, 0x14f, colorBlender.orange);
  writeColorBlenderValues(buf, 0x152, colorBlender.yellow);
  writeColorBlenderValues(buf, 0x155, colorBlender.green);
  writeColorBlenderValues(buf, 0x158, colorBlender.cyan);
  writeColorBlenderValues(buf, 0x15b, colorBlender.blue);
  writeColorBlenderValues(buf, 0x15e, colorBlender.purple);
  writeColorBlenderValues(buf, 0x161, colorBlender.magenta);
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
  writeColorGradingValues(buf, 0x170, colorGrading.highlights);
  writeColorGradingValues(buf, 0x174, colorGrading.midTone);
  writeColorGradingValues(buf, 0x178, colorGrading.shadows);
  const { blending = 50, balance = 0 } = colorGrading;
  buf[0x180] = 0x80 + clamp(blending, -100, 100);
  buf[0x182] = 0x80 + clamp(balance, -100, 100);
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
function roundDegree(value: number) {
  return ((value % 360) + 360) % 360;
}
