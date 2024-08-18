import path from 'path';

interface InitOption {
  port?: number;
  debug?: boolean;
  originProxyPort?: number;
}

export class Configuration {
  static PROXY_PORT = 8001;
  static HTTPS_PROXY_PORT = 8090;

  static MANAGEMENT_PORT = 9001;
  static MANAGEMENT_WEBPACK_DEV_PORT = 3000;

  static PROXY_HOST = '127.0.0.1';

  static IS_DEBUG = false;
  // 全局代理端口
  static ORIGIN_PROXY_PORT?: number;

  // ui 产物地址
  static UI_BUILD_DIR = path.join(__dirname, '..', 'ui-dist');

  static init(option: InitOption) {
    Configuration.PROXY_PORT = option.port || Configuration.PROXY_PORT;
    Configuration.IS_DEBUG = option.debug !== undefined ? !!option.debug : Configuration.IS_DEBUG;
    Configuration.ORIGIN_PROXY_PORT = option.originProxyPort;
  }
}
