interface InintOption {
  port?: number;
  debug?: boolean;
}

export class Configuration {
  static PROXY_PORT = 8001;
  static HTTPS_PROXY_PORT = 8090;

  static MANAGEMENT_PORT = 9001;
  static MANAGEMENT_WEBPACK_DEV_PORT = 3000;

  static PROXY_HOST = '127.0.0.1';

  static IS_DEBUG = false;

  static init(option: InintOption) {
    Configuration.PROXY_PORT = option.port || Configuration.PROXY_PORT;
    Configuration.IS_DEBUG = option.debug !== undefined ? !!option.debug : Configuration.IS_DEBUG;
  }
}
