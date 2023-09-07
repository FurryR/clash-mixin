# clash-mixin

一个适用于 Clash 的 mixin 管理器，允许你以优雅的方式添加插件。

- [clash-mixin](#clash-mixin)
  - [功能](#功能)
  - [支持](#支持)
  - [如何安装](#如何安装)
  - [开发者文档](#开发者文档)
  - [赞助](#赞助)

## 功能

- [x] 从 URL 加载 YAML mixin 并指定覆盖行为
- [x] 从 URL 加载 Javascript mixin (格式请参见 CFW)
- [x] 在不支持 Mixin 的代理上，预先生成配置文件

## 支持

- [x] Clash For Windows: 提供最佳的原生支持！请在设置中将 Mixin 类型设置为 Javascript。
- [x] 其它: 即使无法原生支持，仍然可以使用预先生成配置文件。

## 如何安装

对于 CFW：

1. 请将设置中的 Mixin 改为 Javascript。
2. 将你自行编写的 main.js 复制到 Mixin 内，然后重新加载配置文件。

对于其它 Clash 客户端：

请将以下代码变更到 `src/main.js` 内：

```js
const Clash = new ClashInstance()

// Clash.use(...) here

// 你的插件代码放在这里

// 插件结束

const _yaml = require('yaml')
console.log(
  _yaml.stringify(
    Clash.apply(
      {
        content: _yaml.parse(
          require('fs').readFileSync('Clash 配置文件名').toString('UTF-8'),
        ),
        name: '',
        url: '',
      },
      {
        yaml: _yaml,
        axios: require('axios').default,
        apply: () => {},
      },
    ),
  ),
)

// module.exports.parse = Clash.export() // 注释掉这句
```

然后运行 `node src/main.js` 即可获得最终的配置文件。

## 开发者文档

正在努力编写！

## 赞助

如果真的很喜欢这个项目，第一推荐是为这个项目做些力所能及的贡献。

如果并不会写 Javascript，也可以尝试通过 [爱发电](https://afdian.net/a/FurryR/plan) 赞助我。

这是我第一次摆上赞助链接。并不期望能通过这些赚日常喝咖啡的钱，只希望软件能够帮助到他人。
