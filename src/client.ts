function setTarget(el, type = '') {
  el.setAttribute('click-to-vue-component-target', type)
}

function cleanTarget(type?: string) {
  let targetElList: NodeListOf<HTMLElement>

  if (type) {
    targetElList = document.querySelectorAll(
      `[click-to-vue-component-target='${type}']`,
    )
  } else {
    targetElList = document.querySelectorAll(
      '[click-to-vue-component-target]',
    )
  }

  targetElList.forEach((el) => {
    el.removeAttribute('click-to-vue-component-target')
  })
}

function checkHandleAltClick(clickEvent: MouseEvent) {
  if (!clickEvent.altKey || clickEvent.button !== 0) {
    return false
  }

  let el = clickEvent.target as HTMLElement

  try {
    while (
      el &&
      !el.hasAttribute('click-to-vue-component-ignore-alt-click')
    ) {
      el = el.parentElement
    }
  } catch (error) {
    return false
  }

  if (el) {
    return false
  }

  return true
}

function getElWithSourceCodeLocation(el: HTMLElement) {
  try {
    while (el && !el.dataset.codeLoc) {
      el = el.parentElement
    }
  } catch (error) {
    return null
  }

  return el
}

function openEditor(_sourceCodeLocation: string, elWithSourceCodeLocation?: HTMLElement) {
  const sourceCodeLocation = window.__vueSourceCodeLocMap[_sourceCodeLocation]
  if (!sourceCodeLocation) {
    console.error('[click-to-vue-component] 无法找到源码！', _sourceCodeLocation)
    return
  }
  // __VUE_CLICK_TO_COMPONENT_URL_FUNCTION__ can be async
  const urlPromise = Promise.resolve().then(() => {
    if (
      typeof window.__VUE_CLICK_TO_COMPONENT_URL_FUNCTION__ !== 'function'
    ) {
      // Fix https://github.com/zjffun/click-to-vue-component/issues/4
      if (sourceCodeLocation.startsWith('/')) {
        return `vscode://file${sourceCodeLocation}`
      }

      return `vscode://file/${sourceCodeLocation}`
    }

    return window.__VUE_CLICK_TO_COMPONENT_URL_FUNCTION__({
      sourceCodeLocation,
      element: elWithSourceCodeLocation,
    })
  })

  urlPromise
    .then((url) => {
      if (!url) {
        console.error(
          '[click-to-vue-component] url is empty, please check __VUE_CLICK_TO_COMPONENT_URL_FUNCTION__',
        )
        return
      }
      const iframe = document.querySelector('#vueSourceCodeLoc') as HTMLIFrameElement
      if (iframe) {
        iframe.src = url
      } else {
        const iframe = document.createElement('iframe')
        iframe.id = 'vueSourceCodeLoc'
        iframe.src = url
        iframe.style.display = 'none'
        document.body.appendChild(iframe)
      }
    })
    .catch((e) => {
      console.error(e)
    })
    .finally(() => {
      cleanTarget()
    })
}

// this funciton will update after click-to-vue-component-popover is defined
function hidePopover() {}

// Alt+Click CSS
document.head.insertAdjacentHTML(
  'beforeend',
  `
<style type='text/css' key='click-to-vue-component-style'>
[click-to-vue-component] * {
  pointer-events: auto !important
}

[click-to-vue-component-target] {
  cursor: var(--click-to-component-cursor, context-menu) !important
  outline: 1px auto !important
}

@supports (outline-color: Highlight) {
  [click-to-vue-component-target] {
    outline: var(--click-to-component-outline, 1px auto Highlight) !important
  }
}

@supports (outline-color: -webkit-focus-ring-color) {
  [click-to-vue-component-target] {
    outline: var(--click-to-component-outline, 1px auto -webkit-focus-ring-color) !important
  }
}
</style>`.trim(),
)

window.addEventListener(
  'click',
  (e: MouseEvent) => {
    hidePopover()

    if (checkHandleAltClick(e)) {
      const elWithSourceCodeLocation = getElWithSourceCodeLocation(e.target as HTMLElement)
      if (!elWithSourceCodeLocation) {
        return
      }

      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()

      const sourceCodeLocation =
        elWithSourceCodeLocation.dataset.codeLoc

      openEditor(sourceCodeLocation, elWithSourceCodeLocation)
    }
  },
  true,
)

window.addEventListener(
  'mousemove',
  (e) => {
    cleanTarget('hover')

    if (e.altKey) {
      document.body.setAttribute('click-to-vue-component', '')

      const elWithSourceCodeLocation = getElWithSourceCodeLocation(e.target as HTMLElement)

      if (!elWithSourceCodeLocation) {
        return
      }

      setTarget(elWithSourceCodeLocation, 'hover')
    } else {
      document.body.removeAttribute('click-to-vue-component')
    }
  },
  true,
)

window.addEventListener(
  'keyup',
  (e) => {
    if (e.altKey) {
      cleanTarget()
      document.body.removeAttribute('click-to-vue-component')
    }
  },
  true,
)

window.addEventListener(
  'blur',
  () => {
    cleanTarget()
    document.body.removeAttribute('click-to-vue-component')
  },
  true,
)

/* --- popover --- */
function initPopover() {
  if (customElements.get('click-to-vue-component-popover')) {
    console.warn('[click-to-vue-component] popover is already defined')
    return
  }

  function cleanAnchor() {
    document
      .querySelectorAll('[click-to-vue-component-anchor]')
      .forEach((el) => {
        el.removeAttribute('click-to-vue-component-anchor')
      })
  }

  function setAnchor(el) {
    el.setAttribute('click-to-vue-component-anchor', '')
  }

  function getElListWithSourceCodeLocation(el) {
    const elList = []

    let elWithSourceCodeLocation = getElWithSourceCodeLocation(el)

    while (elWithSourceCodeLocation) {
      elList.push(elWithSourceCodeLocation)
      elWithSourceCodeLocation = getElWithSourceCodeLocation(
        elWithSourceCodeLocation.parentElement,
      )
    }

    return elList
  }

  function getComponentInfoList(elList) {
    const componentInfoList = []

    for (const el of elList) {
      const componentInfo = {
        el,
        sourceCodeLocation: el.dataset.codeLoc,
        localName: el.localName,
      }

      componentInfoList.push(componentInfo)
    }

    return componentInfoList
  }

  class Popover extends HTMLElement {
    listEl
    componentInfoList
    static get observedAttributes() {
      return []
    }

    constructor() {
      super()

      this.componentInfoList = []

      this.setStyle()
      this.setForm()
    }

    updateComponentInfoList(componentInfoList) {
      this.componentInfoList = componentInfoList
      this.listEl.innerHTML = ''

      for (const item of componentInfoList) {
        const itemEL = document.createElement('li')
        itemEL.classList.add('click-to-vue-component-popover__list__item')

        const buttonEl = document.createElement('button')
        buttonEl.type = 'submit'
        buttonEl.value = item.sourceCodeLocation
        buttonEl.addEventListener('mouseenter', () => {
          setTarget(item.el, 'popover')
        })
        buttonEl.addEventListener('mouseleave', () => {
          cleanTarget()
        })
        buttonEl.innerHTML = `<code>&lt${item.localName}&gt</code>
<cite>${item.sourceCodeLocation}</cite>`

        itemEL.appendChild(buttonEl)

        this.listEl.appendChild(itemEL)
      }
    }

    setForm() {
      const formEl = document.createElement('form')
      formEl.addEventListener('submit', (e) => {
        e.preventDefault()

        const submitter = e.submitter

        if (submitter.tagName !== 'BUTTON') {
          return
        }

        const sourceCodeLocation = (submitter as any).value

        if (!sourceCodeLocation) {
          return
        }

        openEditor(sourceCodeLocation)
        hidePopover()
      })

      const listEl = document.createElement('ul')
      listEl.classList.add('click-to-vue-component-popover__list')
      formEl.appendChild(listEl)
      this.listEl = listEl

      this.appendChild(formEl)
    }

    setStyle() {
      const styleEl = document.createElement('style')
      styleEl.textContent = `
.click-to-vue-component-popover__list {
display: flex
flex-direction: column
gap: 2px
padding: 0
margin: 0
list-style: none
max-height: 300px
overflow-y: auto
}

.click-to-vue-component-popover__list__item {
button {
all: unset
box-sizing: border-box
outline: 0
display: flex
flex-direction: column
gap: 2px
width: 100%
padding: 4px
border-radius: 4px
font-size: 14px
font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace

&:hover, &:focus, &:active {
  cursor: pointer
  background: royalblue
  color: white

  code {
    color: white
  }
}

code {
  color: royalblue
}

cite {
  font-weight: normal
  font-style: normal
  font-size: 12px
  opacity: 0.5
}
}
}`

      this.appendChild(styleEl)
    }
  }

  customElements.define(
    'click-to-vue-component-popover',
    Popover
  )

  document.body.insertAdjacentHTML(
    'beforeend',
    `
<style type='text/css' key='click-to-component-popover-style'>
[click-to-vue-component-anchor] {
  anchor-name: --click-to-vue-component-component-anchor
}

click-to-vue-component-popover {
  position: fixed
  position-anchor: --click-to-vue-component-component-anchor
  position-area: bottom
  position-try-fallbacks: flip-block
  position-try-order: most-height

  margin: 0
}

@supports (inset-area: bottom) {
  click-to-vue-component-popover {
    inset-area: bottom
  }
}
</style>
<click-to-vue-component-popover popover='manual' click-to-vue-component-ignore-alt-click></click-to-vue-component-popover>`,
  )

  const clickToVueComponentPopoverEl = document.querySelector(
    'click-to-vue-component-popover',
  ) as Popover

  window.addEventListener(
    'contextmenu',
    (e) => {
      if (e.altKey && e.button === 2) {
        const elListWithSourceCodeLocationList =
          getElListWithSourceCodeLocation(e.target)

        if (elListWithSourceCodeLocationList.length === 0) {
          return
        }

        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()

        const componentInfoList = getComponentInfoList(
          elListWithSourceCodeLocationList,
        )
        clickToVueComponentPopoverEl.updateComponentInfoList(
          componentInfoList,
        )

        cleanAnchor()
        setAnchor(elListWithSourceCodeLocationList[0])
        // @ts-ignore
        clickToVueComponentPopoverEl.showPopover()

        (document.activeElement as HTMLElement).blur()
      }
    },
    true,
  )

  // @ts-ignore
  hidePopover = function () {
    try {
      clickToVueComponentPopoverEl.hidePopover()
      cleanAnchor()
    } catch (error) {
      console.error('[click-to-vue-component] hide popover failed', error)
    }
  }
}

try {
  initPopover()
} catch (error) {
  console.warn('[click-to-vue-component] init popover failed', error)
}