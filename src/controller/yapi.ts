import { Service } from 'typedi';
import type { Context } from 'koa';
import { BaseController } from './base';

@Service()
export class YapiController extends BaseController {
  async addById(ctx: Context) {
    const { yapiId, token } = ctx.request.body;
    const interfaceInfo = (await this.service.yapi.fetchInterface({ id: yapiId, token })) as {
      title: string;
    };

    this.storage.mock.setItem({ title: interfaceInfo.title });

    ctx.body = this.success(interfaceInfo);
  }
}
