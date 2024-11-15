import path from 'path'
import { getWsInstance } from './ws'
import { readFileSync, ensureFileSync, writeFileSync } from 'fs-extra'

const CACHE = path.resolve(__dirname, '../.cache/vueSourceCodeLocMap.json')
const pkg = require(path.resolve(__dirname, '../package.json'))
const clientCode = readFileSync(path.resolve(__dirname, './client.js'))
const log = 
`
console.log(
  '%c ${pkg.name} %c enabled v${pkg.version} %c',
  'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
  'background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
  'background:transparent'
)
console.log('%c 按住 "option + 点击页面元素" 查看组件源码 ', 'padding: 1px; border-left: 3px solid #007aff;');
`

export default class VueClickToComponentPlugin {
  
  apply(compiler) {
    compiler.hooks.beforeCompile.tapAsync('ClickToVueComponentBeforeRunPlugin', (compilation, callback) => {
      ensureFileSync(CACHE)
      global.__vueSourceCodeLocMap = global.__vueSourceCodeLocMap || JSON.parse(readFileSync(CACHE).toString() || '{}')
      callback()
    })
    compiler.hooks.emit.tapAsync('ClickToVueComponentPlugin', (compilation, callback) => {
      // 找到生成的 index.html 文件
      const indexHtml = compilation.assets['index.html']
      if (indexHtml) {
        // 获取当前 HTML 内容
        let content = indexHtml.source()
        const vueSourceCodeLocMap = JSON.stringify(global.__vueSourceCodeLocMap) 
        const codeLocMap = `\nwindow.__vueSourceCodeLocMap = ${vueSourceCodeLocMap};\nwindow.__vueSourceCodeLocWsPort = ${global.__vueSourceCodeLocWsPort}`
        // 插入 JavaScript 代码
        content = content.replace('</body>', `<script>${log}${clientCode}${codeLocMap}</script></body>`)
        
        // 更新 HTML 内容
        compilation.assets['index.html'] = {
          source: () => content,
          size: () => content.length
        }
        writeFileSync(CACHE, vueSourceCodeLocMap)
        // 监听客户端连接
        getWsInstance().then(ws => {
          ws.send(vueSourceCodeLocMap)
        })
      }
      callback()
    })
  }
}
