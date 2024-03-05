/**
 * @type {import('rollup').RollupOptions}
 */

import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const getAbsolutePath = (relativePath) => {
  return fileURLToPath(new URL(relativePath), import.meta.url);
};

const packageJson = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url))
);

export default {
  input: "./index.js",
  output: [
    {
      file: "dist/index.cjs.js",
      format: "cjs",
    },
    {
      file: "dist/index.es.js",
      format: "es",
    },
  ],
};
