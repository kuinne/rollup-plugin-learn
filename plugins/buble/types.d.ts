import { FilterPattern } from "@rollup/pluginutils";
import { TransformOptions } from "buble";

export interface RollupBubleOptions extends TransformOptions {
  include?: FilterPattern;

  exclude?: FilterPattern;
}
