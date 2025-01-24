import path from 'path';
import os from 'os';

interface InitOption {
  port?: number;
  debug?: boolean;
  originProxyPort?: number;
  source?: PlugSource;
  skipUpgrade?: boolean;
}

export enum PlugSource {
  APP = 'APP',
  COMMAND = 'COMMAND',
  ORPHAN = 'ORPHAN',
}

export class Configuration {
  static BASE_CACHE_DIR = path.join(os.homedir(), '.plug-cache');

  static PROXY_PORT = 8001;
  static HTTPS_PROXY_PORT = 8090;

  static MANAGEMENT_PORT = 9001;
  static MANAGEMENT_WEBPACK_DEV_PORT = 3000;

  static PROXY_HOST = '127.0.0.1';

  static IS_DEBUG = false;
  static SKIP_UPGRADE = false;

  // 全局代理端口
  static ORIGIN_PROXY_PORT?: number;

  // ui 产物地址
  static UI_BUILD_DIR = path.join(__dirname, '..', 'ui-dist');

  // npm 源
  static NPM_REGISTRY = 'https://registry.npmmirror.com';

  static init(option: InitOption) {
    Configuration.PROXY_PORT = option.port || Configuration.PROXY_PORT;
    Configuration.IS_DEBUG = option.debug !== undefined ? !!option.debug : Configuration.IS_DEBUG;
    Configuration.ORIGIN_PROXY_PORT = option.originProxyPort;
    Configuration.SKIP_UPGRADE = !!option.skipUpgrade;

    process.env.PLUG_SOURCE = option.source || PlugSource.COMMAND;
  }
}
