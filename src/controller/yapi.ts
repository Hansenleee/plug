import { Service } from 'typedi';
import type { Context } from 'koa';
import { nanoid } from 'nanoid';
import { BaseController } from './base';

@Service()
export class YapiController extends BaseController {
  private static readonly STORAGE_PREFIX = 'yapi';
  private static readonly CONFIG_STORAGE_KEY = `${YapiController.STORAGE_PREFIX}-config`;

  async getConfig(ctx: Context) {
    const config = this.storage.mock.get(YapiController.CONFIG_STORAGE_KEY);

    ctx.body = this.success(config || {});
  }

  async setConfig(ctx: Context) {
    const { host } = ctx.request.body;

    this.storage.mock.setMap(YapiController.CONFIG_STORAGE_KEY, { host });

    ctx.body = this.success(true);
  }

  async addById(ctx: Context) {
    const { yapiId, token, dataType } = ctx.request.body;
    const interfaceInfo = await this.service.yapi.fetchInterface({ id: yapiId, token });
    const commonData = {
      id: nanoid(),
      title: interfaceInfo.title,
      path: interfaceInfo.path,
      method: interfaceInfo.method,
      dataType,
      apiType: 'yapi',
      enable: true,
    };
    const yapiList = this.storage.mock.getApiList();
    const exist = yapiList.find((yapi) => yapi.path === interfaceInfo.path);

    if (exist) {
      ctx.body = this.error(10010, '当前 yapi 接口已存在，请不用重复添加');

      return;
    }

    if (dataType === 'url') {
      const config = this.storage.mock.get(YapiController.CONFIG_STORAGE_KEY);
      const projectInfo = await this.service.yapi.fetchProjectInfo(token);

      this.storage.mock.appendApi({
        ...commonData,
        mockUrl: `${config.host}/mock/${projectInfo._id}${interfaceInfo.path}`,
      });
    } else {
      this.storage.mock.appendApi({
        ...commonData,
      });
    }

    ctx.body = this.success(true);
  }

  async delete(ctx: Context) {
    const { id } = ctx.request.body;

    this.required(ctx.request.body, ['id']);
    this.storage.mock.deleteApi(id);

    ctx.body = this.success(true);
  }

  async getYapiListByPage(ctx: Context) {
    const { apiType, page } = ctx.request.body;

    this.required(ctx.request.body, ['page']);

    const yapiList = this.storage.mock.getApiList().filter((item) => item.apiType === apiType);

    ctx.body = this.page(yapiList, page);
  }
}
