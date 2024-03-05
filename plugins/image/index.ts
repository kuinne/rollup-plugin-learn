import { extname } from "node:path";
import { RollupImagesOptions } from "./types";
import { createFilter } from "@rollup/pluginutils";
import type { Plugin } from "rollup";
import { readFileSync } from "node:fs";
import svgToMiniDataURI from "mini-svg-data-uri";

const defaults: RollupImagesOptions = {
  dom: false,
  exclude: null,
  include: null,
};

const mimeTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};
export default function image(opts: RollupImagesOptions): Plugin {
  const options = Object.assign({}, defaults, opts);

  const filter = createFilter(options.include, options.exclude);

  return {
    name: "image",
    load(id) {
      if (!filter(id)) {
        return null;
      }

      const mime = mimeTypes[extname(id)];

      if (!mime) {
        // not an image
        return null;
      }

      this.addWatchFile(id);
      const isSvg = mime === mimeTypes[".svg"];
      const format = isSvg ? "utf-8" : "base64";
      const source = readFileSync(id, format).replace(/[\r\n]+/gm, "");

      const dataUri = getDataUri({
        format,
        isSvg,
        mime,
        source,
      });

      const code = options.dom
        ? domTemplate({ dataUri })
        : constTemplate({ dataUri });

      return code.trim();
    },
  };
}

function getDataUri({
  format,
  isSvg,
  mime,
  source,
}: {
  format: string;
  isSvg: boolean;
  mime: keyof typeof mimeTypes;
  source: string;
}) {
  return isSvg ? svgToMiniDataURI(source) : `data:${mime};${format},${source}`;
}

const domTemplate = ({ dataUri }) => `
  var img = new Image();
  img.src = "${dataUri}";
  export default img;
`;

const constTemplate = ({ dataUri }) => `
  var img = "${dataUri}";
  export default img;
`;
