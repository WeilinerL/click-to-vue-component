setTimeout(() => {
  // 订阅自定义推送内容
  const socket = new WebSocket(`ws://${location.hostname}:${window.__vueSourceCodeLocWsPort}`)

  socket.addEventListener('open', () => {
    console.log('[click-to-vue-component] Connected to SelfDefine WebSocket server')
  })

  socket.addEventListener('message', (event) => {
    const data = event.data
    try {
      window.__vueSourceCodeLocMap = JSON.parse(data || '{}')
    } catch {}
  })

  socket.addEventListener('close', () => {
    console.log('[click-to-vue-component] Disconnected from SelfDefine WebSocket server')
  })
}, 100)