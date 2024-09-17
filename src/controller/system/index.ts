import { Service } from 'typedi';
import { JsonController, Get, Post, Body } from 'routing-controllers';
import { BaseController } from '../base';
import { SystemConfig } from '../../types';

@Service()
@JsonController('/system')
export class SystemController extends BaseController {
  @Get('/config')
  async getConfig() {
    return this.success(this.storage.system.getConfig());
  }

  @Post('/config')
  async updateConfig(@Body() config: Partial<SystemConfig>) {
    this.storage.system.setConfig(config);

    return this.success(true);
  }
}
