import { Plugin } from "rollup";
import { RollupBubleOptions } from "./types";
import { createFilter } from "@rollup/pluginutils";
import { TransformOptions, transform } from "buble";

export default function buble(options: RollupBubleOptions = {}): Plugin {
  const filter = createFilter(options.include, options.exclude);
  const transformOptions: TransformOptions = {
    ...options,
    transforms: { ...options.transforms, modules: false },
  };

  return {
    name: "buble",
    transform(code, id) {
      if (!filter(id)) return null;

      try {
        return transform(code, transformOptions);
      } catch (e: any) {
        e.plugin = "buble";
        if (!e.loc) e.loc = {};
        e.loc.file = id;
        e.frame = e.snippet;
        throw e;
      }
    },
  };
}
