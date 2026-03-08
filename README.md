# Nikon flexible color picture control reader/writer

This is a simple library to read and write
[Nikon flexible color picture control](https://www.nikon-image.com/sp/fcpc/)
(NP3) file. It is written in TypeScript with no dependencies, and published at
jsr.

## Installation

```sh
# npm
npx jsr add @ssssota/flexible-color-picture-control
# deno
deno add @ssssota/flexible-color-picture-control
```

## Usage

```ts
import { deserialize, serialize } from "@ssssota/flexible-color-picture-control";

const buf = serialize({
  name: "sample",
  comment: "sample",
  contrast: 20,
  toneCurve: {
    raw: Array.from({ length: 257 }, (_, i) => (i / 256) * 32767),
    points: [
      { x: 0, y: 0 },
      { x: 255, y: 255 },
    ],
  },
});

const pictureControl = deserialize(buf);
console.log(pictureControl.contrast);
```

## Supported features

- [x] Advanced Settings
  - [x] Sharpening
  - [x] Mid-range sharpening
  - [x] Clarity
  - [x] Custom Tone Curve
    - [x] Deserialize
    - [x] Serialize
  - [x] Contrast
  - [x] Highlights
  - [x] Shadows
  - [x] White Level
  - [x] Black Level
  - [x] Saturation
- [x] Color Blender
  - [x] Hue
  - [x] Chroma
  - [x] Brightness
- [x] Color Grading
  - [x] Hue
  - [x] Chroma
  - [x] Brightness
  - [x] Blending
  - [x] Balance
- [x] Comments (UTF-8, up to 256 characters)
