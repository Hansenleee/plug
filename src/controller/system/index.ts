import { Service } from 'typedi';
import { JsonController, Get, Post, Body } from 'routing-controllers';
import { BaseController } from '../base';
import { SystemConfig } from '../../types';
import { Certificate } from '../../shared/certificate';
import { Logger } from '../../shared/log';
import systemProxy from '../../shared/system-proxy';
import { Configuration } from '../../configuration';

@Service()
@JsonController('/system')
export class SystemController extends BaseController {
  @Get('/config')
  async getConfig() {
    const systemConfig = this.storage.system.getConfig();
    const certificateUrl = Certificate.CRT_QR_CODE;

    return this.success({
      ...systemConfig,
      certificateUrl,
      proxyPort: Configuration.PROXY_PORT,
      cacheDir: Configuration.BASE_CACHE_DIR,
      logDir: Logger.DIR,
      certificateDir: Certificate.BASE_DIR,
    });
  }

  @Post('/config')
  async updateConfig(@Body() config: Partial<SystemConfig & { certificateUrl?: unknown }>) {
    this.storage.system.setConfig({
      originSystemProxyPort: config.originSystemProxyPort,
    });

    return this.success(true);
  }

  @Post('/config/llm')
  async updateLLMConfig(@Body() config: Partial<SystemConfig>) {
    this.storage.system.setConfig(config);

    return this.success(true);
  }

  @Get('/proxy/status')
  async getGlobalProxyStatus() {
    const statusStdout = await systemProxy.getStatus();
    const enabled = statusStdout.match(/Enabled: (\w+)/)[1];
    const port = statusStdout.match(/Port: (\d+)/)[1];

    return this.success({
      enabled: enabled === 'Yes' && port === `${Configuration.PROXY_PORT}`,
    });
  }

  @Post('/proxy/toggle')
  async toggleGlobalProxy(@Body() config: { enabled: boolean }) {
    const { enabled } = config;

    if (enabled) {
      await systemProxy.setProxy('127.0.0.1', `${Configuration.PROXY_PORT}`);
    } else {
      await systemProxy.closeProxy();
    }

    return this.success(true);
  }
}
