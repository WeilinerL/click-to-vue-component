export default function (source: string) {
  try {
    const { resourcePath } = this
    if (/main\.(t|j)s$/.test(resourcePath)) {
      return `import 'click-to-vue-component/dist/hmr-client'\n${source}`
    }
    return source
  } catch (error) {
    // console.log(error)
    return source
  }
}
