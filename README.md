## API

- `this.resolve`: 用于解析模块的导入路径
- `this.load`: 用于加载指定模块的内容
- `renderChunk`: 用于在生成 bundle 文件时对每个 chunk 进行定制化的渲染处理
- `generateBundle`: 产物生成的最后一步，用于自定义删除 chunk 或添加一些文件(要产出其他文件，请使用 this.emitFile 插件上下文函数。)

## 类定义

### `ModuleInfo`

```ts
interface ModuleInfo {
  id: string; // 模块的 ID，方便使用
  code: string | null; // 模块的源代码，如果是外部模块或尚未可用，则为 `null`
  ast: ESTree.Program; // 如果可用，则为解析的抽象语法树
  hasDefaultExport: boolean | null; // 是否有默认导出，如果是外部模块或尚未可用，则为 `null`
  isEntry: boolean; // 是否为用户或插件定义的入口点
  isExternal: boolean; // 对于被引用但未包含在图形中的外部模块
  isIncluded: boolean | null; // 是否除屑优化后包含模块，如果是外部模块或尚未可用，则为 `null`
  importedIds: string[]; // 由此模块静态导入的模块 ID
  importedIdResolutions: ResolvedId[]; // 静态导入 ID 的解析方式，用于 this.load
  importers: string[]; // 静态导入此模块的所有模块的 ID
  exportedBindings: Record<string, string[]> | null; // 包含与 `from` 路径相关的所有导出变量，如果是外部模块，则为 `null`
  exports: string[] | null; // 所有导出变量，如果是外部模块，则为 `null`
  dynamicallyImportedIds: string[]; // 通过动态 import() 导入此模块的模块 ID
  dynamicallyImportedIdResolutions: ResolvedId[]; // 动态 import() 导入的 ID 的解析方式
  dynamicImporters: string[]; // 动态导入此模块的所有模块的 ID
  implicitlyLoadedAfterOneOf: string[]; // 隐式关系，通过 this.emitFile 声明
  implicitlyLoadedBefore: string[]; // 隐式关系，通过 this.emitFile 声明
  attributes: { [key: string]: string }; // 此模块的导入属性
  meta: { [plugin: string]: any }; // 自定义模块元数据
  moduleSideEffects: boolean | "no-treeshake"; // 如果未从中导入任何内容，则是否包含此模块的导入
  syntheticNamedExports: boolean | string; // 合成命名导出的最终值
}
```

### `ResolveId`

```ts
interface ResolvedId {
  id: string; // 导入模块的 ID
  external: boolean | "absolute"; // 此模块是否为外部模块，“absolute”表示它不会在模块中呈现为相对路径
  attributes: { [key: string]: string }; // 此导入的导入属性
  meta: { [plugin: string]: any }; // 解析模块时的自定义模块元数据
  moduleSideEffects: boolean | "no-treeshake"; // 是否观察到模块的副作用，是否启用了除屑优化
  resolvedBy: string; // 哪个插件解析了此模块，如果由 Rollup 自身解析，则为“rollup”
  syntheticNamedExports: boolean | string; // 模块是否允许导入不存在的命名导出
}
```
