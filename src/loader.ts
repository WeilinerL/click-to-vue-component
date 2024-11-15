import htmlTags  from 'html-tags'
import { getSourceWithSourceCodeLocation } from './parser'

export default function (source: string) {
  try {
    const { resourcePath } = this
    const sourceWithSourceCodeLocation = getSourceWithSourceCodeLocation({
      source,
      filePath: resourcePath,
      htmlTags,
    })

    return sourceWithSourceCodeLocation
  } catch (error) {
    console.error('[click-to-vue-component-loader] error', {
      // file: id,
      error: error && error.message,
    })

    return source
  }
}
