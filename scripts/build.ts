import {
  InputOptions,
  OutputOptions,
  RollupBuild,
  RollupOptions,
  rollup,
} from "rollup";
import { resolve } from "node:path";
import alias from "../plugins/alias";
import image from "../plugins/image";
import replace from "../plugins/replace";
import html from "../plugins/html";
import virtual from "../plugins/virtual";
import buble from "../plugins/buble";
import addProxy from "../plugins/addProxy";
import dynamicChunkLogs from "../plugins/dynamicChunkLogs";
import injectPolyfillProxy from "../plugins/injectPolyfillProxy";
import nodeResolve from "@rollup/plugin-node-resolve";

const customResolver = nodeResolve({
  extensions: [".mjs", ".js", ".jsx", ".json", ".sass", ".scss"],
});

const inputOptions: InputOptions = {
  input: resolve(__dirname, "../index.js"),
  plugins: [
    alias({
      entries: [
        {
          find: "moduleA",
          replacement: "./moduleA.js",
          // customResolver
        },
      ],
    }),
    image({}),
    replace({
      "process.env.NODE_ENV": JSON.stringify("production"),
      __buildDate__: () => JSON.stringify(new Date()),
      preventAssignment: true,
    }),
    html(),
    virtual({
      batman: `export default 'na na na na'`,
      "../src/robin.js": `export default 'batmannnn'`,
    }),
    buble(),
    addProxy(),
    dynamicChunkLogs(),
    injectPolyfillProxy(),
  ],
};

const outputOptionsList: OutputOptions[] = [
  {
    // file: resolve(__dirname, "../dist/index.cjs.js"),
    dir: resolve(__dirname, "../dist"),
    format: "cjs",
  },
];

export async function build() {
  let bundle: RollupBuild;
  let buildFailed = false;

  try {
    bundle = await rollup(inputOptions);

    console.log(bundle.watchFiles);

    await generateOutputs(bundle);
  } catch (error) {
    buildFailed = true;
    console.error(error);
  }

  if (bundle) {
    await bundle.close();
  }
}

async function generateOutputs(bundle: RollupBuild) {
  for (const outputOptions of outputOptionsList) {
    const { output } = await bundle.generate(outputOptions);

    for (const chunkOrAsset of output) {
      if (chunkOrAsset.type === "asset") {
        // 对于资源文件，它包含：
        // {
        //   fileName: string,              // 资源文件名
        //   source: string | Uint8Array    // 资源文件内容
        //   type: 'asset'                  // 标志它是一个资源文件
        // }
      } else {
        // 对于 chunk，它包含以下内容：
        // {
        //   code: string,                  // 生成的 JS 代码
        //   dynamicImports: string[],      // 此 chunk 动态导入的外部模块
        //   exports: string[],             // 导出的变量名
        //   facadeModuleId: string | null, // 与此 chunk 对应的模块的 ID
        //   fileName: string,              // chunk 文件名
        //   implicitlyLoadedBefore: string[]; // 仅在此 chunk 后加载的条目
        //   imports: string[],             // 此 chunk 静态导入的外部模块
        //   importedBindings: {[imported: string]: string[]} // 每个依赖项的导入绑定
        //   isDynamicEntry: boolean,       // 此 chunk 是否为动态入口点
        //   isEntry: boolean,              // 此 chunk 是否为静态入口点
        //   isImplicitEntry: boolean,      // 是否应在其他 chunk 之后仅加载此 chunk
        //   map: string | null,            // 如果存在，则为源映射
        //   modules: {                     // 此 chunk 中模块的信息
        //     [id: string]: {
        //       renderedExports: string[]; // 包含的导出变量名
        //       removedExports: string[];  // 已删除的导出变量名
        //       renderedLength: number;    // 此模块中剩余代码的长度
        //       originalLength: number;    // 此模块中代码的原始长度
        //       code: string | null;       // 此模块中的剩余代码
        //     };
        //   },
        //   name: string                   // 用于命名模式的此 chunk 的名称
        //   preliminaryFileName: string    // 此 chunk 带有哈希占位符的初始文件名
        //   referencedFiles: string[]      // 通过 import.meta.ROLLUP_FILE_URL_<id> 引用的文件
        //   type: 'chunk',                 // 表示这是一个 chunk
        // }
        // console.log("Chunk", chunkOrAsset.modules);
      }
    }
    await bundle.write(outputOptions);
  }
}
