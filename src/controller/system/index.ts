import { Service } from 'typedi';
import { JsonController, Get, Post, Body } from 'routing-controllers';
import { BaseController } from '../base';
import { SystemConfig } from '../../types';
import { Certificate } from '../../shared/certificate';
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
      cacheDir: Configuration.BASE_CACHE_DIR,
    });
  }

  @Post('/config')
  async updateConfig(@Body() config: Partial<SystemConfig & { certificateUrl?: unknown }>) {
    delete config.certificateUrl;

    this.storage.system.setConfig({
      originSystemProxyPort: undefined,
      ...config,
    });

    return this.success(true);
  }
}
