import CryptoJS from 'crypto-js'
import { HtmlTags } from 'html-tags'
import { parseFragment } from 'parse5'

function getSourceWithSourceCodeLocation({
  source,
  filePath,
  htmlTags,
}: {
  source: string
  filePath: string
  htmlTags: readonly HtmlTags[]
}) {
  const ast = parseFragment(source, {
    sourceCodeLocationInfo: true,
  })

  let allNodes: any[] = [ast]
  let nodeIndex = 0
  while (allNodes.length > nodeIndex) {
    allNodes = allNodes.concat(
      allNodes[nodeIndex]?.childNodes || [],
      allNodes[nodeIndex]?.content?.childNodes || [],
    )

    nodeIndex++
  }

  const startOffsetSet = new Set()

  const sortedNodes = allNodes
    .filter((node) => {
      if (!node?.sourceCodeLocation?.startOffset) {
        return false
      }

      const { startOffset } = node.sourceCodeLocation

      if (startOffsetSet.has(startOffset)) {
        return false
      }

      startOffsetSet.add(startOffset)

      if (!htmlTags.includes(node?.nodeName) || ['template', 'script', 'style', 'slot'].includes(node?.nodeName)) {
        return false
      }

      return true
    })
    .sort(
      (a, b) =>
        b.sourceCodeLocation.startOffset - a.sourceCodeLocation.startOffset,
    )

  let result = source

  sortedNodes.forEach((node) => {
    const { startOffset, startLine, startCol } = node.sourceCodeLocation
    const codeLoc = `${filePath}:${startLine}:${startCol}`
    const hash = CryptoJS.MD5(codeLoc).toString().substring(0, 8)
    const sourceCodeLocation = ` data-code-loc='${hash}' `
    const insertPos = startOffset + node.nodeName.length + 1
    global.__vueSourceCodeLocMap[hash] = codeLoc
    result =
      result.substring(0, insertPos) +
      sourceCodeLocation +
      result.substring(insertPos)
  })

  return result
}

export { getSourceWithSourceCodeLocation }
