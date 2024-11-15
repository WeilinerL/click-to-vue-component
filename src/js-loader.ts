export default function (source: string) {
  try {
    const { resourcePath } = this
    const lines = source.split(/\r|\n/g)
    const newLinse = lines.slice()

    lines.forEach((str, index) => {
      const res = str.match(/console.log\(.*?\)\s*$/g)
      if (res) {
        const ln = index + 1
        const col = str.indexOf('console') + 1
        newLinse[index] += `; console.log('%c查看源码%cvscode://file${resourcePath}%3A${ln}%3A${col}', 'padding: 1px 3px; border-radius: 6px; background-color: #ff6400; color: #fff;', 'font-size: 0.8px; line-height: 18px; background: transparent; margin-left: -48px;')`
      }
    })

    // 返回修改后的源代码
    return newLinse.join('\n')
  } catch (error) {
    console.log(error)
    return source
  }
}
