import { Service, Container } from 'typedi';
import gumingPlugin from './guming';
import { PluginApp } from './app';

@Service()
export class RootPlugin {
  private pluginApps: PluginApp[] = [];

  // TODO: 先写死，后续优化
  private plugins = [gumingPlugin];

  init() {
    this.registPlugins();
    this.invokeQueue('startQueue', []);
  }

  mockData(originMockData, mockInfo) {
    this.invokeQueue('mockQueue', [originMockData, mockInfo]);
  }

  private registPlugins() {
    this.plugins.forEach((plugin) => {
      const app = Container.get(PluginApp);

      plugin(app);
      this.pluginApps.push(app);
    });
  }

  private invokeQueue(queue: string, args: any[]) {
    this.pluginApps.forEach((pluginApp) => {
      pluginApp[queue].forEach(async (fn) => {
        await fn(...args);
      });
    });
  }
}
