// @ts-check
const vm = require('node:vm')
/**
 * @callback MixinFn 插件导出函数类型。
 * @param {{content: Record<string, any>, name: string, url: string}} config Clash 的配置。
 * @param {{yaml: any, axios: any, notify: any}} dependencies 工具依赖。
 * @returns {Record<string, any> | Promise<Record<string, any>>} 返回的最终配置。
 */
/**
 * 可以接受的 mixin 插件。
 */
class Mixin {
  /**
   * 获取这个插件。
   * @returns {MixinFn} 最终的返回类型。
   */
  export() {
    throw new Error('Not implemented')
  }
}
/**
 *
 * @callback MixinCallback 控制 YAML 插件混合行为的回调。
 * @param {string} key 键名。
 * @param {any} value 值。
 * @param {any} new_value Mixin YAML 的对应配置。
 * @returns {any} 最终混合的结果。
 */
/**
 * YAML 混入。
 */
class YAMLMixin extends Mixin {
  /**
   * @type {URL | string} YAML 的地址，或者内联。
   */
  yaml
  /**
   * @type {MixinCallback} mixin 行为。
   */
  callback
  /**
   * 获取这个插件。
   * @returns {MixinFn} 最终的返回类型。
   */
  export() {
    return async ({ content }, { yaml, axios }) => {
      let data
      if (this.yaml instanceof URL) {
        console.groupCollapsed(`🛠 正在安装 ${this.yaml} [YAML]`)
        try {
          data = (
            await axios.get(this.yaml, {
              responseType: 'text',
            })
          ).data
          
        } catch (e) {
          console.error('❌ 发生下载错误\n', e)
          console.groupEnd()
          throw e
        }
      } else {
        console.groupCollapsed('🛠 正在安装 (内联) [YAML]')
        data = this.yaml
      }
      console.log('📄 下载完成')
      try {
        data = yaml.parse(data)
      } catch (e) {
        console.error('❌ 发生解析时错误\n', e)
        console.groupEnd()
        throw e
      }
      console.groupCollapsed('🔬 安装中')
      for (const [k, v] of Object.entries(data)) {
        content[k] = this.callback(k, content[k], v)
        console.log(`🧪 ${k} 混入完成`)
      }
      console.groupEnd()
      console.log('✅ 安装完成')
      console.groupEnd()
      return content
    }
  }
  /**
   * 从 URL 加载 YAML 文件。
   * @param {URL | string} yaml YAML 文件的 URL，或者内联。
   * @param {?MixinCallback} callback 控制 YAML 插件混合行为的回调。若不指定则使用内置行为。
   */
  constructor(yaml, callback = null) {
    super()
    void ([this.callback, this.yaml] = [
      callback ??
        ((key, value, new_value) => {
          if (typeof value === 'object' && typeof new_value === 'object') {
            if (value instanceof Array && new_value instanceof Array) {
              for (const v of new_value) {
                value.push(v)
              }
            } else {
              for (const [k, v] of Object.entries(new_value)) {
                if (value[k]) {
                  value[k] = this.callback(`${key}/${k}`, value[k], v)
                } else {
                  value[k] = v
                }
              }
            }
          } else return new_value
          return value
        }),
      yaml,
    ])
  }
}
/**
 * JS 插件混入。
 */
class JSMixin extends Mixin {
  /**
   * @type {URL | string} JS 文件的地址，或者内联。
   */
  script
  /**
   * @type {?Record<string, string>} 对于这个插件的配置。将会设置在 globalThis.config 中。
   */
  config
  /**
   * 获取这个插件。
   * @returns {MixinFn} 最终的返回类型。
   */
  export() {
    return async ({ content, name, url }, { yaml, axios, notify }) => {
      let data
      if (this.script instanceof URL) {
        console.groupCollapsed(`🛠 正在安装 ${this.script} [JavaScript]`)
        try {
          data = (
            await axios.get(this.script, {
              responseType: 'text',
            })
          ).data
        } catch (e) {
          console.error('❌ 发生下载错误\n', e)
          console.groupEnd()
          throw e
        }
      } else {
        console.groupCollapsed('🛠 正在安装 (内联) [JavaScript]')
        data = this.script
      }
      console.log('📄 下载完成')
      const ctx = {
        module: {
          exports: {
            /** @type {MixinFn} */
            parse: (p) => p.content,
          },
        },
        config: this.config,
      }
      for (const [k, v] of Object.entries(
        Object.getOwnPropertyDescriptors(globalThis),
      )) {
        if (
          k != 'globalThis' &&
          k != 'module' &&
          k != 'window' &&
          k != 'global'
        )
          Object.defineProperty(ctx, k, v)
      }
      Object.defineProperties(ctx, {
        global: {
          get: () => ctx,
        },
        window: {
          get: () => ctx,
        },
        globalThis: {
          get: () => ctx,
        },
      })
      console.groupCollapsed('🔬 安装中')
      try {
        // eslint-disable-next-line no-unused-vars
        vm.runInNewContext(data, ctx)
      } catch (e) {
        console.groupEnd()
        console.error('❌ 发生解析时错误\n', e)
        console.groupEnd()
        throw e
      }

      try {
        const ret = await ctx.module.exports.parse(
          { content, name, url },
          { yaml, axios, notify },
        )
        console.groupEnd()
        console.log('✅ 安装完成')
        console.groupEnd()
        return ret
      } catch (e) {
        console.groupEnd()
        console.error('❌ 发生运行时错误\n', e)
        console.groupEnd()
        throw e
      }
    }
  }
  /**
   * 构造 JS 插件混入。
   * @param {URL | string} script JS 文件的地址，或者内联。
   * @param {?Record<string, any>} config 对于这个插件的配置。将会设置在 globalThis.config 中。
   */
  constructor(script, config = null) {
    super()
    this.script = script
    this.config = config
  }
}
/**
 *
 */
class ClashInstance {
  /**
   * @type {MixinFn} 最终使用的函数。
   */
  fn
  /**
   * 添加一个 Mixin。
   * @param {Mixin} mixin 混入参数
   */
  use(mixin) {
    const _fn = this.fn
    this.fn = async ({ content, name, url }, { yaml, axios, notify }) => {
      content = await _fn({ content, name, url }, { yaml, axios, notify })
      return await mixin.export()(
        { content, name, url },
        { yaml, axios, notify },
      )
    }
  }
  /**
   * 导出最终的 Mixin。
   * @returns {MixinFn} Mixin 函数。
   */
  export() {
    return async ({ content, name, url }, { yaml, axios, notify }) => {
      return await this.apply({ content, name, url }, { yaml, axios, notify })
    }
  }
  /**
   * 实际使用 Mixin。返回一个 Object。
   * @param {{content: Record<string, any>, name: string, url: string}} param0 Clash 的配置。
   * @param {{yaml: any, axios: any, notify: any}} param1 工具依赖。
   * @returns {Promise<Record<string, any>>} 最终的配置。
   */
  async apply({ content, name, url }, { yaml, axios, notify }) {
    console.groupCollapsed(
      '[clash-mixin] 💙 请手动展开来查看日志。项目地址: https://github.com/FurryR/clash-mixin',
    )
    try {
      const ret = await this.fn({ content, name, url }, { yaml, axios, notify })
      console.log('💫 完成！')
      console.groupEnd()
      return ret
    } catch (e) {
      console.error('❌ 加载失败。\n', e)
      console.error('🔍 请检查最后一个安装的插件。')
      console.groupEnd()
      throw '[clash-mixin] ❌ 发生错误，请检查 DevTools 来获得更多信息'
    }
  }
  constructor() {
    this.fn = (p) => p.content
  }
}
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
