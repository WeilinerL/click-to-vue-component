import type ChainableWebpackConfig = require('webpack-chain')
import { getAvailablePort } from './port'

/**
 * 快速定位Vue组件源码
 *
 * @export
 * @param {ChainableWebpackConfig} config
 * @param {{
 *   console: boolean
 * }} [options]
 */
export default function (config: ChainableWebpackConfig, options?: {
  console: boolean
}) {
  if (process.env.NODE_ENV !== 'development') {
    return
  }
  global.__vueSourceCodeLocWsPort = getAvailablePort()
  // 解析template
  config.module
    .rule('click-to-vue-component-template')
    .test(/\.vue$/)
    .after('click-to-vue-component-script')
    .exclude.add(/node_modules/)
    .end()
    .use('click-to-vue-component/dist/loader')
    .loader('click-to-vue-component/dist/loader')
    .end()
  if (options?.console !== false) {
    // 解析script
    config.module
      .rule('click-to-vue-component-script')
      .test(/\.vue$/)
      .pre()
      .exclude.add(/node_modules/)
      .end()
      .use('click-to-vue-component/dist/js-loader')
      .loader('click-to-vue-component/dist/js-loader')
      .end()
    // 解析js中的console日志
    config.module
      .rule('click-to-vue-component-js')
      .test(/\.(js|ts)$/)
      .pre()
      .exclude.add(/node_modules|\.vue$/)
      .end()
      .use('click-to-vue-component/dist/js-loader')
      .loader('click-to-vue-component/dist/js-loader')
      .end();
    }
  config.module
    .rule('click-to-vue-component-inject-js')
    .test(/\.(js|ts)$/)
    .pre()
    .exclude.add(/node_modules/)
    .end()
    .use('click-to-vue-component/dist/inject-loader')
    .loader('click-to-vue-component/dist/inject-loader')
    .end(); 
  config
    .plugin('clickToVueComponentPlugin')
    .use('click-to-vue-component/dist/plugin')
}
