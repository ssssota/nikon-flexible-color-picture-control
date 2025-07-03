import { equal } from "jsr:@std/assert";
import {
  deserialize,
  type FlexibleColorPictureControlOptions,
  serialize,
} from "./mod.ts";

Deno.test("write default, read default", () => {
  const buf = serialize({ name: "test" });
  equal(
    deserialize(buf),
    {
      name: "test",
      sharpning: 2,
      midRangeSharpning: 1,
      clarity: 0.5,
      contrast: 0,
      highlights: 0,
      shadows: 0,
      whiteLevel: 0,
      blackLevel: 0,
      saturation: 0,
      colorBlender: {
        red: { hue: 0, chroma: 0, brightness: 0 },
        orange: { hue: 0, chroma: 0, brightness: 0 },
        yellow: { hue: 0, chroma: 0, brightness: 0 },
        green: { hue: 0, chroma: 0, brightness: 0 },
        cyan: { hue: 0, chroma: 0, brightness: 0 },
        blue: { hue: 0, chroma: 0, brightness: 0 },
        purple: { hue: 0, chroma: 0, brightness: 0 },
        magenta: { hue: 0, chroma: 0, brightness: 0 },
      },
      colorGrading: {
        highlights: { hue: 0, chroma: 0, brightness: 0 },
        midTone: { hue: 0, chroma: 0, brightness: 0 },
        shadows: { hue: 0, chroma: 0, brightness: 0 },
        blending: 50,
        balance: 0,
      },
    } satisfies FlexibleColorPictureControlOptions,
  );
});

Deno.test("write default, read default (with tone curve)", () => {
  const buf = serialize({
    name: "test",
    toneCurve: {
      raw: Array.from({ length: 257 }, (_, i) => i / 256 * 32767),
      points: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
    },
  });
  equal(
    deserialize(buf),
    {
      name: "test",
      sharpning: 2,
      midRangeSharpning: 1,
      clarity: 0.5,
      contrast: 0,
      highlights: 0,
      shadows: 0,
      whiteLevel: 0,
      blackLevel: 0,
      saturation: 0,
      colorBlender: {
        red: { hue: 0, chroma: 0, brightness: 0 },
        orange: { hue: 0, chroma: 0, brightness: 0 },
        yellow: { hue: 0, chroma: 0, brightness: 0 },
        green: { hue: 0, chroma: 0, brightness: 0 },
        cyan: { hue: 0, chroma: 0, brightness: 0 },
        blue: { hue: 0, chroma: 0, brightness: 0 },
        purple: { hue: 0, chroma: 0, brightness: 0 },
        magenta: { hue: 0, chroma: 0, brightness: 0 },
      },
      colorGrading: {
        highlights: { hue: 0, chroma: 0, brightness: 0 },
        midTone: { hue: 0, chroma: 0, brightness: 0 },
        shadows: { hue: 0, chroma: 0, brightness: 0 },
        blending: 50,
        balance: 0,
      },
      toneCurve: {
        raw: Array.from({ length: 257 }, (_, i) => i / 256 * 32767),
        points: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
      },
    } satisfies FlexibleColorPictureControlOptions,
  );
});
