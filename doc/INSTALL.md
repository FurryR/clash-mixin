# 安装

本节主要介绍如何安装 clash-mixin 供 Clash 使用。

- [安装](#安装)
  - [CFW](#cfw)
  - [预生成](#预生成)

## CFW

1. 请在 `Settings->Mixin` 中将 `Type` 调整为 `Javascript`。
2. 点击 `Javascript` 后方的 `Edit`。
3. 将 `src/main.cjs` 的内容复制进去。
4. 安装完成！

## 预生成

1. 请运行 `npm install`。
2. 在 `src/main.cjs` 中，像往常一样配置好您的插件。关于如何配置插件，请参照 [PLUGIN.md](./PLUGIN.md)。
3. 请在 `module.exports = {` 一行前添加以下代码。

   ```javascript
   const _yaml = require('yaml')
   console.log(
     _yaml.stringify(
       await Clash.apply(
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
   ```

4. 运行 `node src/main.cjs > profile.yaml` 来获得处理后的 Clash 配置文件。
