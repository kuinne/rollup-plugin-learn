import type { FilterPattern } from "@rollup/pluginutils";

export type Replacement = string | ((id: string) => string);
export interface RollupReplaceOptions {
  [str: string]:
    | Replacement
    | RollupReplaceOptions["include"]
    | RollupReplaceOptions["preventAssignment"]
    | RollupReplaceOptions["values"];

  include?: FilterPattern;
  exclude?: FilterPattern;
  sourceMap?: boolean;

  delimiters?: [string, string];

  /** 防止当出现等号两边相等时，是否还要替换 */
  preventAssignment?: boolean;

  values?: { [str: string]: Replacement };
}
