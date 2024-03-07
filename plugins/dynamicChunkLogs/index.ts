import { Plugin } from "rollup";
const DYNAMIC_IMPORT_PROXY_PREFIX = "\0dynamic-import:";

export default function dynamicChunkLogs(): Plugin {
  return {
    name: "dynamicChunkLogs",
    async resolveDynamicImport(specifier, importer, options) {
      // 忽略非静态目标
      if (!(typeof specifier === "string")) return;
      // 获取导入目标的id和初始元信息
      const resolved = await this.resolve(specifier, importer);
      if (resolved && !resolved.external) {
        // 我们在这里触发加载模块，
        // 而不等待它，
        // 因为 resolveId 钩子中附加的元信息，
        // 可能包含在 "resolved" 中，
        // 像 "commonjs" 这样的插件可能依赖于它，
        // 只有在第一次加载模块时才会附加到模块上。
        // 这确保了在稍后使用 "this.load" 再次在 load 钩子中使用仅模块 id 时，
        // 不会丢失此元信息。
        this.load(resolved);
        return `${DYNAMIC_IMPORT_PROXY_PREFIX}${resolved.id}`;
      }
    },
    async load(id) {
      if (!id.startsWith(DYNAMIC_IMPORT_PROXY_PREFIX)) return null;
      const actualId = id.slice(DYNAMIC_IMPORT_PROXY_PREFIX.length);
      const moduleInfoPromises = [
        this.load({ id: actualId, resolveDependencies: true }),
      ];
      const dependencies = new Set([actualId]);

      for await (const { importedIdResolutions } of moduleInfoPromises) {
        for (const resolved of importedIdResolutions) {
          if (!dependencies.has(resolved.id)) {
            dependencies.add(resolved.id);
            moduleInfoPromises.push(
              this.load({ ...resolved, resolveDependencies: true })
            );
          }
        }
      }

      let code = `console.log([${[...dependencies]
        .map(JSON.stringify)
        .join(", ")}]); export * from ${JSON.stringify(actualId)};`;
      // 命名空间重新导出不会重新导出默认导出，
      // 因此如果存在默认导出，我们需要手动重新导出它
      if (this.getModuleInfo(actualId).hasDefaultExport) {
        code += `export { default } from ${JSON.stringify(actualId)};`;
      }
      return code;
    },
  };
}
