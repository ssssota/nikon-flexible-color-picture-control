import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { deserialize, serialize } from "../src/mod.ts";
import type { FlexibleColorPictureControl, ToneCurve } from "../src/types.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type SampleCase = {
  fileName: string;
  expected: FlexibleColorPictureControl;
};

const LINEAR_TONE_CURVE: ToneCurve = {
  raw: Array.from({ length: 257 }, (_, i) => Math.round((i * 32767) / 256)),
  points: [
    { x: 0, y: 0 },
    { x: 128, y: 128 },
    { x: 255, y: 255 },
  ],
};

const BLACK_TONE_CURVE: ToneCurve = {
  raw: [...Array.from({ length: 254 }, () => 0), 127, 16399, 32767],
  points: [
    { x: 0, y: 0 },
    { x: 253, y: 0 },
    { x: 255, y: 255 },
  ],
};

const WHITE_TONE_CURVE: ToneCurve = {
  raw: [0, 16368, 32640, ...Array.from({ length: 254 }, () => 32767)],
  points: [
    { x: 0, y: 0 },
    { x: 2, y: 255 },
    { x: 255, y: 255 },
  ],
};

const MAX_POINT_TONE_CURVE: ToneCurve = {
  raw: parseU16Csv(`
    0,164,328,491,652,813,971,1127,1280,1431,1578,1723,1865,2006,2144,2281,
    2417,2551,2684,2817,2949,3081,3212,3343,3473,3602,3730,3857,3983,4108,4232,4354,
    4475,4595,4715,4835,4956,5079,5204,5332,5464,5600,5740,5886,6037,6194,6354,6515,
    6677,6837,6995,7148,7295,7435,7568,7695,7817,7934,8049,8161,8271,8382,8493,8605,
    8721,8839,8962,9090,9224,9361,9502,9645,9790,9935,10080,10224,10366,10506,10642,10775,
    10905,11031,11153,11270,11384,11493,11597,11696,11791,11880,11964,12045,12124,12202,12280,12359,
    12441,12527,12618,12714,12818,12931,13053,13184,13323,13467,13614,13763,13911,14058,14200,14337,
    14466,14586,14697,14799,14894,14984,15070,15153,15234,15316,15398,15484,15573,15668,15770,15879,
    15999,16128,16269,16418,16575,16738,16905,17074,17245,17415,17583,17747,17905,18057,18201,18339,
    18470,18595,18716,18833,18946,19057,19166,19273,19380,19487,19594,19704,19815,19928,20044,20162,
    20282,20405,20532,20661,20794,20930,21069,21213,21360,21511,21666,21825,21986,22150,22316,22482,
    22650,22817,22984,23150,23314,23476,23635,23791,23943,24091,24235,24376,24512,24645,24775,24902,
    25026,25148,25267,25384,25498,25611,25722,25832,25940,26047,26153,26259,26363,26468,26572,26676,
    26780,26884,26988,27091,27196,27300,27405,27510,27616,27722,27830,27938,28046,28156,28267,28379,
    28492,28606,28722,28838,28956,29075,29195,29317,29440,29565,29691,29819,29948,30078,30211,30344,
    30479,30616,30754,30893,31033,31174,31316,31458,31602,31746,31891,32036,32182,32328,32474,32620,32767
  `),
  points: [
    { x: 0, y: 0 },
    { x: 8, y: 10 },
    { x: 19, y: 22 },
    { x: 31, y: 34 },
    { x: 43, y: 46 },
    { x: 52, y: 57 },
    { x: 66, y: 70 },
    { x: 76, y: 81 },
    { x: 88, y: 92 },
    { x: 101, y: 101 },
    { x: 112, y: 113 },
    { x: 128, y: 125 },
    { x: 140, y: 140 },
    { x: 154, y: 153 },
    { x: 168, y: 167 },
    { x: 183, y: 186 },
    { x: 203, y: 205 },
    { x: 220, y: 219 },
    { x: 236, y: 234 },
    { x: 255, y: 255 },
  ],
};

const LONGEST_COMMENT = "0123456789".repeat(25) + "012345";
const LONGEST_COMMENT_JP = "あいうえおかきくけこさしすせそたちつてと".repeat(13).slice(0, 256);

const SAMPLE_CASES: readonly SampleCase[] = [
  { fileName: "vanilla.NP3", expected: createExpected("vanilla") },
  { fileName: "comment-a.NP3", expected: createExpected("comment-a", { comment: "a" }) },
  { fileName: "comment-ab.NP3", expected: createExpected("comment-ab", { comment: "ab" }) },
  {
    fileName: "comment-abcde.NP3",
    expected: createExpected("comment-abcde", { comment: "abcde" }),
  },
  {
    fileName: "comment-hello-in-jp.NP3",
    expected: createExpected("comment-hello-in-jp", { comment: "こんにちは" }),
  },
  {
    fileName: "longest-comment.NP3",
    expected: createExpected("longest-comment", { comment: LONGEST_COMMENT }),
  },
  {
    fileName: "longest-comment-jp.NP3",
    expected: createExpected("longest-comment-jp", { comment: LONGEST_COMMENT_JP }),
  },
  {
    fileName: "tonecurve-noop.NP3",
    expected: createExpected("tonecurve-noop", { toneCurve: LINEAR_TONE_CURVE }),
  },
  {
    fileName: "comment-a-tonecurve.NP3",
    expected: createExpected("comment-a-tonecurve", {
      comment: "a",
      toneCurve: LINEAR_TONE_CURVE,
    }),
  },
  {
    fileName: "tonecurve-black.NP3",
    expected: createExpected("tonecurve-black", { toneCurve: BLACK_TONE_CURVE }),
  },
  {
    fileName: "tonecurve-white.NP3",
    expected: createExpected("tonecurve-white", { toneCurve: WHITE_TONE_CURVE }),
  },
  {
    fileName: "tonecurve-max-point.NP3",
    expected: createExpected("tonecurve-max-point", { toneCurve: MAX_POINT_TONE_CURVE }),
  },
];

for (const { fileName, expected } of SAMPLE_CASES) {
  const sample = readSample(fileName);
  void test(`deserialize ${fileName}`, () => {
    assert.deepStrictEqual(deserialize(sample), expected);
  });

  void test(`serialize ${fileName}`, () => {
    assert.deepStrictEqual(serialize(expected), sample);
  });
}

function createExpected(
  name: string,
  {
    comment,
    toneCurve,
  }: {
    comment?: string;
    toneCurve?: ToneCurve;
  } = {},
): FlexibleColorPictureControl {
  return {
    name,
    comment,
    sharpning: 2,
    midRangeSharpning: 1,
    clarity: 0.5,
    contrast: 0,
    highlights: 0,
    shadows: 0,
    whiteLevel: 0,
    blackLevel: 0,
    saturation: 0,
    colorBlender: createDefaultColorBlender(),
    colorGrading: createDefaultColorGrading(),
    toneCurve,
  };
}

function createDefaultColorBlender(): FlexibleColorPictureControl["colorBlender"] {
  return {
    red: { hue: 0, chroma: 0, brightness: 0 },
    orange: { hue: 0, chroma: 0, brightness: 0 },
    yellow: { hue: 0, chroma: 0, brightness: 0 },
    green: { hue: 0, chroma: 0, brightness: 0 },
    cyan: { hue: 0, chroma: 0, brightness: 0 },
    blue: { hue: 0, chroma: 0, brightness: 0 },
    purple: { hue: 0, chroma: 0, brightness: 0 },
    magenta: { hue: 0, chroma: 0, brightness: 0 },
  };
}

function createDefaultColorGrading(): FlexibleColorPictureControl["colorGrading"] {
  return {
    highlights: { hue: 0, chroma: 0, brightness: 0 },
    midTone: { hue: 0, chroma: 0, brightness: 0 },
    shadows: { hue: 0, chroma: 0, brightness: 0 },
    blending: 50,
    balance: 0,
  };
}

function parseU16Csv(values: string): readonly number[] {
  return values
    .trim()
    .split(/\s*,\s*/u)
    .map((value) => Number.parseInt(value, 10));
}

function readSample(fileName: string): Uint8Array<ArrayBuffer> {
  const filePath = path.resolve(__dirname, `../samples/${fileName}`);
  const buffer = fs.readFileSync(filePath);
  return Uint8Array.from(buffer);
}
