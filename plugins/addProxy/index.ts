import { Plugin } from "rollup";

export default function addProxy(): Plugin {
  return {
    name: "addProxy",
    async resolveId(source, importer, options) {
      if (importer?.endsWith("?proxy")) {
        // 不使用代理的 ID
        return null;
      }

      const resolution = await this.resolve(source, importer, options);
      if (resolution && !resolution.external) {
        const moduleInfo = await this.load(resolution);
        if (moduleInfo.code.includes("/* use proxy */")) {
          return `${resolution.id}?proxy`;
        }
      }
      return resolution;
    },
    load(id) {
      if (id.endsWith("?proxy")) {
        const importee = id.slice(0, -"?proxy".length);

        let code = `console.log('proxy for ${importee}'); export * from ${JSON.stringify(
          importee
        )};`;
        if (this.getModuleInfo(importee).hasDefaultExport) {
          code += `export { default } from ${JSON.stringify(importee)};`;
        }

        return code;
      }
      return null;
    },
  };
}
