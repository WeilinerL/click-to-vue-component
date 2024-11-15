import { execSync } from 'child_process'

/**
 * 检查端口是否可用的同步方法
 * @param {number} port - 要检查的端口
 * @returns {boolean} - 是否可用
 */
function isPortAvailable(port) {
  try {
    execSync(`lsof -i :${port}`)
    return false // 端口不可用
  } catch (error) {
    return true // 端口可用 
  }
}

/**
 * 获取下一个可用端口，从给定的 startPort 开始
 * @param {number} startPort - 起始端口
 * @returns {number} - 可用端口
 */
function getAvailablePort(startPort = 3000) {
  let port = startPort
  while (!isPortAvailable(port)) {
    port += 1 // 如果端口被占用，检查下一个端口
  }
  return port // 返回可用端口
}

export { getAvailablePort }
