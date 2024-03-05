import  type { FilterPattern } from "@rollup/pluginutils"

export interface RollupImagesOptions {
    dom?: boolean,
    exclude?: FilterPattern
    include?: FilterPattern
  }