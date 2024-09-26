import { PluginApp } from '../app';
import { IntelligentMock } from './mock';

const YAPI_NS = 'yapi';

export default (app: PluginApp) => {
  app.afterStart(async () => {
    const config = app.storage.mock.getConfig(YAPI_NS) || {};
    const initConfig: Record<string, any> = {};

    if (!config.host) {
      initConfig.host = 'https://yapi.iguming.net';
    }

    if (!config.mockHost?.length) {
      initConfig.mockHost = ['back.dev1.iguming.net', 'back.test1.iguming.net', '127.0.0.1'];
    }

    app.storage.mock.setConfig(YAPI_NS, {
      ...config,
      ...initConfig,
    });
  });

  app.defineMock(async (originMockData, mockInfo, request) => {
    return new IntelligentMock(originMockData, mockInfo, request).mock();
  });
};
