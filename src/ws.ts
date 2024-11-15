import WebSocket, { WebSocketServer } from 'ws'

let wsInstance
function getWsInstance(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    if (wsInstance) {
      resolve(wsInstance)
    }
    const wss = new WebSocketServer({ port: global.__vueSourceCodeLocWsPort })
    wss.on('connection', (ws) => {
      wsInstance = ws
      resolve(ws)
    })
    wss.on('error', reject)
  })
}

export { getWsInstance }