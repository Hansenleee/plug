import { Service } from 'typedi';
import type { Context } from 'koa';
import { BaseController } from './base';

@Service()
export class YapiController extends BaseController {
  async addById(ctx: Context) {
    const { yapiId, token } = ctx.request.body;
    const interfaceInfo = await this.service.yapi.fetchInterface({ id: yapiId, token });

    ctx.body = this.success(interfaceInfo);
  }
}
