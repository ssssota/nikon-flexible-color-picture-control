import { writeFileSync } from "node:fs";

const template = {
  name: "@ssssota/nikon-flexible-color-picture-control",
  version: "0.0.0",
  exports: {
    ".": "./src/mod.ts",
  },
  publish: {
    include: ["jsr.json", "LICENSE", "README.md", "src/**/*.ts"],
    exclude: ["src/**/*.test.ts"],
  },
};

const version = process.env.npm_package_version;
if (version) {
  template.version = version;
}

writeFileSync("jsr.json", JSON.stringify(template, null, 2));
