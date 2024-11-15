export {}; // 让 TypeScript 将其视为模块文件，以避免全局命名空间冲突。

declare global {
  interface Window {
    __vueSourceCodeLocWsPort: string
    __vueSourceCodeLocMap: Record<string, string>
    __VUE_CLICK_TO_COMPONENT_URL_FUNCTION__: Function
  }
}