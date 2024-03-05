import type { Plugin, PluginHooks } from "rollup";

type MapToFunction<T> = T extends Function ? T : never;

export type ResolverFunction = MapToFunction<PluginHooks["resolveId"]>;

export interface ResolverObject {
  buildStart?: PluginHooks["buildStart"];
  resolveId: ResolverFunction;
}

export interface Alias {
  find: string | RegExp;
  replacement: string;
  customResolver?: ResolverFunction | ResolverObject | null;
}

export interface ResolvedAlias {
  find: string | RegExp;
  replacement: string;
  resolverFunction: ResolverFunction | null;
}
export interface RollupAliasOptions {
  customResolver?: ResolverFunction | ResolverObject | null;
  entries?: readonly Alias[] | { [find: string]: string };
}

export default function alias(options?: RollupAliasOptions): Plugin;
