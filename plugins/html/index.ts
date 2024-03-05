import type { EmittedAsset, OutputBundle, Plugin } from "rollup";
import { RollupHtmlOptions, RollupHtmlTemplateOptions } from "./types";
import { extname } from "path";

const getFiles = (bundle: OutputBundle): RollupHtmlTemplateOptions["files"] => {
  const result = {} as ReturnType<typeof getFiles>;
  for (const file of Object.values(bundle)) {
    const { fileName } = file;
    const extension = extname(fileName).substring(1);
    result[extension] = (result[extension] || []).concat(file);
  }
  return result;
};
export const makeHtmlAttributes = (attributes: Record<string, any>): string => {
  if (!attributes) {
    return "";
  }
  const keys = Object.keys(attributes);
  return keys.reduce(
    (result, key) => ((result += ` ${key}="${attributes[key]}"`), " ")
  );
};

const defaultTemplate = ({
  attributes,
  files,
  meta,
  publicPath,
  title,
}: RollupHtmlTemplateOptions) => {
  const scripts = (files.js || [])
    .map(({ fileName }) => {
      const attrs = makeHtmlAttributes(attributes.script);
      return `<script src="${publicPath}${fileName}"${attrs}></script>`;
    })
    .join("\n");

  const links = (files.css || [])
    .map(({ fileName }) => {
      const attrs = makeHtmlAttributes(attributes.link);
      return `<link href="${publicPath}${fileName}" rel="stylesheet"${attrs}>`;
    })
    .join("\n");

  const metas = meta
    .map((input) => {
      const attrs = makeHtmlAttributes(input);
      return `<meta${attrs}>`;
    })
    .join("\n");

  return `
   <!doctype html>
<html${makeHtmlAttributes(attributes.html)}>
  <head>
    ${metas}
    <title>${title}</title>
    ${links}
  </head>
  <body>
    ${scripts}
  </body>
</html>`;
};

const supportedFormats = ["es", "esm", "iife", "umd"];

const defaults: RollupHtmlOptions = {
  attributes: {
    link: null,
    html: { lang: "en" },
    script: null,
  },
  fileName: "index.html",
  meta: [{ charset: "utf-8" }],
  publicPath: "",
  template: defaultTemplate,
  title: "Rollup Bundle",
};

export default function html(opts: RollupHtmlOptions = {}): Plugin {
  const { attributes, fileName, meta, publicPath, template, title } =
    Object.assign({}, defaults, opts);
  return {
    name: "html",
    async generateBundle(output, bundle) {
      if (!supportedFormats.includes(output.format) && !opts.template) {
        this.warn(
          `plugin-html: The output format '${
            output.format
          }' is not directly supported. A custom \`template\` is probably required. Supported formats include: ${supportedFormats.join(
            ", "
          )}`
        );
      }
      if (output.format === "es") {
        attributes.script = Object.assign({}, attributes.script, {
          type: "module",
        });
      }
      const files = getFiles(bundle);
      const source = template({
        attributes,
        bundle,
        files,
        meta,
        publicPath,
        title,
      });
      const htmlFile: EmittedAsset = {
        type: "asset",
        source,
        name: "Rollup HTML Asset",
        fileName,
      };
      this.emitFile(htmlFile);
    },
  };
}
