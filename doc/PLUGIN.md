# 插件

本节主要介绍如何添加 clash-mixin 插件。

- [插件](#插件)
  - [位置](#位置)
  - [YAML 混入](#yaml-混入)
  - [JS 混入](#js-混入)

## 位置

在 `src/main.cjs` 中：

```javascript
const Clash = new ClashInstance()

// Clash.use(...) here

module.exports = {
  Mixin,
  YAMLMixin,
  JSMixin,
  ClashInstance,
  Clash,
  parse: Clash.export(),
}
```

请在 `// Clash.use(...) here` 行后，`module.exports = {` 行前添加你的插件代码。

## YAML 混入

clash-mixin 支持混入 YAML，同时还允许指定**混入行为**。

你可以使用 `YAMLMixin` 来创建一个来自 URL 或者内联的 YAML 混入。

```javascript
Clash.use(
  new YAMLMixin(`
rules:
  - 'MATCH, DIRECT'
`),
)
```

注意，在使用 URL 混入时不能直接指定 URL 字符串，需要使用 `new URL("https://...")`，否则 clash-mixin 将会把后面的内容当作内联 YAML。

混入行为可于构造器第二个参数指定，一般是递归调用的，这是因为混入行为回调只会在处理配置文件最顶层的节点时被调用。

```javascript
Clash.use(
  new YAMLMixin(new URL('https://...'), (key, value, new_value) => {
    // key: 键名。
    // value: 原来的值。
    // new_value: mixin 文件中的值。
    return new_value // 返回最终混合的值。
  }),
)
```

默认的混入行为对于基本数据类型成员，将直接以 mixin 中指定的值覆盖原配置中的值。

若遇到数组将会默认在原配置项后追加 mixin 混入的值。

若遇到复杂对象将会遍历 mixin 项下的所有成员，并对它们递归执行混入行为。

## JS 混入

clash-mixin 同样也支持混入多个插件，同时还可以对每个插件指定特别的**配置**（非 CFW 特性）。

你可以使用 `JSMixin` 来创建一个来自 URL 或者内联的 JS 混入。混入插件的格式同 CFW Javascript Mixin。

```javascript
Clash.use(
  new JSMixin(`
module.exports.parse = ({ content, name, url }, { yaml, axios, notify }) => {
  return content
}
`),
)
```

注意，在使用 URL 混入时不能直接指定 URL 字符串，需要使用 `new URL("https://...")`，否则 clash-mixin 将会把后面的内容当作内联 JS。

配置可于构造器第二个参数指定，这将赋值到脚本的 `globalThis.config`，然后脚本就可以读取这个 config。

若使用了 clash-mixin 但未指定 config，此项则会设置为 `null`；若未使用 `clash-mixin` 加载此插件，此项则为 `undefined`。可以用作判断是否使用 clash-mixin。

配置的类型只能为 `Record<string, any>`。

```javascript
Clash.use(
  new JSMixin(
    `
module.exports.parse = ({ content, name, url }, { yaml, axios, notify }) => {
  if (globalThis.config) console.log(1)
  return content
}
`,
    {
      type: 'clash',
    },
  ),
)
```
