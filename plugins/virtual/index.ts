import { Plugin } from "rollup";
import { RollupVirtualOptions } from "./types";
import path from "path";

const PREFIX = `\0virtual:`;

export default function virtual(modules: RollupVirtualOptions): Plugin {
  const resolveIds = new Map<string, string>();

  Object.keys(modules).forEach((id) => {
    resolveIds.set(path.resolve(id), modules[id]);
  });

  console.log("resolveIds", resolveIds);

  return {
    name: "virtual",
    resolveId(id, importer) {
      if (id in modules) return PREFIX + id;

      if (importer) {
        const importerNoRefix = importer.startsWith(PREFIX)
          ? importer.slice(PREFIX.length)
          : importer;

        const resolved = path.resolve(path.dirname(importerNoRefix), id);

        if (resolveIds.has(resolved)) return PREFIX + resolved;
      }
      return null;
    },
    load(id) {
      if (id.startsWith(PREFIX)) {
        const idNoPrefix = id.slice(PREFIX.length);

        const result =
          idNoPrefix in modules
            ? modules[idNoPrefix]
            : resolveIds.get(idNoPrefix);

        return result;
      }

      return null;
    },
  };
}
