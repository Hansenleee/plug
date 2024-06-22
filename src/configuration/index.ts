interface InintOption {
  port?: number;
  debug?: boolean;
}

export class Configuration {
  static PROXY_PORT = 8001;
  static MANAGEMENT_PORT = 9001;

  static IS_DEBUG = false;

  static init(option: InintOption) {
    Configuration.PROXY_PORT = option.port || Configuration.PROXY_PORT;
    Configuration.IS_DEBUG = option.debug !== undefined ? !!option.debug : Configuration.IS_DEBUG;
  }
}
