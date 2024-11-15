# click-to-vue-component
快速定位Vue组件源码

## 使用方法

### 1. 安装
```
npm install click-to-vue-component -D
```

### 2. 配置

在项目根目录的`vue.config.js`文件中添加以下代码：

```diff
const { defineConfig } = require('@vue/cli-service')
+const clickToVueComponent = require('click-to-vue-component')

module.exports = defineConfig({
+  chainWebpack: (config) => {
+    clickToVueComponent(config)
+  }
})
```

### 3. 使用
启动项目，打开测试页面，按住`option`，然后点击页面上的任意元素即可跳转到vscode源码所在位置。
