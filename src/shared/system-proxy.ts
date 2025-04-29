const DarwinProxy = await import('cross-os-proxy/platforms/darwin/index.js');
const winProxy = await import('cross-os-proxy/platforms/win32/index.js');

const platform = process.platform.toLowerCase();
const currentOsProxy: any = platform === 'darwin' ? DarwinProxy : winProxy;

/**
 * set system proxy, includes http & https
 * @param {string} host proxy host eg: '127.0.0.1'
 * @param {number} port eg: 8001
 * @param {string} [username] eg: 'username'
 * @param {string} [password] eg: 'password'
 * @returns Promise
 */
async function setProxy(host, port, username?: string, password?: string) {
  return currentOsProxy.setProxy(host, port, username, password);
}

/**
 * close system proxy, includes http & https
 * @returns Promise
 */
async function closeProxy() {
  return currentOsProxy.closeProxy();
}

async function getStatus() {
  return currentOsProxy.getStatus();
}

export default {
  setProxy,
  closeProxy,
  getStatus,
};
