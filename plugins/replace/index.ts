import type { Plugin, SourceDescription } from "rollup";
import { Replacement, RollupReplaceOptions } from "./types";
import { createFilter } from "@rollup/pluginutils";
import MagicString from "magic-string";

export default function replace(options: RollupReplaceOptions): Plugin {
  const filter = createFilter(options.include, options.exclude);

  const { delimiters = ["\\b", "\\b(?!\\.)"], preventAssignment } = options;
  const replacements = getReplacements(options);
  const functionValues = mapToFunctions(replacements);
  const keys = Object.keys(functionValues).sort(longest).map(escape);
  const lookahead = preventAssignment ? "(?!\\s*(=[^=]|:[^:]))" : "";
  const pattern = new RegExp(
    `${delimiters[0]}(${keys.join("|")})${delimiters[1]}${lookahead}`,
    "g"
  );

  return {
    name: "replace",
    buildStart() {
      if (![true, false].includes(preventAssignment)) {
        this.warn({
          message:
            "@rollup/plugin-replace: 'preventAssignment' currently defaults to false,It is recommended to set this option to `true`, as the next major version will default this option to `true`. ",
        });
      }
    },
    transform(code, id) {
      if (!keys.length) return null;
      if (!filter(id)) return null;
      return executeReplacement(code, id);
    },
    // 了替换结果更加准确，在 renderChunk 钩子中又进行了一次替换，因为后续的插件仍然可能在 transform 中进行模块内容转换
    // @ts-ignore
    renderChunk(code, chunk) {
      const id = chunk.fileName;
      if (!keys.length) return null;
      if (!filter(id)) return null;
      return executeReplacement(code, id);
    },
  };
  function executeReplacement(code: string, id: string) {
    const magicString = new MagicString(code);

    if (!codeHasReplacement(code, id, magicString)) {
      return null;
    }

    const result: Partial<Pick<SourceDescription, "code" | "map">> = {
      code: magicString.toString(),
    };
    if (isSourceMapEnabled()) {
      result.map = magicString.generateMap({ hires: true });
    }

    return result;
  }

  function codeHasReplacement(
    code: string,
    id: string,
    magicString: MagicString
  ) {
    let result = false;
    let match;

    while ((match = pattern.exec(code))) {
      result = true;

      const start = match.index;
      const end = start + match[0].length;
      const replacement = String(functionValues[match[1]](id));

      magicString.overwrite(start, end, replacement);
    }
    return result;
  }

  function getReplacements(options: RollupReplaceOptions) {
    if (options.values) {
      return Object.assign({}, options.values);
    }
    const values = Object.assign({}, options);
    delete values.delimiters;
    delete values.include;
    delete values.exclude;
    delete values.sourceMap;
    return values;
  }

  function mapToFunctions(object: any) {
    return Object.keys(object).reduce((fns, key) => {
      const functions = Object.assign({}, fns);
      functions[key] = ensureFunction(object[key]);
      return functions;
    }, {});
  }

  function ensureFunction(functionOrValue: any) {
    if (typeof functionOrValue === "function") return functionOrValue;
    return () => functionOrValue;
  }

  function longest(a: string, b: string) {
    return b.length - a.length;
  }

  function escape(str: string) {
    return str.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
  }

  function isSourceMapEnabled() {
    return options.sourceMap !== false && options.sourcemap !== false;
  }
}
