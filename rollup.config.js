const path = require('path')
// 将json 文件转换为ES6 模块
const json = require('@rollup/plugin-json')
const ts = require('rollup-plugin-typescript2')
// 在node_模块中查找并绑定第三方依赖项（将第三方依赖打进包里）
const resolve = require('@rollup/plugin-node-resolve')
// 将CommonJS模块转换为ES6
const commonjs = require('@rollup/plugin-commonjs')

const extensions = ['.ts']
const generateConfig = (input, output, external = [], plugins = []) => {
  return {
    input,
    output,
    external,
    plugins: [
      resolve(), //快速查找外部模块
      commonjs(), //将CommonJS转换为ES6模块
      json(), //将json转换为ES6模块
      ts({
        //ts编译插件
        tsconfig: path.resolve(__dirname, './tsconfig.json'),
        extensions,
      }),
      ...plugins,
    ],
  }
}

const configList = [
  generateConfig(path.resolve('./src/index.ts'), {
    file: './dist/index.js',
    format: 'cjs',
    sourcemap: false,
  }),
  generateConfig(path.resolve('./src/loader.ts'), {
    file: './dist/loader.js',
    format: 'cjs',
    sourcemap: false,
  }, ['parse5', 'crypto-js']),
  generateConfig(path.resolve('./src/js-loader.ts'), {
    file: './dist/js-loader.js',
    format: 'cjs',
    sourcemap: false,
  }),
  generateConfig(path.resolve('./src/inject-loader.ts'), {
    file: './dist/inject-loader.js',
    format: 'cjs',
    sourcemap: false,
  }),
  generateConfig(path.resolve('./src/plugin.ts'), {
    file: './dist/plugin.js',
    format: 'cjs',
    sourcemap: false,
  }, ['ws', 'fs-extra']),
  generateConfig(path.resolve('./src/client.ts'), {
    file: './dist/client.js',
    format: 'umd',
    sourcemap: false,
  }),
  generateConfig(path.resolve('./src/hmr-client.ts'), {
    file: './dist/hmr-client.js',
    format: 'umd',
    sourcemap: false,
  })
]
module.exports = configList