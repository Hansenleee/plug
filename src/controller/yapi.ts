import { Service } from 'typedi';
import type { Context } from 'koa';
import { nanoid } from 'nanoid';
import { BaseController } from './base';

@Service()
export class YapiController extends BaseController {
  private static readonly STORAGE_PREFIX = 'yapi';
  private static readonly CONFIG_STORAGE_KEY = `${YapiController.STORAGE_PREFIX}-config`;

  async getConfig(ctx: Context) {
    const config = this.storage.mock.getItem(YapiController.CONFIG_STORAGE_KEY);

    ctx.body = this.success(config || {});
  }

  async setConfig(ctx: Context) {
    const { host } = ctx.request.body;

    this.storage.mock.setMap(YapiController.CONFIG_STORAGE_KEY, { host });

    ctx.body = this.success(true);
  }

  async addById(ctx: Context) {
    const { yapiId, token } = ctx.request.body;
    const interfaceInfo = await this.service.yapi.fetchInterface({ id: yapiId, token });

    this.storage.mock.appendApi(YapiController.STORAGE_PREFIX, {
      id: nanoid(),
      title: interfaceInfo.title,
      path: interfaceInfo.path,
      method: interfaceInfo.method,
      resBody: interfaceInfo.res_body,
      enable: true,
    });

    ctx.body = this.success(interfaceInfo);
  }
}
